import { Response } from 'express';
import type { CryptoNetwork, CryptoPaymentStatus } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/errorResponse.js';
import { CRYPTO_NETWORKS, isValidAddressForNetwork } from '../utils/cryptoAddress.js';
import { sendMail } from '../utils/mailer.js';
import { cryptoPaymentConfirmedEmail, cryptoPaymentRejectedEmail } from '../utils/emailTemplates.js';

function parseNetwork(raw: unknown): CryptoNetwork | null {
  return typeof raw === 'string' && (CRYPTO_NETWORKS as string[]).includes(raw)
    ? (raw as CryptoNetwork)
    : null;
}

// ---- Addresses ----

export const listAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const network = parseNetwork(req.query.network);
    const addresses = await prisma.cryptoAddress.findMany({
      where: network ? { network } : undefined,
      orderBy: [{ network: 'asc' }, { createdAt: 'asc' }],
    });
    res.status(200).json(addresses);
  } catch (error: unknown) {
    sendServerError(res, 'listAddresses', error);
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const network = parseNetwork(req.body.network);
    const address = typeof req.body.address === 'string' ? req.body.address.trim() : '';
    const label = typeof req.body.label === 'string' && req.body.label ? req.body.label.trim() : null;

    if (!network || !address) {
      res.status(400).json({ message: 'network and address are required' });
      return;
    }
    if (!isValidAddressForNetwork(network, address)) {
      res.status(400).json({ message: `That doesn't look like a valid ${network} address` });
      return;
    }

    const created = await prisma.cryptoAddress.create({ data: { network, address, label } });
    res.status(201).json(created);
  } catch (error: unknown) {
    sendServerError(res, 'createAddress', error);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.cryptoAddress.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    const data: { address?: string; label?: string | null; active?: boolean } = {};
    if (typeof req.body.address === 'string' && req.body.address.trim()) {
      const address = req.body.address.trim();
      if (!isValidAddressForNetwork(existing.network, address)) {
        res.status(400).json({ message: `That doesn't look like a valid ${existing.network} address` });
        return;
      }
      data.address = address;
    }
    if ('label' in req.body) {
      data.label = typeof req.body.label === 'string' && req.body.label ? req.body.label.trim() : null;
    }
    if (typeof req.body.active === 'boolean') {
      data.active = req.body.active;
    }

    const updated = await prisma.cryptoAddress.update({ where: { id: req.params.id }, data });
    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'updateAddress', error);
  }
};

/** Sets (or replaces) the admin-uploaded QR image for one address. */
export const uploadAddressQr = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.cryptoAddress.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ message: 'An image file is required' });
      return;
    }
    const updated = await prisma.cryptoAddress.update({
      where: { id: req.params.id },
      data: { qrImage: (file as unknown as { path: string }).path },
    });
    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'uploadAddressQr', error);
  }
};

export const removeAddressQr = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updated = await prisma.cryptoAddress.update({
      where: { id: req.params.id },
      data: { qrImage: null },
    });
    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'removeAddressQr', error);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const inUse = await prisma.cryptoPayment.findFirst({ where: { addressId: req.params.id } });
    if (inUse) {
      // Keep the audit trail on existing payments intact — deactivate instead
      // of deleting an address that a buyer has already been shown.
      await prisma.cryptoAddress.update({ where: { id: req.params.id }, data: { active: false } });
      res.status(200).json({ message: 'Address has payment history, so it was deactivated instead of deleted' });
      return;
    }
    await prisma.cryptoAddress.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Address deleted' });
  } catch (error: unknown) {
    sendServerError(res, 'deleteAddress', error);
  }
};

// ---- Payment review queue ----

const PAYMENT_INCLUDE = {
  address: { select: { network: true, address: true, label: true } },
  user: { select: { id: true, name: true, email: true } },
  property: { select: { id: true, title: true, coverImage: true } },
  deal: { select: { id: true, amount: true, currency: true } },
  reviewedBy: { select: { id: true, name: true, email: true } },
};

export const listPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.query.status as CryptoPaymentStatus | undefined;
    const valid = status && ['PENDING', 'CONFIRMED', 'REJECTED'].includes(status);
    const payments = await prisma.cryptoPayment.findMany({
      where: valid ? { status } : undefined,
      include: PAYMENT_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(payments);
  } catch (error: unknown) {
    sendServerError(res, 'listPayments', error);
  }
};

export const reviewPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = req.body.status;
    if (status !== 'CONFIRMED' && status !== 'REJECTED') {
      res.status(400).json({ message: 'status must be CONFIRMED or REJECTED' });
      return;
    }
    const existing = await prisma.cryptoPayment.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Payment not found' });
      return;
    }
    const updated = await prisma.cryptoPayment.update({
      where: { id: req.params.id },
      data: {
        status,
        reviewNote: typeof req.body.reviewNote === 'string' ? req.body.reviewNote.slice(0, 1000) : null,
        reviewedById: req.user!.id,
        reviewedAt: new Date(),
      },
      include: PAYMENT_INCLUDE,
    });

    // Best-effort — sendMail never throws, so a notification failure can
    // never turn a successful review into a failed response.
    const templateInput = {
      network: updated.network,
      address: updated.address.address,
      amountUsd: updated.amountUsd,
      propertyTitle: updated.property?.title ?? null,
      reviewNote: updated.reviewNote,
    };
    const { subject, html } =
      status === 'CONFIRMED' ? cryptoPaymentConfirmedEmail(templateInput) : cryptoPaymentRejectedEmail(templateInput);
    void sendMail({ to: updated.user.email, subject, html });

    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'reviewPayment', error);
  }
};

// ---- "How to buy crypto" guide images ----

export const listGuideImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const images = await prisma.cryptoGuideImage.findMany({
      orderBy: [{ network: 'asc' }, { step: 'asc' }, { createdAt: 'asc' }],
    });
    res.status(200).json(images);
  } catch (error: unknown) {
    sendServerError(res, 'listGuideImages', error);
  }
};

export const createGuideImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file as Express.Multer.File | undefined;
    if (!file) {
      res.status(400).json({ message: 'An image file is required' });
      return;
    }
    const network = parseNetwork(req.body.network); // null = generic, applies to every network
    const step = Number.isFinite(Number(req.body.step)) ? Number(req.body.step) : 0;
    const caption = typeof req.body.caption === 'string' && req.body.caption ? req.body.caption.slice(0, 300) : null;

    const created = await prisma.cryptoGuideImage.create({
      data: {
        network,
        step,
        caption,
        imageUrl: (file as unknown as { path: string }).path,
      },
    });
    res.status(201).json(created);
  } catch (error: unknown) {
    sendServerError(res, 'createGuideImage', error);
  }
};

export const deleteGuideImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.cryptoGuideImage.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Guide image deleted' });
  } catch (error: unknown) {
    sendServerError(res, 'deleteGuideImage', error);
  }
};

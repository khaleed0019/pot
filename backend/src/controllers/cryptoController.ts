import { Response } from 'express';
import { Prisma, type CryptoNetwork } from '@prisma/client';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/errorResponse.js';
import { CRYPTO_NETWORKS } from '../utils/cryptoAddress.js';

function parseNetwork(raw: unknown): CryptoNetwork | null {
  return typeof raw === 'string' && (CRYPTO_NETWORKS as string[]).includes(raw)
    ? (raw as CryptoNetwork)
    : null;
}

/**
 * Hands out the next active address for a network, round-robin, so the same
 * address isn't shown to every buyer in a row. Serializable isolation +
 * one retry covers the rare case of two buyers requesting the same network
 * in the same instant; anything beyond that is an acceptable, harmless
 * chance of a repeated address rather than a correctness bug.
 */
async function rotateNextAddress(network: CryptoNetwork) {
  const attempt = () =>
    prisma.$transaction(
      async (tx) => {
        const addresses = await tx.cryptoAddress.findMany({
          where: { network, active: true },
          orderBy: { createdAt: 'asc' },
        });
        if (addresses.length === 0) return null;

        const cursor = await tx.cryptoRotationCursor.findUnique({ where: { network } });
        const nextIndex = ((cursor?.lastIndex ?? -1) + 1) % addresses.length;

        await tx.cryptoRotationCursor.upsert({
          where: { network },
          create: { network, lastIndex: nextIndex },
          update: { lastIndex: nextIndex },
        });

        return addresses[nextIndex];
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

  try {
    return await attempt();
  } catch (error: unknown) {
    // P2034 = write conflict under Serializable isolation; safe to retry once.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return attempt();
    }
    throw error;
  }
}

export const requestAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const network = parseNetwork(req.params.network);
    if (!network) {
      res.status(400).json({ message: 'network must be BTC, ETH, or SOL' });
      return;
    }
    const address = await rotateNextAddress(network);
    if (!address) {
      res.status(404).json({ message: `No ${network} address is configured yet. Please check back shortly.` });
      return;
    }
    res.status(200).json({
      id: address.id,
      network: address.network,
      address: address.address,
      qrImage: address.qrImage,
    });
  } catch (error: unknown) {
    sendServerError(res, 'requestAddress', error);
  }
};

export const getGuide = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const network = parseNetwork(req.query.network);
    const images = await prisma.cryptoGuideImage.findMany({
      where: network ? { OR: [{ network }, { network: null }] } : undefined,
      orderBy: [{ step: 'asc' }, { createdAt: 'asc' }],
    });
    res.status(200).json(images);
  } catch (error: unknown) {
    sendServerError(res, 'getGuide', error);
  }
};

export const submitPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { network: rawNetwork, addressId, propertyId, dealId, amountUsd, txHash, note } = req.body;

    const network = parseNetwork(rawNetwork);
    if (!network || typeof addressId !== 'string') {
      res.status(400).json({ message: 'network and addressId are required' });
      return;
    }

    const address = await prisma.cryptoAddress.findUnique({ where: { id: addressId } });
    if (!address || address.network !== network) {
      res.status(400).json({ message: 'That address is no longer valid for this network. Please request a new one.' });
      return;
    }

    const file = req.file as Express.Multer.File | undefined;
    const hasTxHash = typeof txHash === 'string' && txHash.trim().length > 0;
    if (!file && !hasTxHash) {
      res.status(400).json({ message: 'Attach a payment screenshot or a transaction hash so we can verify it' });
      return;
    }

    if (propertyId && typeof propertyId === 'string') {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) {
        res.status(404).json({ message: 'Property not found' });
        return;
      }
    }
    if (dealId && typeof dealId === 'string') {
      const deal = await prisma.deal.findUnique({ where: { id: dealId } });
      if (!deal || (deal.clientId !== userId)) {
        res.status(403).json({ message: 'That deal does not belong to you' });
        return;
      }
    }

    const payment = await prisma.cryptoPayment.create({
      data: {
        network,
        addressId,
        propertyId: typeof propertyId === 'string' && propertyId ? propertyId : null,
        dealId: typeof dealId === 'string' && dealId ? dealId : null,
        userId,
        amountUsd: Number.isFinite(Number(amountUsd)) && Number(amountUsd) > 0 ? Number(amountUsd) : null,
        txHash: hasTxHash ? txHash.trim() : null,
        proofImage: file ? (file as unknown as { path: string }).path : null,
        note: typeof note === 'string' && note ? note.slice(0, 1000) : null,
      },
    });

    res.status(201).json(payment);
  } catch (error: unknown) {
    sendServerError(res, 'submitPayment', error);
  }
};

export const listMyPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const payments = await prisma.cryptoPayment.findMany({
      where: { userId },
      include: {
        address: { select: { network: true, address: true } },
        property: { select: { id: true, title: true, coverImage: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(payments);
  } catch (error: unknown) {
    sendServerError(res, 'listMyPayments', error);
  }
};

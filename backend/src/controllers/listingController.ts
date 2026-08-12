import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { findDuplicateListings } from '../utils/duplicateChecker.js';
import { logPropertyHistory } from '../utils/historyLogger.js';
import {
  bodyToDraftData,
  extractImageUrls,
  formatPropertyResponse,
  parseJsonArray,
} from '../utils/propertyHelpers.js';
import { sendServerError } from '../utils/errorResponse.js';
import type { PropertyStatus } from '@prisma/client';

const listingInclude = {
  owner: { select: { id: true, name: true, email: true } },
  agent: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
  history: { orderBy: { createdAt: 'desc' as const }, take: 20, include: { user: { select: { id: true, name: true, email: true } } } },
};

async function ensureAgentProfile(userId: string) {
  let agent = await prisma.agent.findUnique({ where: { userId } });
  if (!agent) {
    agent = await prisma.agent.create({ data: { userId } });
  }
  return agent;
}

async function getOwnedDraft(id: string, userId: string, role: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return null;
  if (role === 'ADMIN') return property;
  if (property.ownerId !== userId) return null;
  return property;
}

export const createDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const agent = req.user!.role === 'AGENT' || req.user!.role === 'ADMIN'
      ? await ensureAgentProfile(userId)
      : null;

    const uploaded = extractImageUrls(req.files as Express.Multer.File[]);
    const data = bodyToDraftData(req.body, uploaded);

    const property = await prisma.property.create({
      data: {
        ...data,
        status: 'DRAFT',
        ownerId: userId,
        agentId: agent?.id ?? (typeof req.body.agentId === 'string' ? req.body.agentId : null),
        lastSavedAt: new Date(),
        draftStep: typeof data.draftStep === 'number' ? data.draftStep : 1,
      } as Parameters<typeof prisma.property.create>[0]['data'],
      include: listingInclude,
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId,
      action: 'CREATED',
      toStatus: 'DRAFT',
    });

    res.status(201).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'createDraft', error);
  }
};

export const getMyDrafts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const drafts = await prisma.property.findMany({
      where: {
        ownerId: req.user!.id,
        status: { in: ['DRAFT', 'REJECTED', 'PENDING'] },
      },
      orderBy: { lastSavedAt: 'desc' },
      include: listingInclude,
    });
    res.status(200).json(drafts.map((p) => formatPropertyResponse(p as never)));
  } catch (error: unknown) {
    sendServerError(res, 'getMyDrafts', error);
  }
};

/**
 * Every listing owned by the caller, in any status.
 *
 * `getMyDrafts` deliberately only returns work-in-progress (DRAFT/REJECTED/PENDING),
 * so the agent dashboard needs this to show live listings too. Optional
 * `?status=` narrows to a single status.
 */
export const getMyListings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requested = (req.query.status as string | undefined)?.toUpperCase();
    const allowed: PropertyStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED'];
    const status = allowed.find((s) => s === requested);

    const listings = await prisma.property.findMany({
      where: {
        ownerId: req.user!.id,
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: listingInclude,
    });
    res.status(200).json(listings.map((p) => formatPropertyResponse(p as never)));
  } catch (error: unknown) {
    sendServerError(res, 'getMyListings', error);
  }
};

export const getDraftById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await getOwnedDraft(req.params.id, req.user!.id, req.user!.role);
    if (!property) {
      res.status(404).json({ message: 'Draft not found' });
      return;
    }
    const full = await prisma.property.findUnique({
      where: { id: property.id },
      include: listingInclude,
    });
    res.status(200).json(formatPropertyResponse(full as never));
  } catch (error: unknown) {
    sendServerError(res, 'getDraftById', error);
  }
};

export const updateDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await getOwnedDraft(req.params.id, req.user!.id, req.user!.role);
    if (!existing) {
      res.status(404).json({ message: 'Draft not found' });
      return;
    }
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      res.status(400).json({ message: 'Only drafts or rejected listings can be edited' });
      return;
    }

    const uploaded = extractImageUrls(req.files as Express.Multer.File[]);
    const currentImages = parseJsonArray(existing.images);
    const mergedImages = uploaded.length ? [...currentImages, ...uploaded] : currentImages;
    const data = bodyToDraftData(req.body, mergedImages);
    if (uploaded.length && !data.coverImage && !existing.coverImage) {
      data.coverImage = uploaded[0];
    }

    const property = await prisma.property.update({
      where: { id: existing.id },
      data: {
        ...data,
        status: 'DRAFT',
        lastSavedAt: new Date(),
      } as Parameters<typeof prisma.property.update>[0]['data'],
      include: listingInclude,
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'DRAFT_SAVED',
      fromStatus: existing.status,
      toStatus: 'DRAFT',
      note: `Step ${property.draftStep}`,
    });

    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'updateDraft', error);
  }
};

export const checkDuplicates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await getOwnedDraft(req.params.id, req.user!.id, req.user!.role);
    if (!existing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }
    const images = parseJsonArray(existing.images);
    const duplicates = await findDuplicateListings({
      id: existing.id,
      title: existing.title,
      address: existing.address,
      price: existing.price,
      lat: existing.lat,
      lng: existing.lng,
      images,
    });
    res.status(200).json({ duplicates, hasDuplicates: duplicates.length > 0 });
  } catch (error: unknown) {
    sendServerError(res, 'checkDuplicates', error);
  }
};

export const submitForReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await getOwnedDraft(req.params.id, req.user!.id, req.user!.role);
    if (!existing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }
    if (!['DRAFT', 'REJECTED'].includes(existing.status)) {
      res.status(400).json({ message: 'Listing cannot be submitted in its current status' });
      return;
    }

    const images = parseJsonArray(existing.images);
    if (!existing.title?.trim() || !existing.address?.trim() || images.length < 3) {
      res.status(400).json({
        message: 'Complete title, address, and upload at least 3 photos before submitting',
      });
      return;
    }

    const duplicates = await findDuplicateListings({
      id: existing.id,
      title: existing.title,
      address: existing.address,
      price: existing.price,
      lat: existing.lat,
      lng: existing.lng,
      images,
    });

    const property = await prisma.property.update({
      where: { id: existing.id },
      data: { status: 'PENDING', lastSavedAt: new Date() },
      include: listingInclude,
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'SUBMITTED',
      fromStatus: existing.status,
      toStatus: 'PENDING',
    });

    res.status(200).json({
      property: formatPropertyResponse(property as never),
      duplicates,
      hasDuplicates: duplicates.length > 0,
    });
  } catch (error: unknown) {
    sendServerError(res, 'submitForReview', error);
  }
};

export const getAgentStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const listings = await prisma.property.findMany({
      where: { ownerId: userId },
      select: { status: true, listingViews: true, totalLeads: true, type: true },
    });
    const total = listings.length;
    const published = listings.filter((l) => l.status === 'PUBLISHED').length;
    const pending = listings.filter((l) => l.status === 'PENDING').length;
    const rejected = listings.filter((l) => l.status === 'REJECTED').length;
    const views = listings.reduce((s, l) => s + l.listingViews, 0);
    const leads = listings.reduce((s, l) => s + l.totalLeads, 0);

    res.status(200).json({
      totalListings: total,
      published,
      pending,
      rejected,
      totalViews: views,
      totalLeads: leads,
      approvalRate: total ? Math.round((published / total) * 100) : 0,
    });
  } catch (error: unknown) {
    sendServerError(res, 'getAgentStats', error);
  }
};

import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { LeadType } from '@prisma/client';
import { logPropertyHistory } from '../utils/historyLogger.js';
import {
  bodyToDraftData,
  canViewProperty,
  extractImageUrls,
  formatPropertyResponse,
} from '../utils/propertyHelpers.js';
import { sendServerError } from '../utils/errorResponse.js';

const publicInclude = {
  agent: { include: { user: true } },
  investmentData: true,
};

export const getProperties = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, city, minPrice, maxPrice, bedrooms, bathrooms } = req.query;

    const filters: Record<string, unknown> = { status: 'PUBLISHED' };

    if (type) filters.type = type as string;
    if (city) filters.city = { contains: city as string, mode: 'insensitive' };

    if (minPrice || maxPrice) {
      const priceFilter: Record<string, number> = {};
      if (minPrice) {
        const min = parseFloat(minPrice as string);
        if (!Number.isNaN(min)) priceFilter.gte = min;
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice as string);
        if (!Number.isNaN(max)) priceFilter.lte = max;
      }
      if (Object.keys(priceFilter).length) filters.price = priceFilter;
    }

    if (bedrooms) {
      const b = parseInt(bedrooms as string, 10);
      if (!Number.isNaN(b)) filters.bedrooms = b;
    }
    if (bathrooms) {
      const b = parseInt(bathrooms as string, 10);
      if (!Number.isNaN(b)) filters.bathrooms = b;
    }

    const properties = await prisma.property.findMany({
      where: filters,
      include: publicInclude,
      orderBy: { approvedAt: 'desc' },
    });

    res.status(200).json(properties.map((p) => formatPropertyResponse(p as never)));
  } catch (error: unknown) {
    sendServerError(res, 'getProperties', error);
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        ...publicInclude,
        owner: { select: { id: true, name: true, email: true } },
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { user: { select: { id: true, name: true } } },
        },
      },
    });

    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    if (!canViewProperty(property, req.user)) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'getPropertyById', error);
  }
};

export const recordPropertyView = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property || property.status !== 'PUBLISHED') {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    const updated = await prisma.property.update({
      where: { id: property.id },
      data: { listingViews: { increment: 1 } },
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user?.id,
      action: 'VIEW_RECORDED',
    });

    res.status(200).json({ listingViews: updated.listingViews });
  } catch (error: unknown) {
    sendServerError(res, 'recordPropertyView', error);
  }
};

export const recordPropertyLead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { leadType } = req.body as { leadType: LeadType };
    const allowed: LeadType[] = ['WHATSAPP', 'CALL', 'INSPECTION', 'SHARE'];
    if (!allowed.includes(leadType)) {
      res.status(400).json({ message: 'Invalid lead type' });
      return;
    }

    const property = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!property || property.status !== 'PUBLISHED') {
      res.status(404).json({ message: 'Property not found' });
      return;
    }

    await prisma.propertyLead.create({
      data: {
        propertyId: property.id,
        userId: req.user?.id,
        leadType,
      },
    });
    const updated = await prisma.property.update({
      where: { id: property.id },
      data: { totalLeads: { increment: 1 } },
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user?.id,
      action: 'LEAD_RECORDED',
      note: leadType,
    });

    res.status(200).json({ totalLeads: updated.totalLeads });
  } catch (error: unknown) {
    sendServerError(res, 'recordPropertyLead', error);
  }
};

/** Legacy create — always creates a draft, never publishes */
export const createProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const uploaded = extractImageUrls(req.files as Express.Multer.File[]);
    const data = bodyToDraftData(req.body, uploaded);

    let agentId: string | null = typeof req.body.agentId === 'string' ? req.body.agentId : null;
    if (req.user!.role === 'AGENT' || req.user!.role === 'ADMIN') {
      const agent = await prisma.agent.upsert({
        where: { userId: req.user!.id },
        create: { userId: req.user!.id },
        update: {},
      });
      agentId = agent.id;
    }

    const property = await prisma.property.create({
      data: {
        ...data,
        status: 'DRAFT',
        ownerId: req.user!.id,
        agentId,
        lastSavedAt: new Date(),
      } as Parameters<typeof prisma.property.create>[0]['data'],
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'CREATED',
      toStatus: 'DRAFT',
    });

    res.status(201).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'createProperty', error);
  }
};

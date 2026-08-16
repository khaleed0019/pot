import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { logPropertyHistory } from '../utils/historyLogger.js';
import { formatPropertyResponse } from '../utils/propertyHelpers.js';
import { sendServerError } from '../utils/errorResponse.js';

export const toggleFavorite = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const propertyId = req.params.id;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property || property.status !== 'PUBLISHED') {
      res.status(404).json({ message: 'Published property not found' });
      return;
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      res.status(200).json({ saved: false });
      return;
    }

    await prisma.favorite.create({ data: { userId, propertyId } });
    await prisma.property.update({
      where: { id: propertyId },
      data: { totalLeads: { increment: 1 } },
    });
    await prisma.propertyLead.create({
      data: { propertyId, userId, leadType: 'SAVE' },
    });
    await logPropertyHistory({
      propertyId,
      userId,
      action: 'LEAD_RECORDED',
      note: 'SAVE',
    });

    res.status(200).json({ saved: true });
  } catch (error: unknown) {
    sendServerError(res, 'toggleFavorite', error);
  }
};

export const getMyFavorites = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          include: {
            // See propertyController.ts's publicInclude for why this can't be
            // a bare `user: true` — same password/authUid over-exposure.
            agent: { include: { user: { select: { id: true, name: true, profileImage: true } } } },
          },
        },
      },
    });
    // This endpoint skipped formatPropertyResponse, so amenities/images came
    // back as raw unparsed JSON strings instead of arrays — inconsistent
    // with every other property-returning endpoint.
    res.status(200).json(favorites.map((f) => formatPropertyResponse(f.property as never)));
  } catch (error: unknown) {
    sendServerError(res, 'getMyFavorites', error);
  }
};

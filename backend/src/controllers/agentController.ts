import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { sendServerError } from '../utils/errorResponse.js';

export const getAgents = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, city } = req.query;

    const filters: any = {};

    if (name) {
      filters.user = {
        name: { contains: name as string },
      };
    }

    // allow filtering by city (stored on listings/property)
    if (city) {
      // If we already have a user filter we need to keep conjunction
      filters.listings = {
        some: {
          city: { contains: city as string },
        },
      };
    }

    const agents = await prisma.agent.findMany({
      where: filters,
      include: {
        user: {
          select: { id: true, name: true, email: true, profileImage: true },
        },
        listings: true,
      },
    });

    res.status(200).json(agents);
  } catch (error: any) {
    sendServerError(res, 'getAgents', error);
  }
};

export const getAgentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        user: true,
        listings: true,
        reviews: { include: { user: true } },
      },
    });

    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    res.status(200).json(agent);
  } catch (error: any) {
    sendServerError(res, 'getAgentById', error);
  }
};

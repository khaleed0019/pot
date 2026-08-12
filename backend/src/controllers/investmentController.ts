import { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { sendServerError } from '../utils/errorResponse.js';

export const getInvestments = async (req: Request, res: Response): Promise<void> => {
  try {
    const investments = await prisma.property.findMany({
      where: {
        type: 'INVESTMENT',
        status: 'APPROVED',
      },
      include: {
        investmentData: true,
      },
    });

    res.status(200).json(investments);
  } catch (error: any) {
    sendServerError(res, 'getInvestments', error);
  }
};

export const getInvestmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const investment = await prisma.property.findUnique({
      where: { id },
      include: {
        investmentData: true,
        agent: true,
      },
    });

    if (!investment) {
      res.status(404).json({ message: 'Investment not found' });
      return;
    }

    res.status(200).json(investment);
  } catch (error: any) {
    sendServerError(res, 'getInvestmentById', error);
  }
};

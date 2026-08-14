import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendServerError } from '../utils/errorResponse.js';

const DEAL_INCLUDE = {
  property: {
    select: { id: true, title: true, price: true, currency: true, coverImage: true, address: true, city: true },
  },
  agent: { include: { user: { select: { id: true, name: true, email: true, profileImage: true } } } },
  client: { select: { id: true, name: true, email: true, profileImage: true } },
  installments: { orderBy: { seq: 'asc' as const } },
};

type InstallmentInput = { amount: number; dueDate: string };

/** Installments must be positive and sum to the deal amount (cent-level rounding tolerance). */
function validateInstallments(amount: number, installments: unknown): InstallmentInput[] | null {
  if (!Array.isArray(installments) || installments.length === 0) return null;
  let sum = 0;
  const parsed: InstallmentInput[] = [];
  for (const raw of installments) {
    const amt = Number((raw as { amount?: unknown })?.amount);
    const dueDate = (raw as { dueDate?: unknown })?.dueDate;
    if (!Number.isFinite(amt) || amt <= 0 || typeof dueDate !== 'string' || isNaN(Date.parse(dueDate))) {
      return null;
    }
    sum += amt;
    parsed.push({ amount: amt, dueDate });
  }
  if (Math.abs(sum - amount) > 0.01) return null;
  return parsed;
}

/** Resolves whether the requester is the AGENT or CLIENT side of a given agent/client pair. */
async function partyForAgent(agentId: string, userId: string): Promise<'AGENT' | null> {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  return agent && agent.userId === userId ? 'AGENT' : null;
}

export const createDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { propertyId, amount, currency, paymentPlan, installments, note, clientId } = req.body;

    if (!propertyId || !Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      res.status(400).json({ message: 'propertyId and a positive amount are required' });
      return;
    }
    const plan = paymentPlan === 'INSTALLMENT' ? 'INSTALLMENT' : 'FULL';

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    if (!property.agentId) {
      res.status(400).json({ message: 'This listing has no agent assigned yet' });
      return;
    }

    const proposerParty = await partyForAgent(property.agentId, userId);
    let finalClientId: string;
    if (proposerParty === 'AGENT') {
      if (!clientId || typeof clientId !== 'string') {
        res.status(400).json({ message: 'clientId is required when an agent proposes a deal' });
        return;
      }
      finalClientId = clientId;
    } else {
      finalClientId = userId;
    }

    if (finalClientId === property.agentId) {
      res.status(400).json({ message: 'The agent cannot be the client on their own listing' });
      return;
    }

    const existing = await prisma.deal.findFirst({
      where: { propertyId, clientId: finalClientId, status: { in: ['PROPOSED', 'COUNTERED'] } },
    });
    if (existing) {
      res.status(409).json({ message: 'An active deal already exists for this property', dealId: existing.id });
      return;
    }

    let installmentRows: InstallmentInput[] = [];
    if (plan === 'INSTALLMENT') {
      const valid = validateInstallments(Number(amount), installments);
      if (!valid) {
        res.status(400).json({ message: 'Installments must be positive amounts with valid due dates summing to the total amount' });
        return;
      }
      installmentRows = valid;
    }

    const proposedBy: 'AGENT' | 'CLIENT' = proposerParty === 'AGENT' ? 'AGENT' : 'CLIENT';

    const deal = await prisma.deal.create({
      data: {
        propertyId,
        agentId: property.agentId,
        clientId: finalClientId,
        amount: Number(amount),
        currency: typeof currency === 'string' && currency ? currency : property.currency || 'USD',
        paymentPlan: plan,
        status: 'PROPOSED',
        lastProposedBy: proposedBy,
        agentAgreed: proposedBy === 'AGENT',
        clientAgreed: proposedBy === 'CLIENT',
        note: typeof note === 'string' ? note : null,
        installments: installmentRows.length
          ? { create: installmentRows.map((i, idx) => ({ seq: idx + 1, amount: i.amount, dueDate: new Date(i.dueDate) })) }
          : undefined,
      },
      include: DEAL_INCLUDE,
    });

    res.status(201).json(deal);
  } catch (error: unknown) {
    sendServerError(res, 'createDeal', error);
  }
};

export const listMyDeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const agent = await prisma.agent.findUnique({ where: { userId } });

    const deals = await prisma.deal.findMany({
      where: agent ? { OR: [{ agentId: agent.id }, { clientId: userId }] } : { clientId: userId },
      include: DEAL_INCLUDE,
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json(deals);
  } catch (error: unknown) {
    sendServerError(res, 'listMyDeals', error);
  }
};

/** Loads a deal and, if the requester is a party to it (or admin), returns [deal, party]. */
async function loadDealForParty(dealId: string, req: AuthRequest) {
  const deal = await prisma.deal.findUnique({ where: { id: dealId }, include: DEAL_INCLUDE });
  if (!deal) return { deal: null, party: null } as const;

  const userId = req.user!.id;
  if (req.user!.role === 'ADMIN') return { deal, party: 'ADMIN' as const };
  if (deal.agent.userId === userId) return { deal, party: 'AGENT' as const };
  if (deal.clientId === userId) return { deal, party: 'CLIENT' as const };
  return { deal, party: null } as const;
}

export const getDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deal, party } = await loadDealForParty(req.params.id, req);
    if (!deal) {
      res.status(404).json({ message: 'Deal not found' });
      return;
    }
    if (!party) {
      res.status(403).json({ message: 'Not a party to this deal' });
      return;
    }
    res.status(200).json(deal);
  } catch (error: unknown) {
    sendServerError(res, 'getDeal', error);
  }
};

export const updateDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deal, party } = await loadDealForParty(req.params.id, req);
    if (!deal) {
      res.status(404).json({ message: 'Deal not found' });
      return;
    }
    if (party !== 'AGENT' && party !== 'CLIENT') {
      res.status(403).json({ message: 'Only the agent or client on this deal can change its terms' });
      return;
    }
    if (deal.status === 'AGREED' || deal.status === 'CANCELLED') {
      res.status(400).json({ message: `Deal is already ${deal.status.toLowerCase()} and can no longer be edited` });
      return;
    }

    const { amount, paymentPlan, installments, note } = req.body;
    const nextAmount = amount !== undefined ? Number(amount) : deal.amount;
    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      res.status(400).json({ message: 'amount must be a positive number' });
      return;
    }
    const nextPlan = paymentPlan === 'INSTALLMENT' || paymentPlan === 'FULL' ? paymentPlan : deal.paymentPlan;

    let installmentRows: InstallmentInput[] | null = null;
    if (nextPlan === 'INSTALLMENT') {
      const source = installments !== undefined
        ? installments
        : deal.installments.map((i) => ({ amount: i.amount, dueDate: i.dueDate.toISOString() }));
      const valid = validateInstallments(nextAmount, source);
      if (!valid) {
        res.status(400).json({ message: 'Installments must be positive amounts with valid due dates summing to the total amount' });
        return;
      }
      installmentRows = valid;
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (installmentRows) {
        await tx.installment.deleteMany({ where: { dealId: deal.id } });
      } else if (nextPlan === 'FULL' && deal.installments.length) {
        await tx.installment.deleteMany({ where: { dealId: deal.id } });
      }

      return tx.deal.update({
        where: { id: deal.id },
        data: {
          amount: nextAmount,
          paymentPlan: nextPlan,
          note: typeof note === 'string' ? note : deal.note,
          status: 'COUNTERED',
          lastProposedBy: party,
          agentAgreed: party === 'AGENT',
          clientAgreed: party === 'CLIENT',
          installments: installmentRows
            ? { create: installmentRows.map((i, idx) => ({ seq: idx + 1, amount: i.amount, dueDate: new Date(i.dueDate) })) }
            : undefined,
        },
        include: DEAL_INCLUDE,
      });
    });

    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'updateDeal', error);
  }
};

export const confirmDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deal, party } = await loadDealForParty(req.params.id, req);
    if (!deal) {
      res.status(404).json({ message: 'Deal not found' });
      return;
    }
    if (party !== 'AGENT' && party !== 'CLIENT') {
      res.status(403).json({ message: 'Only the agent or client on this deal can confirm it' });
      return;
    }
    if (deal.status === 'AGREED' || deal.status === 'CANCELLED') {
      res.status(400).json({ message: `Deal is already ${deal.status.toLowerCase()}` });
      return;
    }
    if (deal.lastProposedBy === party) {
      res.status(400).json({ message: 'You proposed these terms — waiting on the other party to confirm' });
      return;
    }

    const agentAgreed = party === 'AGENT' ? true : deal.agentAgreed;
    const clientAgreed = party === 'CLIENT' ? true : deal.clientAgreed;
    const bothAgreed = agentAgreed && clientAgreed;

    const updated = await prisma.deal.update({
      where: { id: deal.id },
      data: {
        agentAgreed,
        clientAgreed,
        status: bothAgreed ? 'AGREED' : deal.status,
        agreedAt: bothAgreed ? new Date() : null,
      },
      include: DEAL_INCLUDE,
    });

    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'confirmDeal', error);
  }
};

export const cancelDeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { deal, party } = await loadDealForParty(req.params.id, req);
    if (!deal) {
      res.status(404).json({ message: 'Deal not found' });
      return;
    }
    if (!party) {
      res.status(403).json({ message: 'Not a party to this deal' });
      return;
    }
    if (deal.status === 'CANCELLED') {
      res.status(200).json(deal);
      return;
    }

    const updated = await prisma.deal.update({
      where: { id: deal.id },
      data: { status: 'CANCELLED' },
      include: DEAL_INCLUDE,
    });

    res.status(200).json(updated);
  } catch (error: unknown) {
    sendServerError(res, 'cancelDeal', error);
  }
};

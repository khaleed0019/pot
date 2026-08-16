import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { logPropertyHistory } from '../utils/historyLogger.js';
import { formatPropertyResponse } from '../utils/propertyHelpers.js';
import { PropertyStatus, type Role } from '@prisma/client';
import { sendServerError } from '../utils/errorResponse.js';

const listingInclude = {
  owner: { select: { id: true, name: true, email: true } },
  agent: { include: { user: { select: { id: true, name: true, email: true } } } },
  reviewedBy: { select: { id: true, name: true, email: true } },
  history: {
    orderBy: { createdAt: 'desc' as const },
    take: 50,
    include: { user: { select: { id: true, name: true, email: true } } },
  },
};

function tabToStatuses(tab: string): PropertyStatus[] | undefined {
  switch (tab?.toLowerCase()) {
    case 'pending':
      return ['PENDING'];
    case 'approved':
      return ['APPROVED'];
    case 'rejected':
      return ['REJECTED'];
    case 'drafts':
      return ['DRAFT'];
    case 'published':
      return ['PUBLISHED'];
    default:
      return undefined;
  }
}

export const getAllPropertiesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tab = (req.query.tab as string) || (req.query.status as string);
    const statuses = tabToStatuses(tab);

    const properties = await prisma.property.findMany({
      where: statuses ? { status: { in: statuses } } : undefined,
      include: listingInclude,
      orderBy: { updatedAt: 'desc' },
    });
    res.status(200).json(properties.map((p) => formatPropertyResponse(p as never)));
  } catch (error: unknown) {
    sendServerError(res, 'getAllPropertiesAdmin', error);
  }
};

export const getPropertyAdminById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: listingInclude,
    });
    if (!property) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'getPropertyAdminById', error);
  }
};

export const approveProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNote } = req.body as { adminNote?: string };
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    if (existing.status !== 'PENDING') {
      res.status(400).json({ message: 'Only pending listings can be approved' });
      return;
    }

    const property = await prisma.property.update({
      where: { id: existing.id },
      data: {
        status: 'PUBLISHED',
        reviewedById: req.user!.id,
        approvedAt: new Date(),
        adminNote: adminNote ?? existing.adminNote,
        rejectionReason: null,
      },
      include: listingInclude,
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'APPROVED',
      fromStatus: 'PENDING',
      toStatus: 'APPROVED',
      note: adminNote,
    });
    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'PUBLISHED',
      fromStatus: 'APPROVED',
      toStatus: 'PUBLISHED',
      note: 'Auto-published after approval',
    });

    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'approveProperty', error);
  }
};

export const rejectProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { rejectionReason, adminNote } = req.body as { rejectionReason?: string; adminNote?: string };
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    if (existing.status !== 'PENDING') {
      res.status(400).json({ message: 'Only pending listings can be rejected' });
      return;
    }

    const property = await prisma.property.update({
      where: { id: existing.id },
      data: {
        status: 'REJECTED',
        reviewedById: req.user!.id,
        rejectionReason: rejectionReason || 'Rejected by admin',
        adminNote: adminNote ?? existing.adminNote,
      },
      include: listingInclude,
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'REJECTED',
      fromStatus: 'PENDING',
      toStatus: 'REJECTED',
      note: rejectionReason || adminNote,
    });

    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'rejectProperty', error);
  }
};

export const requestChanges = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { adminNote } = req.body as { adminNote?: string };
    const existing = await prisma.property.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ message: 'Property not found' });
      return;
    }
    if (!['PENDING', 'REJECTED'].includes(existing.status)) {
      res.status(400).json({ message: 'Cannot request changes for this listing status' });
      return;
    }

    const property = await prisma.property.update({
      where: { id: existing.id },
      data: {
        status: 'DRAFT',
        reviewedById: req.user!.id,
        adminNote: adminNote || existing.adminNote,
      },
      include: listingInclude,
    });

    await logPropertyHistory({
      propertyId: property.id,
      userId: req.user!.id,
      action: 'REQUESTED_CHANGES',
      fromStatus: existing.status,
      toStatus: 'DRAFT',
      note: adminNote,
    });

    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'requestChanges', error);
  }
};

export const updatePropertyStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body as { status: PropertyStatus };
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: { status },
      include: listingInclude,
    });
    res.status(200).json(formatPropertyResponse(property as never));
  } catch (error: unknown) {
    sendServerError(res, 'updatePropertyStatus', error);
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: 'Property deleted' });
  } catch (error: unknown) {
    sendServerError(res, 'deleteProperty', error);
  }
};

export const manageUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, suspended: true, createdAt: true },
    });
    res.status(200).json(users);
  } catch (error: unknown) {
    sendServerError(res, 'manageUsers', error);
  }
};

/**
 * Change a user's role.
 *
 * Refuses to demote the caller and refuses to remove the last remaining admin,
 * either of which would lock everyone out of the admin area with no way back in
 * short of editing the database directly. Promoting to AGENT also provisions the
 * Agent profile that listing endpoints expect.
 */
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const requested = (req.body as { role?: string })?.role;
    const allowed: Role[] = ['USER', 'AGENT', 'ADMIN'];
    const role = allowed.find((r) => r === requested);
    if (!role) {
      res.status(400).json({ message: 'Role must be one of USER, AGENT, ADMIN' });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (target.id === req.user!.id && role !== 'ADMIN') {
      res.status(400).json({ message: 'You cannot remove your own admin access' });
      return;
    }

    if (target.role === 'ADMIN' && role !== 'ADMIN') {
      const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (admins <= 1) {
        res.status(400).json({ message: 'Cannot demote the only remaining admin' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, suspended: true, createdAt: true },
    });

    if (role === 'AGENT') {
      await prisma.agent.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    }

    res.status(200).json(user);
  } catch (error: unknown) {
    sendServerError(res, 'updateUserRole', error);
  }
};

/**
 * Suspend or unsuspend an account. Reversible: blocks sign-in/API access
 * (checked in the auth middleware) without touching their listings or deals,
 * unlike deleteUser. Same self/last-admin guards as updateUserRole.
 */
export const updateUserSuspension = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const suspended = (req.body as { suspended?: unknown })?.suspended;
    if (typeof suspended !== 'boolean') {
      res.status(400).json({ message: '"suspended" must be true or false' });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (target.id === req.user!.id) {
      res.status(400).json({ message: 'You cannot suspend your own account' });
      return;
    }

    if (suspended && target.role === 'ADMIN') {
      const activeAdmins = await prisma.user.count({ where: { role: 'ADMIN', suspended: false } });
      if (activeAdmins <= 1) {
        res.status(400).json({ message: 'Cannot suspend the only remaining admin' });
        return;
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: { suspended },
      select: { id: true, email: true, name: true, role: true, suspended: true, createdAt: true },
    });

    res.status(200).json(user);
  } catch (error: unknown) {
    sendServerError(res, 'updateUserSuspension', error);
  }
};

/**
 * Permanently delete an account. Unlike suspension this is irreversible, so it
 * refuses outright if the account (or its agent profile) still owns listings,
 * deals, or reviews rather than silently cascading through someone's
 * portfolio — reassign or delete those first, or use suspend instead.
 */
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const target = await prisma.user.findUnique({
      where: { id },
      include: { agentProfile: true },
    });
    if (!target) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (target.id === req.user!.id) {
      res.status(400).json({ message: 'You cannot delete your own account' });
      return;
    }

    if (target.role === 'ADMIN') {
      const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (admins <= 1) {
        res.status(400).json({ message: 'Cannot delete the only remaining admin' });
        return;
      }
    }

    const [ownedCount, agentListingCount, dealCount] = await Promise.all([
      prisma.property.count({ where: { ownerId: id } }),
      target.agentProfile ? prisma.property.count({ where: { agentId: target.agentProfile.id } }) : 0,
      target.agentProfile
        ? prisma.deal.count({ where: { agentId: target.agentProfile.id } })
        : prisma.deal.count({ where: { clientId: id } }),
    ]);

    if (ownedCount > 0 || agentListingCount > 0 || dealCount > 0) {
      res.status(409).json({
        message:
          `Cannot delete: this account still has ${ownedCount} owned listing(s), ` +
          `${agentListingCount} agent listing(s), and ${dealCount} deal(s). ` +
          'Reassign or remove those first, or suspend the account instead.',
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      if (target.agentProfile) {
        await tx.agent.delete({ where: { id: target.agentProfile!.id } });
      }
      await tx.user.delete({ where: { id } });
    });

    res.status(200).json({ message: 'User deleted' });
  } catch (error: unknown) {
    sendServerError(res, 'deleteUser', error);
  }
};

export const getAgentAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, profileImage: true } },
        listings: {
          select: { status: true, listingViews: true, totalLeads: true, type: true },
        },
      },
    });

    const performance = agents.map((agent) => {
      const total = agent.listings.length;
      const published = agent.listings.filter((l) => l.status === 'PUBLISHED').length;
      const pending = agent.listings.filter((l) => l.status === 'PENDING').length;
      const rejected = agent.listings.filter((l) => l.status === 'REJECTED').length;
      const views = agent.listings.reduce((s, l) => s + l.listingViews, 0);
      const leads = agent.listings.reduce((s, l) => s + l.totalLeads, 0);
      const typeCount: Record<string, number> = {};
      agent.listings.forEach((l) => {
        typeCount[l.type] = (typeCount[l.type] || 0) + 1;
      });
      const topType = Object.entries(typeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

      return {
        agentId: agent.id,
        user: agent.user,
        totalListings: total,
        published,
        pending,
        rejected,
        approvalRate: total ? Math.round((published / total) * 100) : 0,
        rejectionRate: total ? Math.round((rejected / total) * 100) : 0,
        totalViews: views,
        totalLeads: leads,
        topPropertyType: topType,
      };
    });

    performance.sort((a, b) => b.published - a.published || b.totalLeads - a.totalLeads);

    const summary = {
      totalAgents: performance.length,
      totalListings: performance.reduce((s, a) => s + a.totalListings, 0),
      totalPublished: performance.reduce((s, a) => s + a.published, 0),
      totalLeads: performance.reduce((s, a) => s + a.totalLeads, 0),
      totalViews: performance.reduce((s, a) => s + a.totalViews, 0),
      topPerformingAgents: performance.slice(0, 5),
    };

    res.status(200).json({ summary, agents: performance });
  } catch (error: unknown) {
    sendServerError(res, 'getAgentAnalytics', error);
  }
};

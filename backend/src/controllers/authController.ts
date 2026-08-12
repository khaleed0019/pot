import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { claimsToProfile, verifySupabaseToken } from '../utils/supabaseAuth.js';
import { sendServerError } from '../utils/errorResponse.js';

export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token missing' });
      return;
    }

    const accessToken = authHeader.split(' ')[1];
    const claims = await verifySupabaseToken(accessToken);
    const { authUid, email, name, profileImage } = claimsToProfile(claims);
    if (!email) {
      res.status(400).json({ message: 'Your account must have an email address' });
      return;
    }

    const requestedRole = (req.body as { role?: string })?.role;

    let user = await prisma.user.findUnique({ where: { authUid } });
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } });
    }

    if (user) {
      // Never let the client change its own role here — a seeded ADMIN stays ADMIN,
      // and a USER cannot escalate by passing { role: 'AGENT' } on a later sync.
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          authUid,
          email,
          name: user.name ?? name,
          profileImage: profileImage ?? user.profileImage,
        },
      });
    } else {
      const role = requestedRole === 'AGENT' ? 'AGENT' : 'USER';
      user = await prisma.user.create({
        data: {
          email,
          authUid,
          name,
          profileImage,
          password: null,
          role,
        },
      });
      if (role === 'AGENT') {
        await prisma.agent.create({ data: { userId: user.id } });
      }
    }

    if (user.role === 'AGENT') {
      const agent = await prisma.agent.findUnique({ where: { userId: user.id } });
      if (!agent) {
        await prisma.agent.create({ data: { userId: user.id } });
      }
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error: unknown) {
    // The try block also performs DB writes, so the raw message could carry
    // internal details — keep the client-facing reason generic.
    console.error('syncUser', error);
    res.status(401).json({ message: 'Could not verify your sign-in. Please try again.' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profileImage: true,
      },
    });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (error: unknown) {
    sendServerError(res, 'getMe', error);
  }
};

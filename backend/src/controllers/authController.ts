import { Response } from 'express';
import prisma from '../utils/prisma.js';
import { AuthRequest } from '../middleware/auth.js';
import { claimsToProfile, verifySupabaseToken } from '../utils/supabaseAuth.js';
import { sendServerError } from '../utils/errorResponse.js';

export const syncUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization token missing' });
    return;
  }

  // Token verification is split into its own try/catch, separate from the DB
  // work below. Both used to share one catch-all that reported every failure
  // as 401 "Could not verify your sign-in" — including an ordinary DB
  // connectivity blip (this project's Supabase pooler is prone to those; see
  // the DATABASE_URL comment in .env). That's not just a mislabeled error:
  // the frontend now signs the user out locally on a genuine 401 to clear a
  // stale/expired token, so collapsing "your token is bad" and "our database
  // hiccuped" into the same status would sign people out over infra noise
  // that had nothing to do with their session.
  let claims: Awaited<ReturnType<typeof verifySupabaseToken>>;
  try {
    const accessToken = authHeader.split(' ')[1];
    claims = await verifySupabaseToken(accessToken);
  } catch (error: unknown) {
    console.error('syncUser: token verification failed', error);
    res.status(401).json({ message: 'Your session has expired. Please sign in again.' });
    return;
  }

  try {
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
    // Token already verified above — anything failing here is a DB/infra
    // problem, not a bad session, so it's a 500 (retry-worthy) not a 401
    // (sign-in-again-worthy).
    sendServerError(res, 'syncUser', error);
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

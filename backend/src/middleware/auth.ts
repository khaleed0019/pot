import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma.js';
import { verifySupabaseToken } from '../utils/supabaseAuth.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'USER' | 'AGENT' | 'ADMIN';
    authUid: string;
    suspended: boolean;
  };
}

async function resolveUserFromToken(token: string) {
  const claims = await verifySupabaseToken(token);
  const authUid = claims.sub;
  const email = claims.email;

  let user = await prisma.user.findUnique({ where: { authUid } });
  if (!user && email) {
    // Accounts can be seeded by email (e.g. the owner's ADMIN row) and get
    // linked to their auth identity on first sign-in. Role is left untouched.
    user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.authUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { authUid },
      });
    }
  }

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    role: user.role as 'USER' | 'AGENT' | 'ADMIN',
    authUid,
    suspended: user.suspended,
  };
}

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  void (async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      next();
      return;
    }
    try {
      const token = authHeader.split(' ')[1];
      const user = await resolveUserFromToken(token);
      // Suspended visitors fall back to anonymous here rather than erroring —
      // this middleware guards public-ish routes (property detail, leads).
      if (user && !user.suspended) req.user = user;
      next();
    } catch {
      next();
    }
  })();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  void (async () => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authorization token missing' });
      return;
    }
    try {
      const token = authHeader.split(' ')[1];
      const user = await resolveUserFromToken(token);
      if (!user) {
        res.status(401).json({
          message: 'User not registered. Call POST /api/auth/sync after signing in.',
        });
        return;
      }
      if (user.suspended) {
        res.status(403).json({ message: 'Your account has been suspended.' });
        return;
      }
      req.user = user;
      next();
    } catch {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  })();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  if (req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  next();
};

export const requireAgent = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }
  if (req.user.role !== 'AGENT' && req.user.role !== 'ADMIN') {
    res.status(403).json({ message: 'Agent access required' });
    return;
  }
  next();
};

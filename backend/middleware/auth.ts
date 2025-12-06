import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '../services/userService';
import { verifyToken } from '../services/tokenService';
import { findUserById, sanitizeUser } from '../services/userService';

type SanitizedUser = NonNullable<ReturnType<typeof sanitizeUser>>;

export interface AuthenticatedRequest extends Request {
  user?: SanitizedUser;
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
      return res.status(401).json({ message: 'Missing authorization header' });
    }

    const token = authHeader.slice(7).trim();
    const payload = verifyToken(token);

    if (!payload?.sub || typeof payload.sub !== 'string') {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const safeUser = sanitizeUser(user);
    if (!safeUser) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = safeUser;
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return res.status(401).json({ message });
  }
}

export function requireRole(...roles: (UserRole | '*')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user && 'role' in req.user ? (req.user.role as UserRole | undefined) : undefined;
    if (!roles.includes('*') && (!userRole || !roles.includes(userRole))) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return next();
  };
}


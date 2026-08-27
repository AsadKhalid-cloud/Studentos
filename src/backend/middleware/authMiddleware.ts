import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/authUtils';
import type { TokenPayload } from '../utils/authUtils';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : (req.headers['x-auth-token'] as string);

  if (!token) {
    res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired authentication token.' });
    return;
  }

  req.user = payload;
  next();
}
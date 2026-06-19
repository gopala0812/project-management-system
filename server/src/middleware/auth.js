import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { HttpError } from '../lib/httpError.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new HttpError(401, 'Authentication token is required.');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, fullName: true, email: true, createdAt: true }
    });

    if (!user) {
      throw new HttpError(401, 'Invalid authentication token.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      next(new HttpError(401, 'Authentication token has expired.'));
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      next(new HttpError(401, 'Invalid authentication token.'));
      return;
    }
    next(error);
  }
}

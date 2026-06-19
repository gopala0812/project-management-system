import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { HttpError } from '../lib/httpError.js';
import { publicUser } from '../utils/sanitize.js';
import { signToken } from '../utils/tokens.js';

export async function register(req, res, next) {
  try {
    const { fullName, email, password } = req.body;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new HttpError(409, 'Email address is already registered.');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { fullName, email, passwordHash }
    });

    res.status(201).json({
      user: publicUser(user),
      token: signToken(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new HttpError(401, 'Invalid email or password.');
    }

    res.json({
      user: publicUser(user),
      token: signToken(user)
    });
  } catch (error) {
    next(error);
  }
}

export function logout(_req, res) {
  res.json({ message: 'Logged out successfully. Remove the token on the client.' });
}

export function me(req, res) {
  res.json({ user: req.user });
}

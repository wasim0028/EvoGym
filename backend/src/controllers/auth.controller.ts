import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const buildTokens = (id: string, role: string) => ({
  accessToken: signAccessToken({ id, role }),
  refreshToken: signRefreshToken({ id, role }),
});

const publicUser = (u: { id: string; name: string; email: string; role: string }) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, 'An account with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone },
  });

  const { accessToken, refreshToken } = buildTokens(user.id, user.role);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(201).json(
    new ApiResponse('Registered successfully', { accessToken, user: publicUser(user) })
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid email or password');

  const { accessToken, refreshToken } = buildTokens(user.id, user.role);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json(
    new ApiResponse('Logged in successfully', { accessToken, user: publicUser(user) })
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || !user.refreshToken) throw new ApiError(401, 'Session expired, please log in again');

  const isValid = await bcrypt.compare(token, user.refreshToken);
  if (!isValid) throw new ApiError(401, 'Session expired, please log in again');

  const { accessToken, refreshToken } = buildTokens(user.id, user.role);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: await bcrypt.hash(refreshToken, 10) },
  });

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
  res.status(200).json(new ApiResponse('Token refreshed', { accessToken }));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const decoded = verifyRefreshToken(token);
      await prisma.user
        .update({ where: { id: decoded.id }, data: { refreshToken: null } })
        .catch(() => undefined);
    } catch {
      // token already invalid — nothing to clean up server-side
    }
  }
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(200).json(new ApiResponse('Logged out successfully'));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) throw new ApiError(404, 'User not found');
  res.status(200).json(new ApiResponse('User fetched', user));
});

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { env } from '../config/env';
import { sendPasswordResetEmail } from '../services/mailer.service';

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

/* ------------------------------------------------------------------ *
 * Password reset                                                     *
 * ------------------------------------------------------------------ */

const RESET_TOKEN_TTL_MINUTES = 30;

const hashToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  // The response is identical whether or not the account exists. Saying
  // "no such user" would turn this endpoint into a way to discover which
  // email addresses are registered.
  if (user) {
    // Any earlier unused tokens are dropped, so a reset link can't be
    // resurrected after the user requests a new one.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const rawToken = crypto.randomBytes(32).toString('hex');

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
      },
    });

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);
  }

  res.status(200).json(
    new ApiResponse(
      'If that email is registered, a reset link is on its way. It expires in 30 minutes.',
    ),
  );
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new ApiError(400, 'That reset link is invalid or has expired. Request a new one.');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // One transaction: set the new password, mark the token used, and clear the
  // stored refresh token so any other signed-in session is logged out.
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { password: hashedPassword, refreshToken: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ]);

  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.status(200).json(
    new ApiResponse('Password updated. You can sign in with your new password now.'),
  );
});

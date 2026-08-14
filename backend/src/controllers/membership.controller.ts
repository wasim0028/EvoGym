import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { price: 'asc' },
  });
  res.status(200).json(new ApiResponse('Plans fetched', plans));
});

export const createPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await prisma.membershipPlan.create({ data: req.body });
  res.status(201).json(new ApiResponse('Plan created', plan));
});

export const updatePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Plan not found');

  const plan = await prisma.membershipPlan.update({ where: { id }, data: req.body });
  res.status(200).json(new ApiResponse('Plan updated', plan));
});

export const deletePlan = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = await prisma.membershipPlan.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, 'Plan not found');

  await prisma.membershipPlan.update({ where: { id }, data: { isActive: false } });
  res.status(200).json(new ApiResponse('Plan deactivated'));
});

import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";

/** Public: a visitor asks the team to get in touch. */
export const createEnquiry = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body;

  const enquiry = await prisma.contactEnquiry.create({
    data: { name, email, phone, message },
  });

  // Only the id goes back — the record itself is staff-facing.
  res.status(201).json(
    new ApiResponse(
      "Thanks — our team will be in touch within one working day.",
      { id: enquiry.id },
    ),
  );
});

const ENQUIRY_STATUSES = ["NEW", "CONTACTED", "CLOSED"] as const;
type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

const asStatus = (value: unknown): EnquiryStatus | undefined =>
  typeof value === "string" &&
  (ENQUIRY_STATUSES as readonly string[]).includes(value)
    ? (value as EnquiryStatus)
    : undefined;

/** Admin: read the queue, optionally filtered by status. */
export const listEnquiries = asyncHandler(async (req: Request, res: Response) => {
  const status = asStatus(req.query.status);

  const enquiries = await prisma.contactEnquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.status(200).json(new ApiResponse("Enquiries fetched", enquiries));
});

/** Admin: move an enquiry through NEW -> CONTACTED -> CLOSED. */
export const updateEnquiryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const status = asStatus(req.body?.status);

    if (!status) {
      throw new ApiError(400, "Status must be NEW, CONTACTED or CLOSED");
    }

    const existing = await prisma.contactEnquiry.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, "Enquiry not found");

    const enquiry = await prisma.contactEnquiry.update({
      where: { id },
      data: { status },
    });

    res.status(200).json(new ApiResponse("Enquiry updated", enquiry));
  },
);

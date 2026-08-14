import { z } from "zod";

export const createEnquirySchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(80),
    email: z.string().email("Invalid email address"),
    phone: z.string().max(20).optional(),
    message: z.string().max(1000).optional(),
  }),
});

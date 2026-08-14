import { Router } from "express";
import {
  createEnquiry,
  listEnquiries,
  updateEnquiryStatus,
} from "../controllers/contact.controller";
import { validate } from "../middleware/validate.middleware";
import { createEnquirySchema } from "../validators/contact.validator";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { contactLimiter } from "../middleware/rateLimiter.middleware";

const router = Router();

// Public, rate-limited: the form on the website.
router.post("/", contactLimiter, validate(createEnquirySchema), createEnquiry);

// Staff-only.
router.get("/", authenticate, authorize("ADMIN"), listEnquiries);
router.patch("/:id", authenticate, authorize("ADMIN"), updateEnquiryStatus);

export default router;

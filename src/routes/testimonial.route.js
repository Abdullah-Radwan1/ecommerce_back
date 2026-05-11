import express from "express";
import {
  createTestimonial,
  getApprovedTestimonials,
  getAllTestimonials,
  approveTestimonial,
  deleteTestimonial,
} from "../controllers/testimonials.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getApprovedTestimonials);
router.get("/all", protect, adminOnly, getAllTestimonials);
router.post("/", protect, createTestimonial);
router.put("/:id/approve", protect, adminOnly, approveTestimonial);
router.delete("/:id", protect, deleteTestimonial);

export default router;

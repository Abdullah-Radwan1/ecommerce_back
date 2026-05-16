import Testimonial from "../models/Testimonial.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

/**
 * CREATE TESTIMONIAL
 */
export const createTestimonial = catchAsync(async (req, res, next) => {
  const { content, rating } = req.body;
  const testimonial = await Testimonial.create({
    user: req.user._id,
    content,
    rating,
  });
  res.status(201).json({ testimonial });
});

import { getPagination } from "../middleware/pagination.middleware.js";

/**
 * GET APPROVED TESTIMONIALS (Public)
 */
export const getApprovedTestimonials = catchAsync(async (req, res, next) => {
  const filter = { isApproved: true, isDeleted: false };
  const results = await getPagination(Testimonial, req, filter, [
    { path: "user", select: "name" },
  ]);
  res.json(results);
});

/**
 * GET ALL TESTIMONIALS (Admin)
 */
export const getAllTestimonials = catchAsync(async (req, res, next) => {
  const filter = { isDeleted: false };
  const results = await getPagination(Testimonial, req, filter, [
    { path: "User", select: "name email" },
  ]);
  res.json(results);
});

/**
 * APPROVE TESTIMONIAL (Admin)
 */
export const approveTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    { isApproved: true },
    { new: true },
  );
  if (!testimonial) {
    return next(new AppError("Testimonial not found", 404));
  }
  res.json({ testimonial });
});

/**
 * DELETE TESTIMONIAL (Admin or Owner)
 */
export const deleteTestimonial = catchAsync(async (req, res, next) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) {
    return next(new AppError("Testimonial not found", 404));
  }

  // Check ownership or admin
  if (
    testimonial.user.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return next(new AppError("Not authorized", 403));
  }

  await Testimonial.findByIdAndUpdate(req.params.id, { isDeleted: true });
  res.json({ message: "Testimonial soft deleted" });
});

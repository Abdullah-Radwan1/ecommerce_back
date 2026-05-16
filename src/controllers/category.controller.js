import Category from "../models/category.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";
import slugify from "slugify";

export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({ isDeleted: false });

  res.json({
    message: "success",
    categories,
  });
});

export const createCategory = catchAsync(async (req, res, next) => {
  const { name, parentId } = req.body;
  const slug = slugify(name, { lower: true });

  const category = await Category.create({
    name,
    slug,
    parentId: parentId || null,
  });

  res.status(201).json({
    status: "success",
    data: category,
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  const { name, parentId } = req.body;
  const updateData = {};

  if (name) {
    updateData.name = name;
    updateData.slug = slugify(name, { lower: true });
  }

  if (parentId !== undefined) {
    updateData.parentId = parentId || null;
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: category,
  });
});

export const deleteCategory = catchAsync(async (req, res, next) => {
  // Soft delete the category
  const category = await Category.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
  });

  if (!category) {
    return next(new AppError("No category found with that ID", 404));
  }

  // Also soft delete all subcategories
  await Category.updateMany({ parentId: category._id }, { isDeleted: true });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

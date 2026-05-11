import Product from "../models/Product.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// CREATE
export const createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

import { getPagination } from "../middleware/pagination.middleware.js";

// GET ALL (with filtering + pagination)
export const getProducts = catchAsync(async (req, res, next) => {
  const { category, minPrice, maxPrice, search } = req.query;

  const filter = { isDeleted: false };

  // category
  if (category) {
    filter.category = category;
  }

  // price range
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
  }

  // 🔥 search (name)
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const results = await getPagination(Product, req, filter);

  res.json(results);
});

// FAST SELLING (low stock)
export const fastSelling = catchAsync(async (req, res, next) => {
  const products = await Product.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $addFields: {
        totalStock: {
          $sum: "$variants.stock",
        },
      },
    },
    {
      $match: {
        totalStock: {
          $gt: 0, // ✅ exclude 0 stock
          $lt: 8, // ✅ keep fast-selling condition
        },
      },
    },
    {
      $sort: { totalStock: 1 },
    },
  ]);

  res.json(products);
});

// FEATURED PRODUCTS
export const featuredProducts = catchAsync(async (req, res, next) => {
  const products = await Product.find({
    isDeleted: false,
    isFeatured: true,
  })
    .sort("-createdAt")
    .limit(4); // optional but recommended

  res.json(products);
});

// GET ONE
export const getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isDeleted: false,
  }).populate("category");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.json(product);
});

// UPDATE
export const updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.json(product);
});

// DELETE
export const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  res.json({ message: "Product soft deleted" });
});

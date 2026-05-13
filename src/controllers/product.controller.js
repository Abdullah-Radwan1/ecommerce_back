import Product from "../models/Product.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";
import { getPagination } from "../middleware/pagination.middleware.js";
// CREATE
export const createProduct = catchAsync(async (req, res, next) => {
  if (req.body.variants && typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (e) {
      req.body.variants = [];
    }
  }

  const productData = {
    ...req.body,
    ...(req.file && {
      imageUrl: `${process.env.URL}/uploads/products/${req.file.filename}`,
    }),
  };
  const product = await Product.create(productData);
  res.status(201).json(product);
});

// GET ALL (with role-based access, filtering, search, and pagination)
export const getProducts = catchAsync(async (req, res, next) => {
  const { category, minPrice, maxPrice, search, status } = req.query;

  // 1. Initialize empty filter
  const filter = {};

  // 2. Role-based visibility logic
  // Assumes your auth middleware attaches the decoded JWT payload to req.user
  const isAdmin = req.user && req.user.role === "admin";

  if (!isAdmin) {
    // Customers ALWAYS only see active products
    filter.isDeleted = false;
  } else if (status) {
    // Admins see everything by default, but can explicitly filter by status
    if (status === "archived") filter.isActive = false;
    if (status === "active") filter.isActive = true;
  }

  // 3. Category filtering
  if (category) {
    filter.category = category;
  }

  // 4. Price range filtering
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice && { $gte: Number(minPrice) }),
      ...(maxPrice && { $lte: Number(maxPrice) }),
    };
  }

  // 5. Search filtering (case-insensitive regex)
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // 6. Execute query using your pagination middleware
  // Note: Ensure your getPagination utility also extracts and applies req.query.sort
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
  if (req.body.variants && typeof req.body.variants === "string") {
    try {
      req.body.variants = JSON.parse(req.body.variants);
    } catch (e) {
      req.body.variants = [];
    }
  }

  // Handle image upload if a new file is provided during update
  if (req.file) {
    req.body.imageUrl = `${process.env.URL}/uploads/products/${req.file.filename}`;
  }

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

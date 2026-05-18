import Product from "../models/Product.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";
import { getPagination } from "../middleware/pagination.middleware.js";
// CREATE
export const createProduct = catchAsync(async (req, res, next) => {
  const productData = {
    ...req.body,
    ...(req.file && {
      imageUrl: `${process.env.FRONTEND_URL}/uploads/products/${req.file.filename}`,
    }),
  };
  const product = await Product.create(productData);
  const populatedProduct = await Product.findById(product._id).populate([
    "category",
    "subcategory",
  ]);
  res.status(201).json(populatedProduct);
});

// GET ALL (with role-based access, filtering, search, and pagination)
export const getProducts = catchAsync(async (req, res, next) => {
  const { category, subcategory, minPrice, maxPrice, search, status } =
    req.query;

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
  if (subcategory) {
    filter.subcategory = subcategory;
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
  const results = await getPagination(Product, req, filter, [
    "category",
    "subcategory",
  ]);

  res.json(results);
});

// FAST SELLING (low stock)
export const fastSelling = catchAsync(async (req, res, next) => {
  const products = await Product.find({
    isDeleted: false,
    stock: { $gt: 0, $lt: 8 },
  }).sort({ stock: 1 });

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
  const identifier = req.params.slug;
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);

  const query = isObjectId
    ? { _id: identifier, isDeleted: false }
    : { slug: identifier, isDeleted: false };

  const product = await Product.findOne(query).populate([
    "category",
    "subcategory",
  ]);

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  res.json(product);
});

// UPDATE
export const updateProduct = catchAsync(async (req, res, next) => {
  // Handle image upload if a new file is provided during update
  if (req.file) {
    req.body.imageUrl = `${process.env.FRONTEND_URL}/uploads/products/${req.file.filename}`;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("No product found with that ID", 404));
  }

  const populatedProduct = await Product.findById(product._id).populate([
    "category",
    "subcategory",
  ]);
  res.json(populatedProduct);
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

// GET RELATED PRODUCTS (from same category, excluding current product)
export const getRelatedProducts = catchAsync(async (req, res, next) => {
  const currentProduct = await Product.findOne({
    slug: req.params.slug,
    isDeleted: false,
  });

  if (!currentProduct) {
    return next(new AppError("Product not found", 404));
  }

  const related = await Product.find({
    category: currentProduct.category,
    _id: { $ne: currentProduct._id },
    isDeleted: false,
    isActive: true,
  })
    .populate(["category", "subcategory"])
    .limit(4);

  res.json(related);
});

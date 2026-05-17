import { getPagination } from "../../middleware/pagination.middleware.js";
import { catchAsync } from "../../utilities/catchAsync.ut.js";
import Product from "../../models/product.model.js";

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
    if (status === "archived") filter.isDeleted = true;
    if (status === "active") filter.isDeleted = false;
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
  const results = await getPagination(Product, req, filter, [
    "category",
    "subcategory",
  ]);

  res.json(results);
});

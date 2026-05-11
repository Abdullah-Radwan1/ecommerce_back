import Category from "../models/category.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";

export const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();

  res.json({
    message: "success",
    categories,
  });
});

import mongoose from "mongoose";
import Product from "../models/Product.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

export const addPurchase = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, session },
    );

    if (!product) {
      await session.abortTransaction();
      return next(new AppError("Product not found or insufficient stock", 400));
    }

    await session.commitTransaction();
    res.status(200).json({ message: "Purchase successful", product });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

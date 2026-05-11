import Refund from "../models/refund.model.js";
import Order from "../models/order.model.js";
import Product from "../models/Product.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// 🧑‍💻 user: request refund
export const requestRefund = catchAsync(async (req, res, next) => {
  const { orderId, reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // 🔥 Important: ensure the order belongs to the user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not your order", 403));
  }

  const refund = await Refund.create({
    order: orderId,
    user: req.user._id,
    reason,
  });

  res.status(201).json(refund);
});

// 🧑‍💻 user: get my refunds
export const getMyRefunds = catchAsync(async (req, res, next) => {
  const refunds = await Refund.find({ user: req.user._id }).populate("order");
  res.json(refunds);
});

// 👑 admin: get all refunds
export const getAllRefunds = catchAsync(async (req, res, next) => {
  const refunds = await Refund.find().populate("user").populate("order");

  res.json(refunds);
});

// 👑 admin: approve / reject refund
export const handleRefund = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const refund = await Refund.findById(req.params.id).populate("order");

  if (!refund) {
    return next(new AppError("Refund not found", 404));
  }

  refund.status = status;
  await refund.save();

  // 🔥 If approved → return stock
  if (status === "approved") {
    const order = await Order.findById(refund.order._id);

    for (let item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }
  }

  res.json(refund);
});

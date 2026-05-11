import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";

// CREATE ORDER
export const createOrder = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    return next(new AppError("Cart is empty", 400));
  }

  let totalPrice = 0;
  const orderItems = [];

  for (let item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return next(new AppError(`Product ${item.product} not found`, 404));
    }

    // Simple stock check (assuming total stock logic or ignoring for now to avoid complexity with variants)
    // product.stock -= item.quantity;
    // await product.save();

    totalPrice += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalPrice,
    status: "pending",
  });

  // 🔥 clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    order,
  });
});

import { getPagination } from "../middleware/pagination.middleware.js";

// GET USER ORDERS
export const getMyOrders = catchAsync(async (req, res, next) => {
  const filter = { user: req.user._id };
  const results = await getPagination(Order, req, filter, ["items.product"]);
  res.json(results);
});

// ADMIN: GET ALL ORDERS
export const getAllOrders = catchAsync(async (req, res, next) => {
  const results = await getPagination(Order, req, {}, ["user"]);
  res.json(results);
});

// UPDATE STATUS
export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  order.status = req.body.status;
  await order.save();

  res.json(order);
});

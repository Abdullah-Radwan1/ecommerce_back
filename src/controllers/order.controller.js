import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Cart from "../models/cart.model.js";
import Address from "../models/Address.model.js";
import { catchAsync } from "../utilities/catchAsync.ut.js";
import { AppError } from "../utilities/appError.ut.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
// Helper to return product quantities to stock when order is cancelled
const increaseProductStock = async (productId, color, quantity) => {
  const product = await Product.findById(productId);
  if (!product) return;

  if (product.variants && product.variants.length > 0) {
    const variant = product.variants.find(
      (v) => (v.color || "").toLowerCase() === (color || "").toLowerCase(),
    );
    if (variant) {
      variant.stock = (variant.stock || 0) + quantity;
    } else {
      product.variants[0].stock = (product.variants[0].stock || 0) + quantity;
    }
    await product.save();
  }
};

// CREATE ORDER
export const createOrder = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const user = await User.findById(req.user.id).session(session);

    if (!user) {
      await session.abortTransaction();
      return next(new AppError("User not found", 404));
    }

    const cart = await Cart.findOne({ user: user._id }).session(session);

    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return next(new AppError("Cart is empty", 400));
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        await session.abortTransaction();
        return next(new AppError(`Product ${item.product} not found`, 404));
      }

      const chosenColor = item.color || "";

      let variant = null;

      if (product.variants?.length > 0) {
        variant = product.variants.find(
          (v) => (v.color || "").toLowerCase() === chosenColor.toLowerCase(),
        );
      }

      if (!variant) {
        variant = product.variants?.[0];
      }

      if (!variant || (variant.stock || 0) < item.quantity) {
        await session.abortTransaction();

        return next(
          new AppError(
            `Insufficient stock for product: ${product.name} in color: ${
              chosenColor || "Default"
            }. Available: ${variant?.stock || 0}`,
            400,
          ),
        );
      }

      // decrease stock
      variant.stock -= item.quantity;

      await product.save({ session });

      totalPrice += product.price * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        imageUrl: product.imageUrl,
        color: chosenColor,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // SHIPPING ADDRESS
    let shippingAddress = null;

    const {
      addressId,
      shippingAddress: shippingData,
      paymentMethod,
    } = req.body;

    if (addressId) {
      shippingAddress = await Address.findOne({
        _id: addressId,
        user: user._id,
        isDeleted: false,
      }).session(session);
    } else if (shippingData) {
      shippingAddress = shippingData;
    } else {
      shippingAddress = await Address.findOne({
        user: user._id,
        isDefault: true,
        isDeleted: false,
      }).session(session);
    }

    if (!shippingAddress) {
      await session.abortTransaction();

      return next(
        new AppError(
          "Please provide a shipping address or set a default address",
          400,
        ),
      );
    }

    const order = await Order.create(
      [
        {
          user: user._id,
          items: orderItems,
          totalPrice,
          paymentMethod,
          status: "pending",

          shippingAddress: {
            street: shippingAddress.street,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zipCode: shippingAddress.zipCode,
            country: shippingAddress.country,
            phone: user.phone,
          },
        },
      ],
      { session },
    );

    // clear cart
    cart.items = [];

    await cart.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();

    next(error);
  } finally {
    session.endSession();
  }
});

import { getPagination } from "../middleware/pagination.middleware.js";

// Mapper function to guarantee items have name and imageUrl snapshots
const mapOrdersWithSnapshots = (results) => {
  if (results.data) {
    results.data = results.data.map((order) => {
      const obj = order.toObject ? order.toObject() : order;
      if (obj.items) {
        obj.items = obj.items.map((item) => {
          if (!item.name && item.product) {
            item.name = item.product.name;
          }
          if (!item.imageUrl && item.product) {
            item.imageUrl = item.product.imageUrl;
          }
          return item;
        });
      }
      return obj;
    });
  }
  return results;
};

// GET USER ORDERS
export const getMyOrders = catchAsync(async (req, res, next) => {
  const filter = { user: req.user._id };
  let results = await getPagination(Order, req, filter, ["items.product"]);
  results = mapOrdersWithSnapshots(results);
  res.json(results);
});

// ADMIN: GET ALL ORDERS
export const getAllOrders = catchAsync(async (req, res, next) => {
  let results = await getPagination(Order, req, {}, ["user", "items.product"]);
  results = mapOrdersWithSnapshots(results);
  res.json(results);
});

// UPDATE STATUS (👑 ADMIN)
export const updateOrderStatus = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  const oldStatus = order.status;
  const newStatus = req.body.status;

  // Enforce admin cancellation rules
  if (newStatus === "cancelled by admin") {
    if (oldStatus === "recieved") {
      return next(
        new AppError(
          "Cannot cancel an order that has already been recieved",
          400,
        ),
      );
    }
    if (
      oldStatus === "cancelled by admin" ||
      oldStatus === "canceled by user"
    ) {
      return next(new AppError("Order is already cancelled", 400));
    }
  }

  order.status = newStatus;
  await order.save();

  // Manage stock updating: return the quantities if transitioning to cancelled
  if (
    (newStatus === "cancelled by admin" || newStatus === "canceled by user") &&
    oldStatus !== "cancelled by admin" &&
    oldStatus !== "canceled by user"
  ) {
    for (let item of order.items) {
      await increaseProductStock(item.product, item.color, item.quantity);
    }
  }

  res.json(order);
});

// CANCEL MY ORDER (👤 USER)
export const cancelMyOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

  if (!order) {
    return next(new AppError("No order found with that ID", 404));
  }

  const oldStatus = order.status;

  // User can only cancel if status is pending or preparing
  if (oldStatus !== "pending" && oldStatus !== "preparing") {
    return next(
      new AppError(
        "You can only cancel orders that are pending or preparing",
        400,
      ),
    );
  }

  order.status = "canceled by user";
  await order.save();

  // Manage stock updating: return the quantities to stock
  for (let item of order.items) {
    await increaseProductStock(item.product, item.color, item.quantity);
  }

  res.status(200).json({
    success: true,
    order,
  });
});

import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// CREATE ORDER

export const createOrder = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  let totalPrice = 0;

  for (let item of cart.items) {
    const product = await Product.findById(item.product);

    if (!product || product.stock < item.quantity) {
      throw new Error("Product unavailable");
    }

    product.stock -= item.quantity;
    await product.save();

    totalPrice += product.price * item.quantity;
  }

  const order = await Order.create({
    user: req.user._id,
    items: cart.items,
    totalPrice,
  });

  // 🔥 clear cart
  cart.items = [];
  await cart.save();

  res.json(order);
};

// GET USER ORDERS
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate(
    "items.product",
  );
  res.json(orders);
};

// ADMIN: GET ALL ORDERS
export const getAllOrders = async (req, res) => {
  const orders = await Order.find().populate("user");
  res.json(orders);
};

// UPDATE STATUS
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);

  order.status = req.body.status;
  await order.save();

  res.json(order);
};

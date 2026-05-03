import Refund from "../models/refund.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";

// 🧑‍💻 user: request refund
export const requestRefund = async (req, res) => {
  try {
    const { orderId, reason } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔥 مهم: تأكد إن الأوردر بتاعه
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not your order" });
    }

    const refund = await Refund.create({
      order: orderId,
      user: req.user._id,
      reason,
    });

    res.status(201).json(refund);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🧑‍💻 user: get my refunds
export const getMyRefunds = async (req, res) => {
  const refunds = await Refund.find({ user: req.user._id }).populate("order");
  res.json(refunds);
};

// 👑 admin: get all refunds
export const getAllRefunds = async (req, res) => {
  const refunds = await Refund.find().populate("user").populate("order");

  res.json(refunds);
};

// 👑 admin: approve / reject refund
export const handleRefund = async (req, res) => {
  try {
    const { status } = req.body;

    const refund = await Refund.findById(req.params.id).populate("order");

    if (!refund) {
      return res.status(404).json({ message: "Refund not found" });
    }

    refund.status = status;
    await refund.save();

    // 🔥 لو approved → رجّع stock
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

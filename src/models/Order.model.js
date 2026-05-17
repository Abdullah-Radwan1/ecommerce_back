import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        color: { type: String, default: "" },
        quantity: Number,
        price: Number,
      },
    ],
    totalPrice: Number,
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "shipped",
        "recieved",
        "cancelled by admin",
        "canceled by user",
      ],
      default: "pending",
    },
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phone: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Check if the model exists, otherwise compile it
const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;

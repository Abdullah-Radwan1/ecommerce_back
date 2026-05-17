import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        color: { type: String, default: "" },
        quantity: Number,

        // 🔥 Snapshot price at the time of addition
        priceAtAdd: Number,

        // 🔥 If the price changed
        isPriceChanged: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Cart", cartSchema);

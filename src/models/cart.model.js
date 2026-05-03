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
        quantity: Number,

        // 🔥 snapshot price وقت الإضافة
        priceAtAdd: Number,

        // 🔥 لو السعر اتغير
        isPriceChanged: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Cart", cartSchema);

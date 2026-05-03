import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    category: String,
    sizes: [String],
    imageUrl: String,
    stock: { type: Number, default: 0 },

    isFeatured: Boolean,
    isUpcoming: Boolean,

    // 🔥 NEW
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// 🔥 Virtual: low stock
productSchema.virtual("isLowStock").get(function () {
  return this.stock <= 3;
});

export default mongoose.model("Product", productSchema);

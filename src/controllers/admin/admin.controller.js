import Order from "../../models/order.model.js";
import Product from "../../models/product.model.js";
import { catchAsync } from "../../utilities/catchAsync.ut.js";

/**
 * GET ADMIN STATS (Revenue and Most Sold Product)
 */
export const getStats = catchAsync(async (req, res, next) => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // 💰 1. Total Revenue in the last year
  const revenueStats = await Order.aggregate([
    {
      $match: {
        status: "paid", // Only count paid orders
        createdAt: { $gte: oneYearAgo },
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalPrice" },
        totalOrders: { $sum: 1 },
      },
    },
  ]);

  const totalRevenue =
    revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
  const totalOrders = revenueStats.length > 0 ? revenueStats[0].totalOrders : 0;

  // 🏆 2. Most Sold Product in the last year
  const productStats = await Order.aggregate([
    {
      $match: {
        status: "paid",
        createdAt: { $gte: oneYearAgo },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        totalQuantity: { $sum: "$items.quantity" },
        totalSales: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
  ]);

  const mostSoldProduct = productStats.length > 0 ? productStats[0] : null;

  res.json({
    success: true,
    stats: {
      totalRevenue,
      totalOrders,
      mostSoldProduct: mostSoldProduct
        ? {
            id: mostSoldProduct._id,
            name: mostSoldProduct.productDetails.name,
            quantitySold: mostSoldProduct.totalQuantity,
            revenue: mostSoldProduct.totalSales,
          }
        : null,
    },
  });
});

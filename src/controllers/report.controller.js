import purchase from "../models/order.model.js";

export const getsSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const matchStage = {};

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.createdAt.$lte = new Date(endDate);
      }
    }

    // All stages, including $facet, must live inside this single array
    const summary = await purchase.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $addFields: {
          totalPrice: { $multiply: ["$items.price", "$items.quantity"] },
        },
      },
      {
        $facet: {
          overallStats: [
            {
              $group: {
                _id: null,
                totalSalesAmount: { $sum: "$totalPrice" },
                totalQuantitySold: { $sum: "$items.quantity" },
                orderIds: { $addToSet: "$_id" },
              },
            },
            {
              $project: {
                totalSalesAmount: 1,
                totalQuantitySold: 1,
                totalOfPurchases: { $size: "$orderIds" },
              },
            },
          ],
          topProducts: [
            {
              $group: {
                _id: "$product._id",
                name: { $first: "$product.name" },
                revenue: { $sum: "$totalPrice" },
                imageURL: { $first: "$product.imageURL" },
                quantity: { $sum: "$items.quantity" },
              },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
          ],
          topClient: [
            {
              $group: {
                _id: "$user._id",
                name: { $first: "$user.name" },
                totalSpent: { $sum: "$totalPrice" },
                orderIds: { $addToSet: "$_id" },
                totalQuantity: { $sum: "$items.quantity" },
              },
            },
            {
              $project: {
                name: 1,
                totalSpent: 1,
                totalOfPurchases: { $size: "$orderIds" },
                totalQuantity: 1,
              },
            },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
          ],
          monthlySales: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                totalRevenue: { $sum: "$totalPrice" },
                totalQuantity: { $sum: "$items.quantity" },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]);

    res.status(200).json({
      message: `Sales report from: ${startDate || "beginning"} to ${endDate || "now"}`,
      data: summary,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating sales report", error: error.message });
  }
};

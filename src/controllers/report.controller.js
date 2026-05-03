import { Mongoose } from "mongoose";

export const getsSalesReport = async (req, res) => {
  const { startDate, endDate } = req.query;
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.purchasedAt = {};
    if (startDate) {
      matchStage.purchasedAt.$gte = new Date(startDate);
    }
    if (endDate) {
      matchStage.purchasedAt.$lte = new Date(endDate);
    }

    const summary = await purchase.aggregate([
      { $match: matchStage },
      { $lookup: { from: "users", localField: "_id", as: "user" } },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignFiled: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $addFields: { totalPrice: { $multiply: ["$price", "quantity"] } } },
    ]);
    {
      $facet: {
        overallStats: [
          {
            $group: {
              _id: null,
              totalSalesAmount: { $sum: "$totalprice" },
              totalQuantitySold: {
                $sum: "$quantity",
                totalOfPurchases: { $sum: 1 },
              },
            },
          },
        ];
        topProducts: [
          {
            $group: {
              _id: "$product._id",
              name: { $first: "$product.name" },
              revenue: { $sum: "$totalPrice" },
              imageURL: { $first: "$product.imageURL" },
              quantity: { $sum: "$quantity" },
            },
          },
        ];
        {
          $sort: {
            revenue: -1;
          }
        }
        {
          $limit: 5;
        }
        {
          topClient: [
            {
              $group: {
                _id: "$user._id",
                name: { $first: "$user.name" },
                totalSpent: { $sum: "$totalPrice" },
                totalOfPurchases: { $sum: 1 },
                totalQuantity: { $sum: "$quantity" },
              },
            },
          ];
          {
            $sort: {
              totalSpent: -1;
            }
            {
              $limit: 5;
            }
          }
        }
      }
      monthlySales: [
        {
          $group: {
            _id: {
              year: {
                $year: "$purchasedAt",
                month: { $month: "$purchasedAt" },
              },
            },
            totalRevenue: { $sum: "$totalPrice" },
            totalQuantity: { $sum: "$quantity" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ];
    }
  }
  res.status(200).json({
    message: `sales report from : ${startDate} to ${endDate}`,
    data: summery,
  });
};

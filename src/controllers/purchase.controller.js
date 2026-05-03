

const addPurchase = async (req, res) => {
  const { productId, quantity, purchasedAt } = req.body;
  const userId = req.user._id;

  const session = await mongoose.startSession();

  session.startTransaction();

  try {
    const myProduct = await product.findOne({
      {_id: productId},
     { stock: { $gte: quantity }},
      {$inc: { stock: -quantity }},
      {new:true,session},
    });
  } catch (error) {}
};

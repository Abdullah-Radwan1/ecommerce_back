import Product from "../models/product.model.js";

// CREATE
export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
};

// GET ALL (with filtering + pagination)
export const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      category,
      minPrice,
      maxPrice,
      search,
      sort = "-createdAt",
    } = req.query;

    // 🔥 تحويل القيم
    page = Number(page);
    limit = Number(limit);

    const filter = { isDeleted: false };

    // category
    if (category) {
      filter.category = category;
    }

    // price range
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    // 🔥 search (title)
    if (search) {
      filter.title = { $regex: search, $options: "i" };
    }

    // 🔥 parallel queries (performance)
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),

      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ONE
export const getProduct = async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    isDeleted: false,
  });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};

// UPDATE
export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(product);
};

// DELETE
export const deleteProduct = async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, {
    isDeleted: true,
  });

  res.json({ message: "Product soft deleted" });
};

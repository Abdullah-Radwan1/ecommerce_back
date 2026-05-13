import { catchAsync } from "../utilities/catchAsync.ut.js";

/**
 * Core pagination logic that can be used directly in controllers
 */
export const getPagination = async (
  Model,
  req,
  filter = { isDeleted: false },
  populateOptions = [],
) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let sortBy = req.query.sort || "createdAt";
  let order = req.query.order === "desc" ? -1 : 1;

  if (sortBy.startsWith('-')) {
    sortBy = sortBy.substring(1);
    order = -1;
  }

  let query = Model.find(filter)
    .sort({ [sortBy]: order })
    .skip(skip)
    .limit(limit);

  if (populateOptions.length > 0) {
    populateOptions.forEach((option) => {
      query = query.populate(option);
    });
  }

  const [result, total] = await Promise.all([
    query,
    Model.countDocuments(filter),
  ]);

  return {
    data: result,
    pagination: {
      page,
      limit,
      totalResult: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Middleware version of the pagination utility
 */
export const paginate = (Model, populateOptions = []) => {
  return catchAsync(async (req, res, next) => {
    // Allows controllers to set a filter before this middleware runs if used in sequence
    const filter = req.paginationFilter || { isDeleted: false };

    res.paginatedResult = await getPagination(
      Model,
      req,
      filter,
      populateOptions,
    );
    next();
  });
};

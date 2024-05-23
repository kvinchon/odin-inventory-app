const Category = require('../models/category');
const Item = require('../models/item');
const asyncHandler = require('express-async-handler');

exports.index = asyncHandler(async (req, res, next) => {
  // Get details of categories and items counts (in parallel)
  const [numCategories, numItems] = await Promise.all([
    Category.countDocuments({}).exec(),
    Item.countDocuments({}).exec(),
  ]);

  res.render('index', {
    title: 'Store Home',
    category_count: numCategories,
    item_count: numItems,
  });
});

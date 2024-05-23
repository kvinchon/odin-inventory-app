const Item = require('../models/item');
const Category = require('../models/category');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Item
exports.item_list = asyncHandler(async (req, res, next) => {
  const allItems = await Item.find({}, 'name').sort({ name: 1 }).exec();
  res.render('item_list', { title: 'Item List', item_list: allItems });
});

// Display detail page for a specific Item
exports.item_detail = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).populate('category').exec();

  if (item === null) {
    const err = new Error('No item found');
    err.status = 404;
    return next(err);
  }

  res.render('item_detail', { title: 'Item Detail', item: item });
});

// Display Item create form on GET
exports.item_create_get = asyncHandler(async (req, res, next) => {
  // Get all categories, which we can use for adding to our Item
  const allCategories = await Category.find({}, 'name')
    .sort({ name: 1 })
    .exec();

  res.render('item_form', { title: 'Create Item', categories: allCategories });
});

// Handle Item create on POST
exports.item_create_post = [
  // Validate and sanitize fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category', 'Category must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('price')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price must not be empty')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('stock')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Number in stock must not be empty')
    .isNumeric()
    .withMessage('Number in stock must be a number'),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Item object with escaped and trimmed data
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      const allCategories = await Category.find().sort({ name: 1 }).exec();
      res.render('item_form', {
        title: 'Create Item',
        item: item,
        categories: allCategories,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save item and redirect to new item record
      await item.save();
      res.redirect(item.url);
    }
  }),
];

// Display Item update form on GET
exports.item_update_get = asyncHandler(async (req, res, next) => {
  // Get item and all categories for form, which we can use for adding to our Item
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find({}, 'name').sort({ name: 1 }).exec(),
  ]);

  if (item === null) {
    const err = new Error('No item found');
    err.status = 404;
    return next(err);
  }

  res.render('item_form', {
    title: 'Update Item',
    item: item,
    categories: allCategories,
  });
});

// Handle Item update on POST
exports.item_update_post = [
  // Validate and sanitize fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('category', 'Category must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('price')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price must not be empty')
    .isNumeric()
    .withMessage('Price must be a number'),
  body('stock')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Number in stock must not be empty')
    .isNumeric()
    .withMessage('Number in stock must be a number'),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Item object with escaped and trimmed data
    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      const allCategories = await Category.find({}, 'name')
        .sort({ name: 1 })
        .exec();

      res.render('item_form', {
        title: 'Update Item',
        item: item,
        categories: allCategories,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update record and redirect to item detail page
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item);
      res.redirect(updatedItem.url);
    }
  }),
];

// Display Item delete form on GET
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).populate('category').exec();

  if (item === null) {
    const err = new Error('No item found');
    err.status = 404;
    return next(err);
  }

  res.render('item_delete', { title: 'Delete Item', item: item });
});

// Handle Item delete on POST
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of item
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    const err = new Error('No item found');
    err.status = 404;
    return next(err);
  } else {
    // Delete object and redirect to the list of items
    await Item.findByIdAndDelete(req.body.itemid);
    res.redirect('/store/items');
  }
});

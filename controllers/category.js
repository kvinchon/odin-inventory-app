const Category = require('../models/category');
const Item = require('../models/item');
const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

// Display list of all Category
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find({}, 'name')
    .sort({ name: 1 })
    .exec();

  res.render('category_list', {
    title: 'Category List',
    category_list: allCategories,
  });
});

// Display detail page for a specific Category
exports.category_detail = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, 'name description')
      .sort({ name: 1 })
      .exec(),
  ]);

  if (category === null) {
    const err = new Error('No category found');
    err.status = 404;
    return next(err);
  }

  res.render('category_detail', {
    title: 'Category Detail',
    category: category,
    category_items: allItemsByCategory,
  });
});

// Display Category create form on GET
exports.category_create_get = (req, res, next) => {
  res.render('category_form', { title: 'Create Category' });
};

// Handle Category create on POST
exports.category_create_post = [
  // Validate and sanitize fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      res.render('category_form', {
        title: 'Create Category',
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save category and redirect to new category record
      await category.save();
      res.redirect(category.url);
    }
  }),
];

// Display Category update form on GET
exports.category_update_get = asyncHandler(async (req, res, next) => {
  // Get category for form
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    const err = new Error('No category found');
    err.status = 404;
    return next(err);
  }

  res.render('category_form', { title: 'Update Category', category: category });
});

// Handle Category update on POST
exports.category_update_post = [
  // Validate and sanitize fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request
    const errors = validationResult(req);

    // Create Category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values and error messages
      res.render('category_form', {
        title: 'Update Category',
        category: category,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update record and redirect to category detail page
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category
      );
      res.redirect(updatedCategory.url);
    }
  }),
];

// Display Category delete form on GET
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of category and all their items (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, 'name description')
      .sort({ name: 1 })
      .exec(),
  ]);

  if (category === null) {
    const err = new Error('No category found');
    err.status = 404;
    return next(err);
  }

  res.render('category_delete', {
    title: 'Delete Category',
    category: category,
    category_items: allItemsByCategory,
  });
});

// Handle Author delete on POST
exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of category and all their books (in parallel)
  const [category, allItemsByCategory] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }, 'name description')
      .sort({ name: 1 })
      .exec(),
  ]);

  if (category === null) {
    const err = new Error('No category found');
    err.status = 404;
    return next(err);
  }

  if (allItemsByCategory.length > 0) {
    // Category has items. Render in same way as for GET route
    res.render('category_delete', {
      title: 'Delete Category',
      category: category,
      category_items: allItemsByCategory,
    });
  } else {
    // Category has no items. Delete object and redirect to the list of categories
    await Category.findByIdAndDelete(req.body.categoryid);
    res.redirect('/store/categories');
  }
});

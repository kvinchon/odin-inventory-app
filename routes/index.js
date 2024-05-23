const express = require('express');
const router = express.Router();

// GET store home page
router.get('/', function (req, res, next) {
  res.redirect('/store');
});

module.exports = router;

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ItemSchema = new Schema({
  name: { type: String, required: true, maxLength: 100 },
  description: { type: String, required: true, maxLength: 100 },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  price: { type: Number, required: true, min: 0, max: 1000 },
  stock: { type: Number, required: true, min: 0, max: 1000 },
});

// Virtual for item's URL
ItemSchema.virtual('url').get(function () {
  return `/store/item/${this._id}`;
});

// Export model
module.exports = mongoose.model('Item', ItemSchema);

#! /usr/bin/env node

console.log(
  'This script populates some test items and categories to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/store?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const Item = require('./models/item');
const Category = require('./models/category');

const items = [];
const categories = [];

const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log('Debug: About to connect');
  await mongoose.connect(mongoDB);
  console.log('Debug: Should be connected?');
  await createCategories();
  await createItems();
  console.log('Debug: Closing mongoose');
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// categories[0] will always be the Fruits category, regardless of the order
// in which the elements of promise.all's argument complete.
async function categoryCreate(index, name, description) {
  const category = new Category({ name: name, description: description });
  await category.save();
  categories[index] = category;
  console.log(`Added category: ${name}`);
}

async function itemCreate(index, name, description, category, price, stock) {
  const itemDetails = {
    name: name,
    description: description,
    category: category,
    price: price,
    stock: stock,
  };

  const item = new Item(itemDetails);
  await item.save();
  items[index] = item;
  console.log(`Added item: ${name}`);
}

async function createCategories() {
  console.log('Adding categories');
  await Promise.all([
    categoryCreate(0, 'Fruits', 'Apples, bananas, citrus fruits...'),
    categoryCreate(1, 'Vegetables', 'Salads, tomatoes, organic vegetables...'),
    categoryCreate(2, 'Meat', 'Meat and barbecue specialties'),
    categoryCreate(3, 'Seafood', 'Fish, seafood gourmet and sushi'),
  ]);
}

async function createItems() {
  console.log('Adding items');
  await Promise.all([
    itemCreate(0, 'Apple', 'Granny Smith', categories[0], 1.5, 100),
    itemCreate(1, 'Banana', 'Cavendish', categories[0], 0.5, 200),
    itemCreate(2, 'Blueberries', 'Blue Crop', categories[0], 1.8, 50),
    itemCreate(3, 'Tomato', 'Black Krim', categories[1], 1.25, 80),
    itemCreate(4, 'Avocado', 'Hass', categories[1], 0.99, 120),
    itemCreate(5, 'Pepper', 'Red', categories[1], 1.2, 50),
    itemCreate(6, 'Steak', 'Beef meat', categories[2], 3.15, 70),
    itemCreate(7, 'Pork chops', 'Pork meat', categories[2], 4.6, 100),
    itemCreate(8, 'Cheese burger', 'Ground beef', categories[2], 3.4, 40),
    itemCreate(9, 'Salmon', 'Boneless', categories[3], 12.5, 20),
    itemCreate(10, 'Shrimps', 'Shelled shrimps', categories[3], 5.99, 10),
    itemCreate(11, 'Paella', 'Fresh food', categories[3], 8.4, 15),
  ]);
}

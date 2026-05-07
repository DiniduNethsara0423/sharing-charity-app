const { Category } = require('../models');

const defaultCategories = [
  'Electronics',
  'Clothing',
  'Books',
  'Home',
  'Toys',
  'Appliances',
  'Furniture',
  'Accessories',
  'Beauty',
  'Sports',
];

async function seedCategories() {
  try {
    for (const name of defaultCategories) {
      await Category.findOrCreate({
        where: { category_name: name },
        defaults: { category_name: name },
      });
    }
    console.log('✓ Default categories seeded (if missing)');
  } catch (err) {
    console.error('Failed to seed categories:', err);
    throw err;
  }
}

module.exports = { seedCategories };

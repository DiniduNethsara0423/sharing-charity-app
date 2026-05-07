const { Category } = require('../models');

function escapeXml(unsafe) {
  return unsafe.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  }[c]));
}

function svgDataUrl(text) {
  const safe = escapeXml(text);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" font-size="28" font-family="Arial, Helvetica, sans-serif" dominant-baseline="middle" text-anchor="middle" fill="#111">${safe}</text></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

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
      const image = svgDataUrl(name);
      await Category.findOrCreate({
        where: { category_name: name },
        defaults: { category_name: name, image },
      });
    }
    console.log('✓ Default categories seeded (if missing)');
  } catch (err) {
    console.error('Failed to seed categories:', err);
    throw err;
  }
}

module.exports = { seedCategories };

const db = require('../db');

exports.list = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item ORDER BY created_at DESC');
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { seller_id, title, description, category_id, size, price, status } = req.body;

    // Determine whether category is Clothing and validate size accordingly
    let sizeToSave = null;
    if (category_id) {
      const [cats] = await db.query('SELECT * FROM category WHERE category_id = ?', [category_id]);
      if (cats && cats.length) {
        const cat = cats[0];
        const isClothing = String(cat.category_name || '').trim().toLowerCase() === 'clothing';
        if (isClothing) {
          // parse sizes from category (JSON or comma separated)
          let allowed = [];
          if (cat.sizes) {
            try { allowed = JSON.parse(cat.sizes); } catch (e) { allowed = String(cat.sizes).split(','); }
          }
          allowed = allowed.map(s => String(s).trim().toUpperCase()).filter(Boolean);
          const normalized = size ? String(size).trim().toUpperCase() : '';
          if (!normalized) {
            return res.status(400).json({ success: false, code: 400, message: 'size required for Clothing items', data: null });
          }
          if (!allowed.includes(normalized)) {
            return res.status(400).json({ success: false, code: 400, message: `Invalid size. Allowed sizes: ${allowed.join(', ')}`, data: null });
          }
          sizeToSave = normalized;
        }
      }
    }

    const [result] = await db.query(
      'INSERT INTO item (seller_id, title, description, category_id, size, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [seller_id, title, description, category_id, sizeToSave, price, status || 'active']
    );
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [result.insertId]);
    res.status(201).json({ success: true, code: 201, message: 'Created', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { title, description, category_id, size, price, status } = req.body;

    // Fetch existing item to determine current category/size when needed
    const [existingRows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!existingRows.length) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    const existing = existingRows[0];

    // Decide which category to validate against: payload or existing
    const targetCategoryId = category_id || existing.category_id;
    let sizeToSave = null;
    if (targetCategoryId) {
      const [cats] = await db.query('SELECT * FROM category WHERE category_id = ?', [targetCategoryId]);
      if (cats && cats.length) {
        const cat = cats[0];
        const isClothing = String(cat.category_name || '').trim().toLowerCase() === 'clothing';
        if (isClothing) {
          let allowed = [];
          if (cat.sizes) {
            try { allowed = JSON.parse(cat.sizes); } catch (e) { allowed = String(cat.sizes).split(','); }
          }
          allowed = allowed.map(s => String(s).trim().toUpperCase()).filter(Boolean);
          const normalizedPayload = size ? String(size).trim().toUpperCase() : '';
          const normalizedExisting = existing.size ? String(existing.size).trim().toUpperCase() : '';
          const chosen = normalizedPayload || normalizedExisting;
          if (!chosen) {
            return res.status(400).json({ success: false, code: 400, message: 'size required for Clothing items', data: null });
          }
          if (!allowed.includes(chosen)) {
            return res.status(400).json({ success: false, code: 400, message: `Invalid size. Allowed sizes: ${allowed.join(', ')}`, data: null });
          }
          sizeToSave = chosen;
        }
      }
    }

    await db.query(
      'UPDATE item SET title = ?, description = ?, category_id = ?, size = ?, price = ?, status = ? WHERE item_id = ?',
      [title, description, category_id || existing.category_id, sizeToSave, price, status || existing.status, req.params.id]
    );
    const [rows] = await db.query('SELECT * FROM item WHERE item_id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM item WHERE item_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, code: 404, message: 'Item not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};

exports.getBySeller = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM item WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
    res.status(200).json({ success: true, code: 200, message: 'OK', data: rows });
  } catch (err) {
    next(err);
  }
};

const { Donation, User, Charity, Item, Category } = require('../models');

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

function parseSizes(input) {
  if (Array.isArray(input)) {
    return input.map(size => String(size).trim().toUpperCase()).filter(Boolean);
  }

  if (input === null || input === undefined) {
    return [];
  }

  const raw = String(input).trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map(size => String(size).trim().toUpperCase()).filter(Boolean);
    }
  } catch (err) {
    // Fall through to comma-separated parsing.
  }

  return raw
    .split(',')
    .map(size => String(size).trim().toUpperCase())
    .filter(Boolean);
}

function isClothingCategory(category) {
  return Boolean(category && String(category.category_name || '').trim().toLowerCase() === 'clothing');
}

async function buildDonationItem(body, donorId) {
  const itemId = body.item_id ?? body.itemId ?? body.itemID ?? null;
  if (itemId) {
    return { item_id: itemId, createdItem: null };
  }

  const title = body.item_name ?? body.itemName ?? body.title ?? body.name;
  const categoryId = body.category_id ?? body.categoryId ?? body.categoryID ?? null;
  const size = body.size ?? body.item_size ?? body.itemSize ?? null;
  const image = body.image ?? body.item_image ?? body.itemImage ?? null;
  const description = body.description ?? body.item_description ?? body.itemDescription ?? body.impact ?? null;

  if (!title) {
    return { error: 'item_name/title is required for item donations' };
  }

  let category = null;
  if (categoryId) {
    category = await Category.findByPk(categoryId);
    if (!category) {
      return { error: 'Invalid category_id' };
    }
  }

  if (isClothingCategory(category)) {
    const allowedSizes = parseSizes(category.sizes);
    const normalizedSize = String(size || '').trim().toUpperCase();
    if (!normalizedSize) {
      return { error: 'size is required for Clothing item donations' };
    }
    if (allowedSizes.length && !allowedSizes.includes(normalizedSize)) {
      return { error: `Invalid size. Allowed sizes: ${allowedSizes.join(', ')}` };
    }
  }

  const createdItem = await Item.create({
    seller_id: donorId,
    title,
    description,
    category_id: categoryId,
    size: size ? String(size).trim().toUpperCase() : null,
    image,
    price: null,
    status: 'active',
  });

  return { item_id: createdItem.item_id, createdItem };
}

const normalizeDonationPayload = (body) => ({
  donor_id: body.donor_id ?? body.donorId ?? body.donorID ?? null,
  charity_id: body.charity_id ?? body.charityId ?? body.charityID ?? null,
  item_id: body.item_id ?? body.itemId ?? body.itemID ?? null,
  status: body.status,
  gift_location: body.gift_location ?? body.giftLocation,
  impact: body.impact,
});

exports.list = async (req, res, next) => {
  try {
    const { q } = req.query;
    const { Op } = require('sequelize');
    const donations = await Donation.findAll({
      where: q
        ? {
            [Op.or]: [
              { gift_location: { [Op.like]: `%${q}%` } },
              { impact: { [Op.like]: `%${q}%` } },
            ],
          }
        : undefined,
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donations });
  } catch (err) {
    next(err);
  }
};

exports.listByDonor = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      where: { donor_id: req.params.donorId },
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donations });
  } catch (err) {
    next(err);
  }
};

exports.listByCharity = async (req, res, next) => {
  try {
    const donations = await Donation.findAll({
      where: { charity_id: req.params.charityId },
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donations });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    if (!donation) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: donation });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const payload = normalizeDonationPayload(req.body);

    if (payload.donor_id == null || payload.charity_id == null) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: 'donor_id and charity_id are required',
        data: null,
      });
    }

    const itemResult = await buildDonationItem(req.body, payload.donor_id);
    if (itemResult.error) {
      return res.status(400).json({
        success: false,
        code: 400,
        message: itemResult.error,
        data: null,
      });
    }

    if (itemResult.item_id) {
      payload.item_id = itemResult.item_id;
    }

    const donation = await Donation.create(payload);
    const result = await Donation.findByPk(donation.donation_id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email', 'device_token'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    try {
      const { sendToUser } = require('../services/fcmService');
      if (result && result.donor) {
        await sendToUser(result.donor, { title: 'Donation Received', body: `Thank you for donating "${result.item ? result.item.title : 'an item'}".` }, { donation_id: String(result.donation_id) });
      }
    } catch (e) {
      console.error('Notification error:', e);
    }
    res.status(201).json({ success: true, code: 201, message: 'Created', data: result });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        code: 400,
        message: err.errors.map(e => e.message).join(', '),
        data: null,
      });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    const payload = normalizeDonationPayload(req.body);
    await donation.update(payload);
    const result = await Donation.findByPk(req.params.id, {
      include: [
        { model: User, as: 'donor', attributes: ['user_id', 'username', 'email'] },
        { model: Charity, as: 'charity', attributes: ['charity_id', 'name'] },
        { model: Item, as: 'item', attributes: ['item_id', 'title'] },
      ],
    });
    res.status(200).json({ success: true, code: 200, message: 'OK', data: result });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const donation = await Donation.findByPk(req.params.id);
    if (!donation) return res.status(404).json({ success: false, code: 404, message: 'Donation not found', data: null });
    await donation.destroy();
    res.status(200).json({ success: true, code: 200, message: 'Deleted', data: null });
  } catch (err) {
    next(err);
  }
};
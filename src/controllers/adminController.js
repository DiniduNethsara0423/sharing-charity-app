const { Item, Category, Donation, Charity } = require('../models');

exports.stats = async (req, res, next) => {
  try {
    const [itemsCount, categoriesCount, donationsCount, charitiesCount] = await Promise.all([
      Item.count(),
      Category.count(),
      Donation.count(),
      Charity.count(),
    ]);

    res.status(200).json({
      success: true,
      code: 200,
      message: 'OK',
      data: {
        items: itemsCount,
        categories: categoriesCount,
        donations: donationsCount,
        charities: charitiesCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

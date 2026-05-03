const sequelize = require('../sequelize');
const User = require('./User');
const Item = require('./Item');
const Transaction = require('./Transaction');
const Donation = require('./Donation');
const Message = require('./Message');
const Charity = require('./Charity');
const ChatbotQuery = require('./ChatbotQuery');

// Define Associations
// User -> Item (one-to-many: user sells items)
User.hasMany(Item, {
  foreignKey: 'seller_id',
  as: 'items',
  onDelete: 'CASCADE',
});
Item.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller',
});

// User -> Transaction (one-to-many: user as buyer)
User.hasMany(Transaction, {
  foreignKey: 'buyer_id',
  as: 'purchasedTransactions',
  onDelete: 'CASCADE',
});
Transaction.belongsTo(User, {
  foreignKey: 'buyer_id',
  as: 'buyer',
});

// User -> Transaction (one-to-many: user as seller)
User.hasMany(Transaction, {
  foreignKey: 'seller_id',
  as: 'soldTransactions',
  onDelete: 'CASCADE',
});
Transaction.belongsTo(User, {
  foreignKey: 'seller_id',
  as: 'seller',
});

// Item -> Transaction
Item.hasMany(Transaction, {
  foreignKey: 'item_id',
  as: 'transactions',
  onDelete: 'CASCADE',
});
Transaction.belongsTo(Item, {
  foreignKey: 'item_id',
  as: 'item',
});

// User -> Donation (one-to-many: user as donor)
User.hasMany(Donation, {
  foreignKey: 'donor_id',
  as: 'donations',
  onDelete: 'CASCADE',
});
Donation.belongsTo(User, {
  foreignKey: 'donor_id',
  as: 'donor',
});

// Charity -> Donation (one-to-many)
Charity.hasMany(Donation, {
  foreignKey: 'charity_id',
  as: 'donations',
  onDelete: 'CASCADE',
});
Donation.belongsTo(Charity, {
  foreignKey: 'charity_id',
  as: 'charity',
});

// Item -> Donation (optional)
Item.hasMany(Donation, {
  foreignKey: 'item_id',
  as: 'donations',
  onDelete: 'SET NULL',
});
Donation.belongsTo(Item, {
  foreignKey: 'item_id',
  as: 'item',
});

// User -> Message (one-to-many: user as sender)
User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages',
  onDelete: 'CASCADE',
});
Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender',
});

// User -> Message (one-to-many: user as receiver)
User.hasMany(Message, {
  foreignKey: 'receiver_id',
  as: 'receivedMessages',
  onDelete: 'CASCADE',
});
Message.belongsTo(User, {
  foreignKey: 'receiver_id',
  as: 'receiver',
});

// Item -> Message (optional)
Item.hasMany(Message, {
  foreignKey: 'item_id',
  as: 'messages',
  onDelete: 'SET NULL',
});
Message.belongsTo(Item, {
  foreignKey: 'item_id',
  as: 'item',
});

// User -> ChatbotQuery (one-to-many)
User.hasMany(ChatbotQuery, {
  foreignKey: 'user_id',
  as: 'chatbotQueries',
  onDelete: 'CASCADE',
});
ChatbotQuery.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user',
});

module.exports = {
  sequelize,
  User,
  Item,
  Transaction,
  Donation,
  Message,
  Charity,
  ChatbotQuery,
};

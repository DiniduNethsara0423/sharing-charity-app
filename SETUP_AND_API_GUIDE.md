# Complete Setup & API Guide

## 1. DATABASE SETUP & INITIALIZATION

### What is the Database?
Your app uses **MySQL** database called `charity_app` with 8 tables:
- `user` - User profiles
- `item` - Items for sale
- `transaction` - Purchase transactions
- `charity` - Charity organizations
- `donation` - Donations to charities
- `message` - Messages between users
- `chatbot_query` - Chatbot interactions

### Step 1: Prerequisites
- MySQL installed locally
- Node.js installed
- `.env` file configured (see Step 2)

### Step 2: Configure Environment (.env)
Create a `.env` file in the project root:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=charity_app
DB_PORT=3306
PORT=3000
NODE_ENV=development
```

### Step 3: Create the Database

**Option A: Automatic (Recommended)**
```bash
# The database syncs automatically when the server starts
npm install
npm start
```
Server will run Sequelize `sync()` to create tables if they don't exist.

**Option B: Manual Setup**
Run the schema file directly in MySQL:
```bash
mysql -u root -p < src/db/schema.sql
```

Or use the setup script:
```bash
node setup-db.js
```

### Step 4: Verify Database Created
```bash
mysql -u root -p
> USE charity_app;
> SHOW TABLES;
```

You should see all 8 tables.

---

## 2. HOW MODELS WORK

### What are Models?
Models represent your database tables in JavaScript. They define:
- Table structure (columns, types)
- Validation rules
- Relationships between tables

### Location
`src/models/` directory contains:
- `User.js` - User model
- `Item.js` - Item model
- `Transaction.js` - Transaction model
- `Donation.js` - Donation model
- `Message.js` - Message model
- `Charity.js` - Charity model
- `ChatbotQuery.js` - Chatbot Query model
- `index.js` - Defines relationships between models

### Example: User Model
```javascript
// File: src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,           // Auto-increment ID
  },
  username: {
    type: DataTypes.STRING(100),
    allowNull: false,              // Required field
    unique: true,                  // Must be unique
    validate: {
      len: [3, 100],              // Validation: 3-100 chars
    },
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,              // Must be valid email
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: DataTypes.STRING(20),     // Optional
  location: DataTypes.STRING(255), // Optional
}, {
  tableName: 'user',
  timestamps: true,                // Auto adds createdAt, updatedAt
  underscored: true,               // Use snake_case in DB
});

module.exports = User;
```

### Model Relationships
Tables are connected via foreign keys. See `src/models/index.js`:

```
User (1) ─────────────── (Many) Item (seller_id)
User (1) ─────────────── (Many) Transaction (buyer_id, seller_id)
User (1) ─────────────── (Many) Donation (donor_id)
User (1) ─────────────── (Many) Message (sender_id, receiver_id)
Item (1) ─────────────── (Many) Transaction (item_id)
Charity (1) ─────────────── (Many) Donation (charity_id)
```

This means:
- One user can have many items they're selling
- One item belongs to one seller (user)
- Transactions link buyers, sellers, and items
- Messages connect two users

---

## 3. HOW THE API WORKS

### Architecture Flow
```
HTTP Request
    ↓
Routes (src/routes/users.js)
    ↓
Controller (src/controllers/userController.js)
    ↓
Model (src/models/User.js)
    ↓
Database (MySQL: user table)
    ↓
Response
```

### Example: Creating a User

#### Step 1: Request
```bash
POST /users
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password_hash": "hashed_password_123",
  "phone": "123-456-7890",
  "location": "New York, NY"
}
```

#### Step 2: Route Handling
File: `src/routes/users.js`
```javascript
router.post('/', usersController.create);  // Routes POST to controller
```

#### Step 3: Controller Logic
File: `src/controllers/userController.js`
```javascript
exports.create = async (req, res, next) => {
  try {
    const user = await User.create(req.body);  // Create in DB
    const response = user.toJSON();
    delete response.password_hash;              // Don't return password
    res.status(201).json(response);            // Return 201 + user data
  } catch (err) {
    next(err);                                  // Handle errors
  }
};
```

#### Step 4: Model Action
```javascript
await User.create(req.body);  // Sequelize creates user in DB
```

SQL equivalent:
```sql
INSERT INTO user (username, email, password_hash, phone, location, created_at, updated_at)
VALUES ('john_doe', 'john@example.com', 'hashed_password_123', '123-456-7890', 'New York, NY', NOW(), NOW());
```

#### Step 5: Response
```json
{
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "location": "New York, NY",
  "createdAt": "2024-05-02T10:30:00.000Z",
  "updatedAt": "2024-05-02T10:30:00.000Z"
}
```

---

## 4. ALL CRUD OPERATIONS

### CRUD = Create, Read, Update, Delete

#### CREATE (POST)
Creates a new record
```bash
POST /users
```

#### READ (GET)
- Get all: `GET /users`
- Get one: `GET /users/:id`
- Get filtered: `GET /items/seller/:sellerId`

#### UPDATE (PUT)
Updates existing record
```bash
PUT /users/:id
```

#### DELETE (DELETE)
Deletes a record
```bash
DELETE /users/:id`
```

---

## 5. COMPLETE API ENDPOINTS

### Users
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/users` | Get all users |
| GET | `/users/:id` | Get user by ID |
| POST | `/users` | Create new user |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Delete user |

**Create User Example:**
```json
POST /users
{
  "username": "alice",
  "email": "alice@example.com",
  "password_hash": "hashed123",
  "phone": "555-1234",
  "location": "Boston, MA"
}
```

### Items
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/items` | Get all items |
| GET | `/items/:id` | Get item by ID |
| GET | `/items/seller/:sellerId` | Get items by seller |
| POST | `/items` | Create new item |
| PUT | `/items/:id` | Update item |
| DELETE | `/items/:id` | Delete item |

**Create Item Example:**
```json
POST /items
{
  "seller_id": 1,
  "title": "iPhone 14",
  "description": "Excellent condition",
  "category": "Electronics",
  "price": 800.00,
  "status": "active"
}
```

### Transactions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/transactions` | Get all transactions |
| GET | `/transactions/:id` | Get transaction by ID |
| GET | `/transactions/buyer/:buyerId` | Get buyer's transactions |
| GET | `/transactions/seller/:sellerId` | Get seller's transactions |
| POST | `/transactions` | Create transaction |
| PUT | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |

**Create Transaction Example:**
```json
POST /transactions
{
  "buyer_id": 2,
  "seller_id": 1,
  "item_id": 1,
  "amount": 800.00,
  "type": "sale",
  "status": "pending"
}
```

### Donations
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/donations` | Get all donations |
| GET | `/donations/:id` | Get donation by ID |
| GET | `/donations/donor/:donorId` | Get donor's donations |
| GET | `/donations/charity/:charityId` | Get charity's donations |
| POST | `/donations` | Create donation |
| PUT | `/donations/:id` | Update donation |
| DELETE | `/donations/:id` | Delete donation |

**Create Donation Example:**
```json
POST /donations
{
  "donor_id": 1,
  "charity_id": 1,
  "item_id": 2,
  "status": "pending",
  "gift_location": "Downtown",
  "impact": "Helps those in need"
}
```

### Messages
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/messages` | Get all messages |
| GET | `/messages/:id` | Get message by ID |
| GET | `/messages/sender/:senderId` | Get messages sent by user |
| GET | `/messages/receiver/:receiverId` | Get messages received |
| GET | `/messages/conversation/:userId1/:userId2` | Get conversation |
| POST | `/messages` | Create message |
| PUT | `/messages/:id` | Update message |
| DELETE | `/messages/:id` | Delete message |

**Create Message Example:**
```json
POST /messages
{
  "sender_id": 1,
  "receiver_id": 2,
  "item_id": 1,
  "content": "Is this still available?",
  "encrypted": false
}
```

### Charities
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/charities` | Get all charities |
| GET | `/charities/:id` | Get charity by ID |
| POST | `/charities` | Create charity |
| PUT | `/charities/:id` | Update charity |
| DELETE | `/charities/:id` | Delete charity |

**Create Charity Example:**
```json
POST /charities
{
  "name": "Red Cross",
  "description": "Emergency relief",
  "address": "123 Main St",
  "phone": "555-5555",
  "email": "info@redcross.org"
}
```

### Chatbot Queries
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/chatbot-queries` | Get all queries |
| GET | `/chatbot-queries/:id` | Get query by ID |
| GET | `/chatbot-queries/user/:userId` | Get user's queries |
| POST | `/chatbot-queries` | Create query |
| PUT | `/chatbot-queries/:id` | Update query |
| DELETE | `/chatbot-queries/:id` | Delete query |

**Create Query Example:**
```json
POST /chatbot-queries
{
  "user_id": 1,
  "query": "How do I list an item?",
  "response": "Click New Item in the menu",
  "intent": "help"
}
```

---

## 6. RUNNING THE SERVER

### Installation
```bash
npm install
```

### Start Server
```bash
npm start
```

Output:
```
✓ Database synchronized
Server listening on port 3000
```

### Development Mode (Auto-reload)
```bash
npm run dev
```

### Access API Documentation
Open browser: `http://localhost:3000/api-docs`

Swagger UI shows all endpoints interactively.

---

## 7. DATABASE MIGRATION GUIDE

### What is Migration?
Moving your schema/data from one state to another.

### Adding a New Column to Users
#### Manual Migration:
1. Update `init.sql`:
```sql
ALTER TABLE user ADD COLUMN role VARCHAR(50) DEFAULT 'customer';
```

2. Update model `src/models/User.js`:
```javascript
const User = sequelize.define('User', {
  // ... existing fields
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'customer',
  },
});
```

3. Restart server (Sequelize auto-syncs)

### Adding a New Table
1. Update `init.sql`:
```sql
CREATE TABLE IF NOT EXISTS reviews (
  review_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  rating INT,
  comment TEXT,
  FOREIGN KEY (user_id) REFERENCES user(user_id),
  FOREIGN KEY (item_id) REFERENCES item(item_id)
);
```

2. Create model `src/models/Review.js`

3. Add to `src/models/index.js`:
```javascript
const Review = require('./Review');
User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });
```

4. Restart server

---

## 8. ERROR HANDLING

### Common Issues

**Error: "connect ECONNREFUSED 127.0.0.1:3306"**
- MySQL is not running
- Fix: Start MySQL service

**Error: "Unknown database 'charity_app'"**
- Database not created
- Fix: Run `npm start` (auto-creates) or manually run schema

**Error: "Access denied for user 'root'"**
- Wrong password in `.env`
- Fix: Update `.env` with correct password

**Error: "ER_DUP_ENTRY"**
- Duplicate username or email
- Fix: Use unique values

---

## 9. PROJECT STRUCTURE

```
express-mysql-backend/
├── src/
│   ├── server.js              # Entry point
│   ├── app.js                 # Express setup
│   ├── config/
│   │   └── database.js        # MySQL connection pool
│   ├── models/                # Sequelize models
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Transaction.js
│   │   ├── Donation.js
│   │   ├── Message.js
│   │   ├── Charity.js
│   │   ├── ChatbotQuery.js
│   │   └── index.js           # Model associations
│   ├── controllers/           # Request handlers
│   │   ├── userController.js
│   │   ├── itemController.js
│   │   └── ...
│   ├── routes/                # API routes
│   │   ├── users.js
│   │   ├── items.js
│   │   └── index.js
│   ├── sequelize/
│   │   └── index.js           # Sequelize config
│   └── docs/
│       └── swagger.js         # API documentation
├── .env                       # Environment variables
├── init.sql                   # Database schema
├── setup-db.js               # Setup script
└── package.json              # Dependencies
```

---

## 10. TESTING ENDPOINTS

### Using cURL
```bash
# Get all users
curl http://localhost:3000/users

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password_hash":"pwd123"}'

# Get specific user
curl http://localhost:3000/users/1

# Update user
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"username":"newname"}'

# Delete user
curl -X DELETE http://localhost:3000/users/1
```

### Using Postman
1. Open Postman
2. Create new request
3. Set method (GET, POST, etc.)
4. Enter URL: `http://localhost:3000/users`
5. Add JSON body if needed
6. Click Send

### Using Swagger UI
1. Go to `http://localhost:3000/api-docs`
2. Click endpoint
3. Click "Try it out"
4. Enter values
5. Click "Execute"

---

## Summary

**To get started:**
1. Create `.env` file with DB credentials
2. Run `npm install`
3. Run `npm start`
4. Visit `http://localhost:3000/api-docs`

**How it works:**
- Request → Routes → Controller → Model → Database → Response

**Models** = Define tables and relationships
**Controllers** = Handle business logic
**Routes** = Map HTTP requests to controllers
**Database** = MySQL stores the data

Enjoy! 🚀

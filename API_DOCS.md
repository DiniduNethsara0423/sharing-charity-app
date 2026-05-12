# Express MySQL CRUD API

Complete CRUD operations for a marketplace & donation platform with users, items, transactions, donations, messages, charities, and chatbot queries.

## Database Setup

Run the schema migration:
```bash
mysql -u root -p < src/db/schema.sql
```

## API Endpoints

### Users
- `GET /users` - List all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password_hash": "hashed_password",
    "phone": "123-456-7890",
    "location": "New York, NY"
  }
  ```
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

### Items
- `GET /items` - List all items
- `GET /items/:id` - Get item by ID
- `GET /items/seller/:sellerId` - Get items by seller
- `POST /items` - Create item
  ```json
  {
    "seller_id": 1,
    "title": "Used Laptop",
    "description": "Dell XPS in great condition",
    "category": "Electronics",
    "price": 500.00,
    "status": "active"
  }
  ```
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item

### Transactions
- `GET /transactions` - List all transactions
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/buyer/:buyerId` - Get transactions by buyer
- `GET /transactions/seller/:sellerId` - Get transactions by seller
- `POST /transactions` - Create transaction
  ```json
  {
    "buyer_id": 2,
    "seller_id": 1,
    "item_id": 1,
    "amount": 500.00,
    "type": "sale",
    "status": "pending"
  }
  ```
- `PUT /transactions/:id` - Update transaction
- `DELETE /transactions/:id` - Delete transaction

### Donations
- `GET /donations` - List all donations
- `GET /donations/:id` - Get donation by ID
- `GET /donations/donor/:donorId` - Get donations by donor
- `GET /donations/charity/:charityId` - Get donations by charity
- `POST /donations` - Create donation
  ```json
  {
    "donor_id": 1,
    "charity_id": 1,
    "item_id": 1,
    "status": "pending",
    "gift_location": "Manhattan",
    "impact": "Helps local community"
  }
  ```
- `PUT /donations/:id` - Update donation
- `DELETE /donations/:id` - Delete donation

### Messages
- `GET /messages` - List all messages
- `GET /messages/:id` - Get message by ID
- `GET /messages/sender/:senderId` - Get messages sent by user
- `GET /messages/receiver/:receiverId` - Get messages received by user
- `GET /messages/conversation/:userId1/:userId2` - Get conversation between two users
- `POST /messages` - Create message
  ```json
  {
    "sender_id": 1,
    "receiver_id": 2,
    "item_id": 1,
    "content": "Is this item still available?",
    "encrypted": false
  }
  ```
- `PUT /messages/:id` - Update message
- `DELETE /messages/:id` - Delete message

### Charities
- `GET /charities` - List all charities
- `GET /charities/:id` - Get charity by ID
- `POST /charities` - Create charity
  ```json
  {
    "name": "Local Food Bank",
    "description": "Distributes food to those in need",
    "address": "123 Main St, New York, NY",
    "phone": "555-1234",
    "email": "info@foodbank.org"
  }
  ```
- `PUT /charities/:id` - Update charity
- `DELETE /charities/:id` - Delete charity

### Chatbot Queries
- `GET /chatbot-queries` - List all queries
- `GET /chatbot-queries/:id` - Get query by ID
- `GET /chatbot-queries/user/:userId` - Get queries by user
- `POST /chatbot-queries` - Create query
  ```json
  {
    "user_id": 1,
    "query": "How do I post an item?",
    "response": "Go to the items page and click New Item",
    "intent": "help"
  }
  ```
- `PUT /chatbot-queries/:id` - Update query
- `DELETE /chatbot-queries/:id` - Delete query

## Running the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# Development with auto-reload
npm run dev
```

Server runs on `http://localhost:3000`

## Environment Variables

Create a `.env` file:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=testdb
PORT=3000
```

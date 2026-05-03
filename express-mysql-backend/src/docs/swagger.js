module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'Express MySQL Backend API',
    version: '1.0.0',
    description: 'REST API documentation for the marketplace and donation backend.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development server',
    },
  ],
  tags: [
    { name: 'Health', description: 'Service health checks' },
    { name: 'Users', description: 'User management' },
    { name: 'Items', description: 'Item management' },
    { name: 'Transactions', description: 'Transaction management' },
    { name: 'Donations', description: 'Donation management' },
    { name: 'Messages', description: 'Messaging between users' },
    { name: 'Charities', description: 'Charity management' },
    { name: 'Chatbot Queries', description: 'Chatbot query records' },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          user_id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'john_doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password_hash: { type: 'string', example: 'hashed_password' },
          phone: { type: 'string', example: '123-456-7890' },
          location: { type: 'string', example: 'New York, NY' },
        },
      },
      Item: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          seller_id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'Used Laptop' },
          description: { type: 'string', example: 'Dell XPS in great condition' },
          category: { type: 'string', example: 'Electronics' },
          price: { type: 'number', example: 500.0 },
          status: { type: 'string', example: 'active' },
        },
      },
      Transaction: {
        type: 'object',
        properties: {
          transaction_id: { type: 'integer', example: 1 },
          buyer_id: { type: 'integer', example: 2 },
          seller_id: { type: 'integer', example: 1 },
          item_id: { type: 'integer', example: 1 },
          amount: { type: 'number', example: 500.0 },
          type: { type: 'string', example: 'sale' },
          status: { type: 'string', example: 'pending' },
        },
      },
      Donation: {
        type: 'object',
        properties: {
          donation_id: { type: 'integer', example: 1 },
          donor_id: { type: 'integer', example: 1 },
          charity_id: { type: 'integer', example: 1 },
          item_id: { type: 'integer', example: 1 },
          status: { type: 'string', example: 'pending' },
          gift_location: { type: 'string', example: 'Manhattan' },
          impact: { type: 'string', example: 'Helps local community' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          message_id: { type: 'integer', example: 1 },
          sender_id: { type: 'integer', example: 1 },
          receiver_id: { type: 'integer', example: 2 },
          item_id: { type: 'integer', example: 1 },
          content: { type: 'string', example: 'Is this item still available?' },
          encrypted: { type: 'boolean', example: false },
        },
      },
      Charity: {
        type: 'object',
        properties: {
          charity_id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Local Food Bank' },
          description: { type: 'string', example: 'Distributes food to those in need' },
          address: { type: 'string', example: '123 Main St, New York, NY' },
          phone: { type: 'string', example: '555-1234' },
          email: { type: 'string', example: 'info@foodbank.org' },
        },
      },
      ChatbotQuery: {
        type: 'object',
        properties: {
          query_id: { type: 'integer', example: 1 },
          user_id: { type: 'integer', example: 1 },
          query: { type: 'string', example: 'How do I post an item?' },
          response: { type: 'string', example: 'Go to the items page and click New Item' },
          intent: { type: 'string', example: 'help' },
        },
      },
    },
  },
  paths: {
    '/': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean', example: true } },
                },
              },
            },
          },
        },
      },
    },
    '/users': {
      get: { tags: ['Users'], summary: 'List users', responses: { 200: { description: 'List of users' } } },
      post: { tags: ['Users'], summary: 'Create user', responses: { 201: { description: 'Created user' } } },
    },
    '/users/{id}': {
      get: { tags: ['Users'], summary: 'Get user by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'User' }, 404: { description: 'Not found' } } },
      put: { tags: ['Users'], summary: 'Update user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated user' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Users'], summary: 'Delete user', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/items': {
      get: { tags: ['Items'], summary: 'List items', responses: { 200: { description: 'List of items' } } },
      post: { tags: ['Items'], summary: 'Create item', responses: { 201: { description: 'Created item' } } },
    },
    '/items/{id}': {
      get: { tags: ['Items'], summary: 'Get item by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Item' }, 404: { description: 'Not found' } } },
      put: { tags: ['Items'], summary: 'Update item', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated item' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Items'], summary: 'Delete item', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/items/seller/{sellerId}': {
      get: { tags: ['Items'], summary: 'List items by seller', parameters: [{ name: 'sellerId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'List of items for seller' } } },
    },
    '/transactions': {
      get: { tags: ['Transactions'], summary: 'List transactions', responses: { 200: { description: 'List of transactions' } } },
      post: { tags: ['Transactions'], summary: 'Create transaction', responses: { 201: { description: 'Created transaction' } } },
    },
    '/transactions/{id}': {
      get: { tags: ['Transactions'], summary: 'Get transaction by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Transaction' }, 404: { description: 'Not found' } } },
      put: { tags: ['Transactions'], summary: 'Update transaction', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated transaction' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Transactions'], summary: 'Delete transaction', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/transactions/buyer/{buyerId}': {
      get: { tags: ['Transactions'], summary: 'List transactions by buyer', parameters: [{ name: 'buyerId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Transactions for buyer' } } },
    },
    '/transactions/seller/{sellerId}': {
      get: { tags: ['Transactions'], summary: 'List transactions by seller', parameters: [{ name: 'sellerId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Transactions for seller' } } },
    },
    '/donations': {
      get: { tags: ['Donations'], summary: 'List donations', responses: { 200: { description: 'List of donations' } } },
      post: { tags: ['Donations'], summary: 'Create donation', responses: { 201: { description: 'Created donation' } } },
    },
    '/donations/{id}': {
      get: { tags: ['Donations'], summary: 'Get donation by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Donation' }, 404: { description: 'Not found' } } },
      put: { tags: ['Donations'], summary: 'Update donation', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated donation' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Donations'], summary: 'Delete donation', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/donations/donor/{donorId}': {
      get: { tags: ['Donations'], summary: 'List donations by donor', parameters: [{ name: 'donorId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Donations for donor' } } },
    },
    '/donations/charity/{charityId}': {
      get: { tags: ['Donations'], summary: 'List donations by charity', parameters: [{ name: 'charityId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Donations for charity' } } },
    },
    '/messages': {
      get: { tags: ['Messages'], summary: 'List messages', responses: { 200: { description: 'List of messages' } } },
      post: { tags: ['Messages'], summary: 'Create message', responses: { 201: { description: 'Created message' } } },
    },
    '/messages/{id}': {
      get: { tags: ['Messages'], summary: 'Get message by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Message' }, 404: { description: 'Not found' } } },
      put: { tags: ['Messages'], summary: 'Update message', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated message' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Messages'], summary: 'Delete message', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/messages/sender/{senderId}': {
      get: { tags: ['Messages'], summary: 'List messages by sender', parameters: [{ name: 'senderId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Messages for sender' } } },
    },
    '/messages/receiver/{receiverId}': {
      get: { tags: ['Messages'], summary: 'List messages by receiver', parameters: [{ name: 'receiverId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Messages for receiver' } } },
    },
    '/messages/conversation/{userId1}/{userId2}': {
      get: { tags: ['Messages'], summary: 'Get conversation between two users', parameters: [{ name: 'userId1', in: 'path', required: true, schema: { type: 'integer' } }, { name: 'userId2', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Conversation messages' } } },
    },
    '/charities': {
      get: { tags: ['Charities'], summary: 'List charities', responses: { 200: { description: 'List of charities' } } },
      post: { tags: ['Charities'], summary: 'Create charity', responses: { 201: { description: 'Created charity' } } },
    },
    '/charities/{id}': {
      get: { tags: ['Charities'], summary: 'Get charity by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Charity' }, 404: { description: 'Not found' } } },
      put: { tags: ['Charities'], summary: 'Update charity', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated charity' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Charities'], summary: 'Delete charity', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/chatbot-queries': {
      get: { tags: ['Chatbot Queries'], summary: 'List chatbot queries', responses: { 200: { description: 'List of chatbot queries' } } },
      post: { tags: ['Chatbot Queries'], summary: 'Create chatbot query', responses: { 201: { description: 'Created chatbot query' } } },
    },
    '/chatbot-queries/{id}': {
      get: { tags: ['Chatbot Queries'], summary: 'Get chatbot query by ID', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Chatbot query' }, 404: { description: 'Not found' } } },
      put: { tags: ['Chatbot Queries'], summary: 'Update chatbot query', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Updated chatbot query' }, 404: { description: 'Not found' } } },
      delete: { tags: ['Chatbot Queries'], summary: 'Delete chatbot query', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 204: { description: 'Deleted' }, 404: { description: 'Not found' } } },
    },
    '/chatbot-queries/user/{userId}': {
      get: { tags: ['Chatbot Queries'], summary: 'List chatbot queries by user', parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Queries for user' } } },
    },
  },
};
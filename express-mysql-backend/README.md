# local-root-backend

Express.js backend with MySQL, organized with config, models, controllers, routes, Swagger docs, and a single server entrypoint.

Swagger docs are available at `/api-docs` when the server is running.

## Structure

- `src/server.js` starts the app
- `src/config/database.js` holds the MySQL pool
- `src/models/` contains data access for each entity
- `src/controllers/` contains request handlers
- `src/routes/index.js` mounts the API routes
- `init.sql` creates the database schema

## Setup

1. Copy or create `.env` with your DB settings.
2. Run `npm install`.
3. Run `npm start`.

## API

The API includes CRUD endpoints for users, items, transactions, donations, messages, charities, and chatbot queries.

See `/api-docs` for the interactive Swagger specification.

## Database

Run the schema script with your MySQL client or let the app connect to an existing `charity_app` database.

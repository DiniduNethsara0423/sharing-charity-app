# JWT Authentication API Guide

## Overview
This API now includes JWT (JSON Web Token) authentication for secure user signup, signin, and profile access.

## Features
- **User Signup**: Register new users with email, username, and password
- **User Signin**: Login with email and password to receive JWT token
- **Protected Routes**: Get user profile using JWT token
- **Password Hashing**: Secure password storage with bcryptjs
- **Token Expiration**: JWT tokens expire after 24 hours

## Dependencies
- `jsonwebtoken` - JWT token generation and verification
- `bcryptjs` - Password hashing and comparison

## Environment Variables
Add to your `.env` file:
```
JWT_SECRET=your-secret-key-change-in-production
```

> **Important**: Change `JWT_SECRET` in production to a strong, random string

## API Endpoints

### 1. Signup
**Endpoint**: `POST /auth/signup`

**Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "location": "New York, USA"
}
```

**Response (201 Created)**:
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, USA",
    "createdAt": "2026-05-03T10:30:00Z",
    "updatedAt": "2026-05-03T10:30:00Z"
  }
}
```

**Error Cases**:
- `400`: Missing required fields (username, email, password)
- `409`: Email already registered or username already taken

---

### 2. Signin
**Endpoint**: `POST /auth/signin`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "message": "Sign in successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "location": "New York, USA",
    "createdAt": "2026-05-03T10:30:00Z",
    "updatedAt": "2026-05-03T10:30:00Z"
  }
}
```

**Error Cases**:
- `400`: Missing email or password
- `401`: Invalid email or password

---

### 3. Get User Profile
**Endpoint**: `GET /auth/profile`

**Required Header**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Example**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK)**:
```json
{
  "user_id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "location": "New York, USA",
  "createdAt": "2026-05-03T10:30:00Z",
  "updatedAt": "2026-05-03T10:30:00Z"
}
```

**Error Cases**:
- `401`: No token provided
- `401`: Invalid token format
- `403`: Token is invalid or expired
- `404`: User not found

---

## Usage Examples

### Using cURL

**Signup**:
```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123",
    "phone": "+1234567890",
    "location": "New York, USA"
  }'
```

**Signin**:
```bash
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

**Get Profile** (replace TOKEN with actual JWT):
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Using JavaScript/Fetch

**Signup**:
```javascript
const response = await fetch('http://localhost:3001/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'securePassword123'
  })
});

const data = await response.json();
const token = data.token;
localStorage.setItem('authToken', token);
```

**Get Profile**:
```javascript
const token = localStorage.getItem('authToken');
const response = await fetch('http://localhost:3001/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const user = await response.json();
console.log(user);
```

---

## Security Best Practices

1. **Environment Variables**: Always keep `JWT_SECRET` in environment variables, never hardcode it
2. **HTTPS**: Use HTTPS in production to protect tokens in transit
3. **Token Storage**: Store tokens securely (localStorage, sessionStorage, or secure HTTP-only cookies)
4. **Password Requirements**: Consider adding password strength validation
5. **Rate Limiting**: Implement rate limiting on auth endpoints to prevent brute force attacks
6. **CORS**: Configure CORS appropriately for your frontend domain

---

## Token Structure

JWT tokens consist of three parts separated by dots:
- **Header**: Token type and hashing algorithm
- **Payload**: User data and token expiration
- **Signature**: Ensures token hasn't been tampered with

**Payload Example** (decoded):
```json
{
  "userId": 1,
  "iat": 1714732200,
  "exp": 1714818600
}
```

---

## Middleware Usage

To protect other routes with JWT verification, use the `verifyToken` middleware:

```javascript
const { verifyToken } = require('../middleware/auth');
const router = express.Router();

// Protected route
router.get('/protected', verifyToken, (req, res) => {
  // req.userId contains the authenticated user's ID
  res.json({ userId: req.userId, message: 'Protected data' });
});
```

---

## Updating User Password

To update a user's password through the `/users/:id` PUT endpoint, send the new password in `password_hash` field. It will be automatically hashed:

```bash
curl -X PUT http://localhost:3001/users/1 \
  -H "Content-Type: application/json" \
  -d '{ "password_hash": "newPassword123" }'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No token provided" | Include `Authorization: Bearer <token>` header |
| "Invalid token format" | Ensure header format is `Authorization: Bearer <token>` (space-separated) |
| "Token is invalid or expired" | Generate a new token by signing in again |
| "Email already registered" | Use a different email or sign in if account exists |
| "Password does not match" | Check email and password combination |

---

## Next Steps

- Implement refresh token mechanism for longer sessions
- Add two-factor authentication
- Add email verification for new accounts
- Implement password reset functionality
- Add role-based access control (RBAC)

# AgriAI Backend Authentication Setup

This document explains how to set up the backend authentication system for AgriAI.

## Required Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
OPENROUTER_API_KEY=your_openrouter_api_key
```

For the `SECRET_KEY`, you can generate a secure random key using:

```python
import secrets
print(secrets.token_hex(32))
```

## Install Dependencies

Make sure to install all the required dependencies:

```bash
pip install -r requirements.txt
```

## Database Setup

The authentication system uses SQLAlchemy with the existing database setup. Make sure your database is configured properly in `database.py`.

## API Endpoints

The authentication system provides the following endpoints:

- **POST /api/auth/register**: Register a new user
  - Request body: `{"email": "user@example.com", "password": "password", "full_name": "User Name", "location": "City, Country", "farm_type": "small"}`
  - Response: User data without password

- **POST /api/auth/login**: Login and get access token
  - Request body: `{"email": "user@example.com", "password": "password"}`
  - Response: `{"token": "access_token", "user": {...user_data...}}`

- **GET /api/auth/me**: Get current user profile
  - Headers: `Authorization: Bearer your_access_token`
  - Response: User data

- **PUT /api/auth/me**: Update user profile
  - Headers: `Authorization: Bearer your_access_token`
  - Request body: `{"full_name": "New Name", "location": "New Location", "farm_type": "medium"}`
  - Response: Updated user data

## User History Endpoints

- **GET /api/user/history/chat-history**: Get user's chat history
- **GET /api/user/history/disease-scans**: Get user's disease scan history
- **GET /api/user/history/crop-plans**: Get user's crop plan history
- **DELETE /api/user/history/clear-history/{history_type}**: Clear history by type (chat, disease, crop)

## Authentication in Other Endpoints

The `/api/chatbot/chat` endpoint now requires authentication. Make sure to include the Authorization header with the token in all requests.

## Frontend Integration

Update the frontend to:

1. Store the token in localStorage after login/signup
2. Include the token in the Authorization header for all API requests
3. Handle 401 Unauthorized responses by redirecting to the login page

## Example API Request with Authentication

```javascript
// Login
const loginResponse = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password'
  })
});

const { token, user } = await loginResponse.json();

// Store token
localStorage.setItem('token', token);

// Make authenticated request
const chatResponse = await fetch('http://localhost:8000/api/chatbot/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Hello',
    session_id: user.email
  })
});
```

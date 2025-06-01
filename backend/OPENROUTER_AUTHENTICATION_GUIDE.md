## OpenRouter API Authentication Guide

## Overview
OpenRouter has updated their authentication system to use Clerk. This means API keys are now in JWT format and start with `sk-or-v1-`.

**Important Update (June 1, 2025)**: OpenRouter's Clerk authentication requires the "Bearer " prefix followed by the JWT token in the Authorization header. This is the standard format for JWT authentication.

## How to Get a New API Key

1. Go to [OpenRouter.ai](https://openrouter.ai/) and log in to your account
2. Navigate to the API section or dashboard
3. Generate a new API key
4. The new key will be in JWT format and start with `sk-or-v1-`

## Updating Your Environment

1. Open your `.env` file in the backend directory
2. Replace the `OPENROUTER_API_KEY` value with your new API key
3. Make sure there are no comments or extra spaces in the `.env` file
4. Restart your backend server

## Testing Your Configuration

After updating your API key, you can test the connection in two ways:

1. Using the test environment endpoint:
   ```
   GET /api/chatbot/test-env
   ```

2. Using the OpenRouter connection test endpoint:
   ```
   GET /api/chatbot/test-openrouter
   ```

## Troubleshooting

If you're still experiencing 401 Unauthorized errors:

1. Verify your API key is correctly formatted (should start with `sk-or-v1-`)
2. Check that your API key is active in your OpenRouter dashboard
3. Ensure there are no trailing spaces or line breaks in your `.env` file
4. Look for detailed error messages in your application logs

## Additional Resources

- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [Clerk Authentication Documentation](https://clerk.com/docs)

#!/usr/bin/env python
"""
OpenRouter API Test Script
This script tests your OpenRouter API key connection
and helps diagnose authentication issues.
"""

import os
import json
import httpx
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

async def test_openrouter_connection():
    """Test connection to OpenRouter API"""
    
    if not OPENROUTER_API_KEY:
        print("❌ Error: OpenRouter API key not found")
        print("Please check your .env file")
        return False
    
    print(f"✓ API Key loaded (starts with: {OPENROUTER_API_KEY[:10]}...)")
    if not OPENROUTER_API_KEY.startswith("sk-or-v1-"):
        print("⚠️ Warning: API key doesn't start with 'sk-or-v1-'")
        print("OpenRouter now uses Clerk authentication with JWT tokens")
    
    # Simple test message
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello, are you working?"}
    ]
    
    # Use a free model for testing
    model = "meta-llama/llama-3.3-8b-instruct:free"
    
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",  # Use "Bearer " prefix to match JWT format
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/AgriAI/AgriAI",
        "X-Title": "AgriAI Chatbot"
    }
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 100
    }
    
    print(f"\nTesting connection to OpenRouter API...")
    print(f"URL: {OPENROUTER_URL}")
    print(f"Model: {model}")
    print(f"Headers: {json.dumps({k: v if k != 'Authorization' else v[:15]+'...' for k, v in headers.items()}, indent=2)}")
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                OPENROUTER_URL,
                json=payload,
                headers=headers
            )
            
            print(f"\nResponse status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
                print(f"\n✅ Success! Response from OpenRouter:")
                print(f"Model: {data.get('model', 'unknown')}")
                print(f"Response: {content[:100]}...\n")
                return True
            else:
                print(f"\n❌ Error: {response.status_code}")
                print(f"Response body: {response.text}\n")
                
                if response.status_code == 401:
                    print("Authentication failed. Please check your API key.")
                    print("OpenRouter now uses Clerk for authentication and requires JWT token format")
                    print("Get a new API key from: https://openrouter.ai/\n")
                return False
                
    except Exception as e:
        print(f"\n❌ Error connecting to OpenRouter API: {str(e)}")
        return False

if __name__ == "__main__":
    asyncio.run(test_openrouter_connection())

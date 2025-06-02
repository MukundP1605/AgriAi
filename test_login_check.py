#!/usr/bin/env python3
"""
Check login response format
"""
import requests
import json

# Test data
login_data = {
    "email": "demo@agriai.com",
    "password": "demo123"
}

print("🔐 Checking login response format...")
try:
    login_response = requests.post("http://localhost:8000/api/auth/login", json=login_data, timeout=10)
    print(f"Status: {login_response.status_code}")
    print(f"Response body: {login_response.text}")
    
    if login_response.status_code == 200:
        response_json = login_response.json()
        print(f"JSON keys: {list(response_json.keys())}")
    
except Exception as e:
    print(f"❌ Request failed: {e}")

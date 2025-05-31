#!/usr/bin/env python3
"""
Debug scan history endpoint
"""
import requests
import json

BASE_URL = "http://localhost:8000"

try:
    # Login first
    login_data = {"email": "Test@example.com", "password": "Test123"}
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        exit(1)
    
    token = response.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test scan history endpoint
    print("Testing scan history endpoint...")
    response = requests.get(f"{BASE_URL}/api/user/history/scans", headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Number of scans: {len(data)}")
    
except Exception as e:
    print(f"Error: {e}")

#!/usr/bin/env python3
"""
Debug fertilizer API response structure
"""
import requests
import json

# Test data
login_data = {
    "email": "demo@agriai.com",
    "password": "demo123"
}

soil_test_data = {
    "nitrogen": 34.0,
    "phosphorus": 65.0, 
    "potassium": 23.0,
    "ph": 6.5,
    "moisture": 25.0,
    "organic_matter": 2.5,
    "crop_type": "wheat",
    "field_size": 2.5,
    "location": "Test Farm, CA",
    "organic_preference": "chemical"
}

print("🔍 Debugging fertilizer API response...")

# Login
try:
    login_response = requests.post("http://localhost:8000/api/auth/login", json=login_data, timeout=10)
    token = login_response.json()["token"]
    print("✅ Login successful")
except Exception as e:
    print(f"❌ Login failed: {e}")
    exit(1)

# Test fertilizer API
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

try:
    response = requests.post(
        "http://localhost:8000/api/fertilizer/fertilizer-ai", 
        json=soil_test_data, 
        headers=headers, 
        timeout=60
    )
    
    if response.status_code == 200:
        data = response.json()
        print("\n📊 Full API Response Structure:")
        print(json.dumps(data, indent=2))
        
        print("\n🔍 NPK Analysis Details:")
        if 'npk_analysis' in data:
            npk = data['npk_analysis']
            print(f"Current NPK: {npk.get('current_npk', {})}")
            print(f"Recommended NPK: {npk.get('recommended_npk', {})}")
            print(f"Deficiency Analysis: {npk.get('deficiency_analysis', {})}")
        
        print(f"\n🎯 Confidence Score: {data.get('confidence_score', 'N/A')}%")
        print(f"📋 Request ID: {data.get('request_id', 'N/A')}")
        
    else:
        print(f"❌ API failed: {response.status_code} - {response.text}")
        
except Exception as e:
    print(f"❌ Request failed: {e}")

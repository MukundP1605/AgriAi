#!/usr/bin/env python3
"""
Complete end-to-end test of fertilizer system
1. Login 
2. Submit soil data for analysis
3. Download PDF with real recommendations
"""
import requests
import json

# Test data
login_data = {
    "email": "demo@agriai.com",
    "password": "demo123"
}

# Real soil test data for wheat
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

print("🚀 Starting complete fertilizer system test...")

# Step 1: Login
print("\n🔐 Step 1: Logging in...")
try:
    login_response = requests.post("http://localhost:8000/api/auth/login", json=login_data, timeout=10)
    
    if login_response.status_code == 200:
        token = login_response.json()["token"]
        print("✅ Login successful")
    else:
        print(f"❌ Login failed: {login_response.status_code} - {login_response.text}")
        exit(1)
        
except Exception as e:
    print(f"❌ Login request failed: {e}")
    exit(1)

# Step 2: Submit soil data for AI analysis
print("\n🧪 Step 2: Submitting soil data for AI analysis...")

headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

try:
    analysis_response = requests.post(
        "http://localhost:8000/api/fertilizer/fertilizer-ai", 
        json=soil_test_data, 
        headers=headers, 
        timeout=60  # Increased timeout for OpenRouter API
    )
    
    print(f"Analysis Response Status: {analysis_response.status_code}")
    
    if analysis_response.status_code == 200:
        analysis_data = analysis_response.json()
        print("✅ Fertilizer analysis successful!")
        print(f"📊 Current NPK: N={analysis_data.get('current_npk', {}).get('N', 'N/A')}, P={analysis_data.get('current_npk', {}).get('P', 'N/A')}, K={analysis_data.get('current_npk', {}).get('K', 'N/A')}")
        print(f"📈 Recommended NPK: N={analysis_data.get('recommended_npk', {}).get('N', 'N/A')}, P={analysis_data.get('recommended_npk', {}).get('P', 'N/A')}, K={analysis_data.get('recommended_npk', {}).get('K', 'N/A')}")
        print(f"🎯 Confidence: {analysis_data.get('confidence_score', 'N/A')}%")
    else:
        print(f"❌ Analysis failed: {analysis_response.text}")
        exit(1)
        
except Exception as e:
    print(f"❌ Analysis request failed: {e}")
    exit(1)

# Step 3: Download PDF report with real data
print("\n📄 Step 3: Downloading PDF report...")

# Use empty report data since PDF endpoint now fetches from database
report_data = {}

try:
    pdf_response = requests.post(
        "http://localhost:8000/api/fertilizer/download-report", 
        json=report_data, 
        headers=headers, 
        timeout=30
    )
    
    print(f"PDF Response Status: {pdf_response.status_code}")
    print(f"Content-Type: {pdf_response.headers.get('content-type')}")
    print(f"Content-Length: {pdf_response.headers.get('content-length')}")
    
    if pdf_response.status_code == 200:
        # Save PDF file with timestamp
        from datetime import datetime
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"fertilizer_report_real_data_{timestamp}.pdf"
        
        with open(filename, "wb") as f:
            f.write(pdf_response.content)
        print(f"✅ PDF download successful! File saved as {filename}")
        print("📋 The PDF should now contain the real NPK recommendations from the AI analysis!")
    else:
        print(f"❌ PDF download failed: {pdf_response.text}")
        
except Exception as e:
    print(f"❌ PDF request failed: {e}")

print("\n🎉 End-to-end test completed!")

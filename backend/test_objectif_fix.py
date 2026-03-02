#!/usr/bin/env python3
"""
Test script to verify the objectif 422 error fixes
"""
import requests
import json
from datetime import date

# Configuration
BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzcyMDg4OTIxfQ.gpmt5oYryd8_UBxEbDC7BNU6n5yCBd8vmmoFAY_4kTM"

def test_objectif_creation():
    """Test creating an objectif with string date format"""
    
    # Test data with string date (as sent by frontend)
    test_data = {
        "libelle": "Test Objectif API",
        "date": "2025-12-31",  # String format from frontend date input
        "service_id": 1
    }
    
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/objectifs/',
            headers=headers,
            json=test_data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ SUCCESS: Objectif created successfully!")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_objectif_creation_with_date_object():
    """Test creating an objectif with date object"""
    
    # Test data with date object
    test_data = {
        "libelle": "Test Objectif Date Object",
        "date": date(2025, 12, 31).isoformat(),  # Convert to string
        "service_id": 1
    }
    
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/objectifs/',
            headers=headers,
            json=test_data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ SUCCESS: Objectif with date object created successfully!")
            return True
        else:
            print(f"❌ FAILED: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

def test_invalid_service():
    """Test creating an objectif with invalid service_id"""
    
    test_data = {
        "libelle": "Test Invalid Service",
        "date": "2025-12-31",
        "service_id": 999  # Non-existent service
    }
    
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/objectifs/',
            headers=headers,
            json=test_data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400:
            print("✅ SUCCESS: Invalid service correctly rejected!")
            return True
        else:
            print(f"❌ FAILED: Expected 400, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return False

if __name__ == "__main__":
    print("Testing Objectif API fixes...")
    print("=" * 50)
    
    # Run tests
    test1 = test_objectif_creation()
    print()
    test2 = test_objectif_creation_with_date_object()
    print()
    test3 = test_invalid_service()
    
    print("\n" + "=" * 50)
    print("Test Results:")
    print(f"String date test: {'PASS' if test1 else 'FAIL'}")
    print(f"Date object test: {'PASS' if test2 else 'FAIL'}")
    print(f"Invalid service test: {'PASS' if test3 else 'FAIL'}")
    
    if all([test1, test2, test3]):
        print("\n🎉 All tests passed! The 422 errors should be fixed.")
    else:
        print("\n⚠️  Some tests failed. Check the API logs for more details.")
#!/usr/bin/env python3
"""
MacroMatch Backend API Test Script
Simple script to test the API endpoints without authentication
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:5000"

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_root_endpoint():
    """Test the root endpoint"""
    print("\nTesting root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_register_endpoint():
    """Test the user registration endpoint"""
    print("\nTesting user registration endpoint...")
    try:
        # Test data for registration
        test_user = {
            "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "password": "testpassword123",
            "name": "Test User",
            "age": 25,
            "weight": 70.0,
            "height": 175.0,
            "activity_level": "moderate",
            "dietary_goals": "maintenance"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            # Save token for further tests
            data = response.json()
            return data.get('token')
        else:
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_login_endpoint():
    """Test the user login endpoint"""
    print("\nTesting user login endpoint...")
    try:
        login_data = {
            "email": "test@example.com",
            "password": "testpassword123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            data = response.json()
            return data.get('token')
        else:
            return None
            
    except Exception as e:
        print(f"Error: {e}")
        return None

def test_protected_endpoint(token):
    """Test a protected endpoint with authentication"""
    if not token:
        print("\nNo token available for protected endpoint test")
        return False
        
    print("\nTesting protected endpoint (profile)...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BASE_URL}/api/v1/auth/profile", headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_meal_endpoints(token):
    """Test meal-related endpoints"""
    if not token:
        print("\nNo token available for meal endpoint tests")
        return False
        
    print("\nTesting meal endpoints...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # Test getting meals
        response = requests.get(f"{BASE_URL}/api/v1/meals/", headers=headers)
        print(f"Get Meals - Status Code: {response.status_code}")
        print(f"Get Meals - Response: {json.dumps(response.json(), indent=2)}")
        
        # Test creating a meal
        test_meal = {
            "name": "Test Breakfast",
            "meal_type": "breakfast",
            "food_items": [
                {
                    "name": "Oatmeal",
                    "serving_size": 1.0,
                    "serving_unit": "cup",
                    "nutrition": {
                        "calories": 150,
                        "protein": 5.0,
                        "carbs": 27.0,
                        "fat": 3.0,
                        "fiber": 4.0,
                        "sugar": 1.0,
                        "sodium": 10.0
                    }
                }
            ],
            "notes": "Test meal for API testing"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/meals/",
            json=test_meal,
            headers=headers
        )
        print(f"Create Meal - Status Code: {response.status_code}")
        print(f"Create Meal - Response: {json.dumps(response.json(), indent=2)}")
        
        return response.status_code == 201
        
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    """Main test function"""
    print("MacroMatch Backend API Test")
    print("=" * 50)
    
    # Test basic endpoints
    health_ok = test_health_check()
    root_ok = test_root_endpoint()
    
    if not health_ok:
        print("\n❌ Health check failed. Make sure the server is running.")
        return
    
    print("\n✅ Basic endpoints working")
    
    # Test authentication endpoints
    token = test_register_endpoint()
    if not token:
        print("\n⚠️  Registration failed, trying login...")
        token = test_login_endpoint()
    
    if token:
        print("\n✅ Authentication working")
        
        # Test protected endpoints
        profile_ok = test_protected_endpoint(token)
        meal_ok = test_meal_endpoints(token)
        
        if profile_ok and meal_ok:
            print("\n✅ All tests passed!")
        else:
            print("\n⚠️  Some tests failed")
    else:
        print("\n❌ Authentication tests failed")
        print("Note: This might be expected if Firebase is not configured")

if __name__ == "__main__":
    main()

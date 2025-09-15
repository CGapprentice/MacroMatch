# simple test script for our api :)
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"

def test_health_check():
    # test health check
    print("testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"status: {response.status_code}")
        print(f"response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"error: {e}")
        return False

def test_root_endpoint():
    # test root endpoint
    print("\ntesting root endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"status: {response.status_code}")
        print(f"response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"error: {e}")
        return False

def test_register_endpoint():
    # test user registration
    print("\ntesting registration...")
    try:
        test_user = {
            "email": f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com",
            "password": "testpassword123",
            "name": "Test User",
            "age": 25,
            "weight": 70.0,
            "height": 175.0
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/register",
            json=test_user,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"status: {response.status_code}")
        print(f"response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 201:
            data = response.json()
            return data.get('token')
        else:
            return None
            
    except Exception as e:
        print(f"error: {e}")
        return None

def test_meal_endpoints(token):
    # test meal endpoints
    if not token:
        print("\nno token for meal tests")
        return False
        
    print("\ntesting meal endpoints...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # test creating a meal
        test_meal = {
            "name": "Test Breakfast",
            "meal_type": "breakfast",
            "calories": 300,
            "notes": "test meal"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/meals/",
            json=test_meal,
            headers=headers
        )
        print(f"create meal - status: {response.status_code}")
        print(f"create meal - response: {json.dumps(response.json(), indent=2)}")
        
        return response.status_code == 201
        
    except Exception as e:
        print(f"error: {e}")
        return False

def main():
    # main test function
    print("macromatch api test")
    print("=" * 30)
    
    # test basic endpoints
    health_ok = test_health_check()
    root_ok = test_root_endpoint()
    
    if not health_ok:
        print("\n❌ health check failed - make sure server is running")
        return
    
    print("\n✅ basic endpoints working")
    
    # test auth
    token = test_register_endpoint()
    
    if token:
        print("\n✅ auth working")
        meal_ok = test_meal_endpoints(token)
        if meal_ok:
            print("\n✅ all tests passed! :)")
        else:
            print("\n⚠️ some tests failed")
    else:
        print("\n❌ auth tests failed")
        print("note: this might be expected if firebase is not configured")

if __name__ == "__main__":
    main()

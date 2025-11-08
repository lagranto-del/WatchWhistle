#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import subprocess
import time

class TVShowTrackerAPITester:
    def __init__(self, base_url="https://watchreminder.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def setup_test_user(self):
        """Create test user and session in MongoDB"""
        print("\n🔧 Setting up test user and session...")
        
        timestamp = int(time.time())
        user_id = f"test-user-{timestamp}"
        session_token = f"test_session_{timestamp}"
        
        mongo_script = f"""
        use('test_database');
        var userId = '{user_id}';
        var sessionToken = '{session_token}';
        db.users.insertOne({{
          id: userId,
          email: 'test.user.{timestamp}@example.com',
          name: 'Test User {timestamp}',
          picture: 'https://via.placeholder.com/150',
          created_at: new Date()
        }});
        db.user_sessions.insertOne({{
          user_id: userId,
          session_token: sessionToken,
          expires_at: new Date(Date.now() + 7*24*60*60*1000),
          created_at: new Date()
        }});
        print('Setup complete');
        """
        
        try:
            result = subprocess.run(
                ["mongosh", "--eval", mongo_script],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode == 0:
                self.session_token = session_token
                self.user_id = user_id
                print(f"✅ Test user created: {user_id}")
                print(f"✅ Session token: {session_token}")
                return True
            else:
                print(f"❌ MongoDB setup failed: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ MongoDB setup error: {str(e)}")
            return False

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n🧹 Cleaning up test data...")
        
        mongo_script = """
        use('test_database');
        db.users.deleteMany({email: /test\\.user\\./});
        db.user_sessions.deleteMany({session_token: /test_session/});
        db.shows.deleteMany({user_id: /test-user-/});
        db.episodes.deleteMany({user_id: /test-user-/});
        db.notifications.deleteMany({user_id: /test-user-/});
        print('Cleanup complete');
        """
        
        try:
            subprocess.run(["mongosh", "--eval", mongo_script], timeout=30)
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️ Cleanup warning: {str(e)}")

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request with authentication"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            headers['Authorization'] = f'Bearer {self.session_token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                return False, f"Status {response.status_code}, Expected {expected_status}. Response: {response.text[:200]}"

        except requests.exceptions.Timeout:
            return False, "Request timeout"
        except requests.exceptions.ConnectionError:
            return False, "Connection error - backend may be down"
        except Exception as e:
            return False, f"Request error: {str(e)}"

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔐 Testing Authentication Endpoints...")
        
        # Test /auth/me with valid token
        success, response = self.make_request('GET', 'auth/me')
        if success and isinstance(response, dict) and 'email' in response:
            self.log_result("GET /auth/me", True)
        else:
            self.log_result("GET /auth/me", False, str(response))

        # Test /auth/me without token (should fail)
        old_token = self.session_token
        self.session_token = None
        success, response = self.make_request('GET', 'auth/me', expected_status=401)
        if success:
            self.log_result("GET /auth/me (no auth)", True)
        else:
            self.log_result("GET /auth/me (no auth)", False, "Should return 401")
        self.session_token = old_token

        # Test logout
        success, response = self.make_request('POST', 'auth/logout')
        self.log_result("POST /auth/logout", success, str(response) if not success else "")

    def test_show_endpoints(self):
        """Test show-related endpoints"""
        print("\n📺 Testing Show Endpoints...")
        
        # Test search shows
        success, response = self.make_request('GET', 'shows/search?q=breaking+bad')
        if success and isinstance(response, list):
            self.log_result("GET /shows/search", True)
        else:
            self.log_result("GET /shows/search", False, str(response))

        # Test get favorites (should be empty initially)
        success, response = self.make_request('GET', 'shows/favorites')
        if success and isinstance(response, list):
            self.log_result("GET /shows/favorites", True)
        else:
            self.log_result("GET /shows/favorites", False, str(response))

        # Test add favorite show
        show_data = {
            "tvmaze_id": 169,
            "name": "Breaking Bad",
            "image_url": "https://static.tvmaze.com/uploads/images/medium_portrait/0/2400.jpg",
            "genres": ["Drama", "Crime", "Thriller"],
            "rating": 9.5,
            "premiered": "2008-01-20",
            "status": "Ended",
            "summary": "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine."
        }
        
        success, response = self.make_request('POST', 'shows/favorites', show_data, 200)
        show_id = None
        if success and isinstance(response, dict) and 'id' in response:
            show_id = response['id']
            self.log_result("POST /shows/favorites", True)
        else:
            self.log_result("POST /shows/favorites", False, str(response))

        # Test duplicate add (should fail)
        success, response = self.make_request('POST', 'shows/favorites', show_data, 400)
        self.log_result("POST /shows/favorites (duplicate)", success, str(response) if not success else "")

        # Test rate show
        if show_id:
            success, response = self.make_request('PUT', f'shows/favorites/{show_id}/rating', {"rating": 8.5})
            self.log_result("PUT /shows/favorites/{id}/rating", success, str(response) if not success else "")

        # Test remove show
        if show_id:
            success, response = self.make_request('DELETE', f'shows/favorites/{show_id}')
            self.log_result("DELETE /shows/favorites/{id}", success, str(response) if not success else "")

    def test_episode_endpoints(self):
        """Test episode-related endpoints"""
        print("\n🎬 Testing Episode Endpoints...")
        
        # First add a show to get episodes
        show_data = {
            "tvmaze_id": 169,
            "name": "Breaking Bad",
            "genres": ["Drama"],
            "rating": 9.5
        }
        
        success, response = self.make_request('POST', 'shows/favorites', show_data, 200)
        show_id = None
        if success and isinstance(response, dict) and 'id' in response:
            show_id = response['id']
            
            # Wait a moment for episodes to be fetched
            time.sleep(2)
            
            # Test get show episodes
            success, response = self.make_request('GET', f'shows/{show_id}/episodes')
            episode_id = None
            if success and isinstance(response, list) and len(response) > 0:
                episode_id = response[0]['id']
                self.log_result("GET /shows/{id}/episodes", True)
            else:
                self.log_result("GET /shows/{id}/episodes", False, str(response))

            # Test mark episode as watched
            if episode_id:
                success, response = self.make_request('PUT', f'episodes/{episode_id}/watched', {"watched": True})
                self.log_result("PUT /episodes/{id}/watched", success, str(response) if not success else "")

        # Test get upcoming episodes
        success, response = self.make_request('GET', 'episodes/upcoming')
        if success and isinstance(response, list):
            self.log_result("GET /episodes/upcoming", True)
        else:
            self.log_result("GET /episodes/upcoming", False, str(response))

    def test_notification_endpoints(self):
        """Test notification endpoints"""
        print("\n🔔 Testing Notification Endpoints...")
        
        # Test get notifications
        success, response = self.make_request('GET', 'notifications')
        if success and isinstance(response, list):
            self.log_result("GET /notifications", True)
        else:
            self.log_result("GET /notifications", False, str(response))

        # Test mark all notifications as read
        success, response = self.make_request('PUT', 'notifications/read-all')
        self.log_result("PUT /notifications/read-all", success, str(response) if not success else "")

    def test_external_apis(self):
        """Test external API integrations"""
        print("\n🌐 Testing External API Integrations...")
        
        # Test TVMaze API directly
        try:
            response = requests.get("https://api.tvmaze.com/search/shows?q=friends", timeout=10)
            if response.status_code == 200 and response.json():
                self.log_result("TVMaze API connectivity", True)
            else:
                self.log_result("TVMaze API connectivity", False, f"Status: {response.status_code}")
        except Exception as e:
            self.log_result("TVMaze API connectivity", False, str(e))

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting TV Show Tracker Backend API Tests")
        print(f"🎯 Testing against: {self.base_url}")
        
        # Setup
        if not self.setup_test_user():
            print("❌ Failed to setup test user. Aborting tests.")
            return False

        try:
            # Run test suites
            self.test_auth_endpoints()
            self.test_show_endpoints()
            self.test_episode_endpoints()
            self.test_notification_endpoints()
            self.test_external_apis()

        finally:
            # Cleanup
            self.cleanup_test_data()

        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️ Some tests failed. Check logs above.")
            return False

def main():
    tester = TVShowTrackerAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
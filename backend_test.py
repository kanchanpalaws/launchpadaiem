#!/usr/bin/env python3
"""
LaunchPad AI Backend API Testing Suite
Tests all backend endpoints for authentication, CRUD operations, and AI integrations.
"""

import requests
import sys
import json
from datetime import datetime

class LaunchPadAPITester:
    def __init__(self, base_url="https://instant-bizbuilder.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = "test_session_1775376458998"  # From mongosh setup
        self.user_id = "test-user-1775376458998"
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.session_token}'
        }
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.project_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {name}")
        if details:
            print(f"    {details}")
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def test_unauthenticated_endpoints(self):
        """Test that protected endpoints return 401 for unauthenticated requests"""
        print("\n🔒 Testing Unauthenticated Access...")
        
        endpoints = [
            "/auth/me",
            "/projects", 
            "/wallet"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.get(f"{self.api_url}{endpoint}")
                success = response.status_code == 401
                self.log_test(
                    f"Unauthenticated {endpoint}",
                    success,
                    f"Expected 401, got {response.status_code}"
                )
            except Exception as e:
                self.log_test(f"Unauthenticated {endpoint}", False, f"Request failed: {e}")

    def test_authenticated_user(self):
        """Test authenticated user endpoints"""
        print("\n👤 Testing Authenticated User...")
        
        try:
            response = requests.get(f"{self.api_url}/auth/me", headers=self.headers)
            success = response.status_code == 200
            if success:
                user_data = response.json()
                success = user_data.get('user_id') == self.user_id
                details = f"User: {user_data.get('name', 'Unknown')}, Plan: {user_data.get('plan', 'Unknown')}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            
            self.log_test("Get authenticated user", success, details)
            return success
        except Exception as e:
            self.log_test("Get authenticated user", False, f"Request failed: {e}")
            return False

    def test_projects_crud(self):
        """Test projects CRUD operations"""
        print("\n📁 Testing Projects CRUD...")
        
        # Test GET projects (empty initially)
        try:
            response = requests.get(f"{self.api_url}/projects", headers=self.headers)
            success = response.status_code == 200
            projects = response.json() if success else []
            self.log_test("Get projects list", success, f"Found {len(projects)} projects")
        except Exception as e:
            self.log_test("Get projects list", False, f"Request failed: {e}")

        # Test CREATE project
        project_data = {
            "name": "Test Website",
            "business_type": "startup",
            "content": {
                "hero": {
                    "headline": "Test Business",
                    "subheadline": "Testing our API",
                    "cta_text": "Get Started"
                }
            },
            "wizard_data": {
                "name": "Test Business",
                "description": "A test business for API testing"
            }
        }
        
        try:
            response = requests.post(f"{self.api_url}/projects", headers=self.headers, json=project_data)
            success = response.status_code == 200
            if success:
                project = response.json()
                self.project_id = project.get('project_id')
                details = f"Created project: {project.get('name')} (ID: {self.project_id})"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Create project", success, details)
        except Exception as e:
            self.log_test("Create project", False, f"Request failed: {e}")

        # Test GET specific project
        if self.project_id:
            try:
                response = requests.get(f"{self.api_url}/projects/{self.project_id}", headers=self.headers)
                success = response.status_code == 200
                if success:
                    project = response.json()
                    details = f"Retrieved project: {project.get('name')}"
                else:
                    details = f"Status: {response.status_code}"
                
                self.log_test("Get specific project", success, details)
            except Exception as e:
                self.log_test("Get specific project", False, f"Request failed: {e}")

            # Test UPDATE project
            update_data = {
                "status": "generated",
                "content": {
                    "hero": {
                        "headline": "Updated Test Business",
                        "subheadline": "Updated via API test",
                        "cta_text": "Get Started Now"
                    }
                }
            }
            
            try:
                response = requests.put(f"{self.api_url}/projects/{self.project_id}", headers=self.headers, json=update_data)
                success = response.status_code == 200
                if success:
                    project = response.json()
                    details = f"Updated project status: {project.get('status')}"
                else:
                    details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
                self.log_test("Update project", success, details)
            except Exception as e:
                self.log_test("Update project", False, f"Request failed: {e}")

    def test_wallet_operations(self):
        """Test wallet operations including INR pricing"""
        print("\n💰 Testing Wallet Operations...")
        
        # Test GET wallet - check initial balance is ₹50,000 (set in mongosh)
        try:
            response = requests.get(f"{self.api_url}/wallet", headers=self.headers)
            success = response.status_code == 200
            if success:
                wallet = response.json()
                balance = wallet.get('balance', 0)
                plan = wallet.get('plan', 'unknown')
                details = f"Balance: ₹{balance}, Plan: {plan}"
                # Check if balance shows INR amounts correctly
                if balance == 50000:
                    details += " (Initial balance correct)"
                else:
                    details += f" (Expected ₹50,000, got ₹{balance})"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("Get wallet info", success, details)
        except Exception as e:
            self.log_test("Get wallet info", False, f"Request failed: {e}")

        # Test CREDIT wallet
        try:
            credit_data = {"amount": 1000, "description": "API test credit"}
            response = requests.post(f"{self.api_url}/wallet/credit", headers=self.headers, json=credit_data)
            success = response.status_code == 200
            if success:
                result = response.json()
                details = f"New balance: ₹{result.get('balance', 0)}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Credit wallet", success, details)
        except Exception as e:
            self.log_test("Credit wallet", False, f"Request failed: {e}")

        # Test UPGRADE wallet - check premium plan costs ₹9,999
        try:
            # First check current plan
            response = requests.get(f"{self.api_url}/wallet", headers=self.headers)
            if response.status_code == 200:
                current_balance = response.json().get('balance', 0)
                
                # Test upgrade to premium (should cost ₹9,999)
                upgrade_data = {"plan": "premium"}
                response = requests.post(f"{self.api_url}/wallet/upgrade", headers=self.headers, json=upgrade_data)
                success = response.status_code == 200
                if success:
                    result = response.json()
                    new_balance = result.get('balance', 0)
                    cost = current_balance - new_balance
                    plan = result.get('plan', 'unknown')
                    details = f"Upgraded to {plan}, Cost: ₹{cost}, New balance: ₹{new_balance}"
                    # Check if upgrade cost is ₹9,999
                    if cost == 9999:
                        details += " (Upgrade cost correct)"
                    else:
                        details += f" (Expected ₹9,999, got ₹{cost})"
                else:
                    details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
                self.log_test("Wallet upgrade to premium", success, details)
            else:
                self.log_test("Wallet upgrade to premium", False, "Could not get current balance")
        except Exception as e:
            self.log_test("Wallet upgrade to premium", False, f"Request failed: {e}")

        # Test monthly plan upgrade cost
        try:
            upgrade_data = {"plan": "monthly"}
            response = requests.post(f"{self.api_url}/wallet/upgrade", headers=self.headers, json=upgrade_data)
            success = response.status_code == 200
            if success:
                result = response.json()
                plan = result.get('plan', 'unknown')
                details = f"Monthly plan upgrade successful, Plan: {plan}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Wallet upgrade to monthly", success, details)
        except Exception as e:
            self.log_test("Wallet upgrade to monthly", False, f"Request failed: {e}")

    def test_ai_endpoints(self):
        """Test AI generation endpoints"""
        print("\n🤖 Testing AI Endpoints...")
        
        # Test AI content generation
        business_info = {
            "name": "TechStart Solutions",
            "type": "startup",
            "description": "We help startups build amazing products",
            "target_audience": "Tech entrepreneurs",
            "services": "Product development, consulting",
            "tone": "Professional",
            "email": "hello@techstart.com"
        }
        
        try:
            response = requests.post(f"{self.api_url}/ai/generate-content", headers=self.headers, json={"business_info": business_info})
            success = response.status_code == 200
            if success:
                result = response.json()
                content = result.get('content', {})
                details = f"Generated content with {len(content)} sections"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("AI content generation", success, details)
        except Exception as e:
            self.log_test("AI content generation", False, f"Request failed: {e}")

        # Test AI questions generation
        try:
            questions_data = {"business_type": "startup", "current_info": {"name": "TechStart"}}
            response = requests.post(f"{self.api_url}/ai/generate-questions", headers=self.headers, json=questions_data)
            success = response.status_code == 200
            if success:
                result = response.json()
                questions = result.get('questions', [])
                details = f"Generated {len(questions)} questions"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("AI questions generation", success, details)
        except Exception as e:
            self.log_test("AI questions generation", False, f"Request failed: {e}")

    def test_media_endpoints(self):
        """Test media generation endpoints"""
        print("\n🎨 Testing Media Generation...")
        
        # Test logo generation
        try:
            logo_data = {"business_name": "TechStart", "style": "modern minimalist"}
            response = requests.post(f"{self.api_url}/media/generate-logo", headers=self.headers, json=logo_data)
            success = response.status_code == 200
            if success:
                result = response.json()
                images = result.get('images', [])
                details = f"Generated {len(images)} logo images"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            
            self.log_test("Logo generation", success, details)
        except Exception as e:
            self.log_test("Logo generation", False, f"Request failed: {e}")

    def test_github_endpoints(self):
        """Test GitHub publishing endpoints"""
        print("\n🚀 Testing GitHub Publishing...")
        
        if not self.project_id:
            self.log_test("GitHub publish (no project)", False, "No project ID available for testing")
            return

        # Test publish status
        try:
            response = requests.get(f"{self.api_url}/github/status/{self.project_id}", headers=self.headers)
            success = response.status_code == 200
            if success:
                status = response.json()
                details = f"Published: {status.get('published', False)}"
            else:
                details = f"Status: {response.status_code}"
            
            self.log_test("GitHub publish status", success, details)
        except Exception as e:
            self.log_test("GitHub publish status", False, f"Request failed: {e}")

        # Note: Not testing actual publish to avoid creating repos during testing

    def cleanup_test_data(self):
        """Clean up test project"""
        if self.project_id:
            try:
                response = requests.delete(f"{self.api_url}/projects/{self.project_id}", headers=self.headers)
                success = response.status_code == 200
                self.log_test("Cleanup test project", success, f"Deleted project {self.project_id}")
            except Exception as e:
                self.log_test("Cleanup test project", False, f"Cleanup failed: {e}")

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🧪 LaunchPad AI Backend API Testing Suite")
        print("=" * 50)
        
        # Test unauthenticated access
        self.test_unauthenticated_endpoints()
        
        # Test authenticated endpoints
        if self.test_authenticated_user():
            self.test_projects_crud()
            self.test_wallet_operations()
            self.test_ai_endpoints()
            self.test_media_endpoints()
            self.test_github_endpoints()
            self.cleanup_test_data()
        else:
            print("❌ Authentication failed - skipping authenticated tests")

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"  - {test['test']}: {test['details']}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = LaunchPadAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
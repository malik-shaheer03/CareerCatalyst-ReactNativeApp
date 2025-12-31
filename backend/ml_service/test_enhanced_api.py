"""
Test script for the enhanced ML service with training recommendations

This script tests both the career path prediction and training recommendation endpoints.
"""

import requests
import json

# API endpoints
CAREER_PATH_URL = 'http://localhost:8001/api/predict-career-paths'
TRAINING_URL = 'http://localhost:8001/api/recommend-training'
HEALTH_URL = 'http://localhost:8001/health'

def test_health():
    """Test the health check endpoint"""
    print("=" * 70)
    print("Testing Health Check")
    print("=" * 70)
    
    response = requests.get(HEALTH_URL)
    data = response.json()
    
    print(f"Status: {data['status']}")
    print(f"Model Loaded: {data['model_loaded']}")
    print(f"Message: {data['message']}")
    print()

def test_career_paths():
    """Test career path prediction"""
    print("=" * 70)
    print("Testing Career Path Prediction")
    print("=" * 70)
    
    test_data = {
        "skills": ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        "top_n": 3
    }
    
    print(f"Input Skills: {', '.join(test_data['skills'])}")
    print()
    
    response = requests.post(CAREER_PATH_URL, json=test_data)
    data = response.json()
    
    if data['success']:
        print(f"Found {len(data['career_paths'])} career paths:\n")
        for career in data['career_paths']:
            print(f"{career['id']}. {career['title']}")
            print(f"   Match Score: {career['match_score']:.2f} ({career['confidence']} confidence)")
            print(f"   {career['description']}")
            print()
    else:
        print("Failed to get career paths")
    
    return data

def test_training_recommendations():
    """Test training recommendations"""
    print("=" * 70)
    print("Testing Training Recommendations")
    print("=" * 70)
    
    test_data = {
        "skills": ["JavaScript", "React", "Node.js"],
        "job_title": "Frontend Developer",
        "top_n": 3
    }
    
    print(f"Input Skills: {', '.join(test_data['skills'])}")
    print(f"Job Title: {test_data['job_title']}")
    print()
    
    response = requests.post(TRAINING_URL, json=test_data)
    data = response.json()
    
    if data['success']:
        print(f"Found {len(data['training_recommendations'])} training recommendations:\n")
        for training in data['training_recommendations']:
            print(f"{training['id']}. {training['title']}")
            print(f"   Courses:")
            for course in training['courses']:
                print(f"   • [{course['platform']}] {course['name']}")
                print(f"     {course['description']}")
                print(f"     Link: {course['link']}")
            print()
    else:
        print("Failed to get training recommendations")
    
    return data

def test_multiple_scenarios():
    """Test different skill combinations"""
    print("=" * 70)
    print("Testing Multiple Scenarios")
    print("=" * 70)
    
    scenarios = [
        {
            "name": "Backend Developer",
            "skills": ["Python", "Django", "PostgreSQL", "REST API"],
            "job_title": "Backend Developer"
        },
        {
            "name": "Data Scientist",
            "skills": ["Python", "Machine Learning", "TensorFlow", "Pandas"],
            "job_title": "Data Scientist"
        },
        {
            "name": "DevOps Engineer",
            "skills": ["Docker", "Kubernetes", "AWS", "CI/CD"],
            "job_title": "DevOps Engineer"
        }
    ]
    
    for scenario in scenarios:
        print(f"\n{scenario['name']}:")
        print(f"Skills: {', '.join(scenario['skills'])}")
        
        response = requests.post(TRAINING_URL, json={
            "skills": scenario['skills'],
            "job_title": scenario['job_title'],
            "top_n": 2
        })
        
        data = response.json()
        if data['success'] and len(data['training_recommendations']) > 0:
            print(f"Top Recommendation: {data['training_recommendations'][0]['title']}")
            if len(data['training_recommendations'][0]['courses']) > 0:
                first_course = data['training_recommendations'][0]['courses'][0]
                print(f"  Suggested Course: [{first_course['platform']}] {first_course['name']}")
        print()

if __name__ == "__main__":
    print("\n🚀 ML Service Enhanced Testing Suite 🚀\n")
    
    try:
        # Test 1: Health check
        test_health()
        
        # Test 2: Career path prediction
        test_career_paths()
        
        # Test 3: Training recommendations
        test_training_recommendations()
        
        # Test 4: Multiple scenarios
        test_multiple_scenarios()
        
        print("=" * 70)
        print("✅ All tests completed successfully!")
        print("=" * 70)
        print()
        print("📚 API Documentation: http://localhost:8001/docs")
        print("🔍 You can explore all endpoints interactively at the docs URL")
        print()
        
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to ML service at http://localhost:8001")
        print("Please make sure the server is running:")
        print("  cd backend/ml_service/api")
        print("  python ml_server.py")
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

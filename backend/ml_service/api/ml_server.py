"""
Career Path Prediction API Server

FastAPI server that serves ML model predictions for career paths based on user skills.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import sys

# Add parent directory to path to import train_model
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from train_model import CareerPathPredictor
from utils.course_recommender import CourseRecommender

# Initialize FastAPI app
app = FastAPI(
    title="Career Path Prediction API",
    description="ML-powered career path recommendations based on user skills",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize predictor
predictor = CareerPathPredictor()
model_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')

# Load model on startup
@app.on_event("startup")
async def load_model():
    """Load the trained model when server starts"""
    try:
        predictor.load_model(model_dir)
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"⚠️ Warning: Could not load model: {e}")
        print("Please run train_model.py first to train the model.")


# Request/Response models
class SkillsRequest(BaseModel):
    skills: List[str]
    top_n: int = 5
    
    class Config:
        json_schema_extra = {
            "example": {
                "skills": ["JavaScript", "React", "Node.js", "HTML", "CSS"],
                "top_n": 5
            }
        }


class CareerPath(BaseModel):
    id: int
    title: str
    description: str
    match_score: float
    confidence: str


class Course(BaseModel):
    platform: str
    name: str
    link: str
    description: str


class TrainingRecommendation(BaseModel):
    id: int
    title: str
    courses: List[Course]


class PredictionResponse(BaseModel):
    success: bool
    career_paths: List[CareerPath]
    user_skills: List[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "career_paths": [
                    {
                        "id": 1,
                        "title": "Frontend Developer",
                        "description": "Build user interfaces using React, Vue, or Angular...",
                        "match_score": 0.95,
                        "confidence": "high"
                    }
                ],
                "user_skills": ["JavaScript", "React", "Node.js"]
            }
        }


# API Endpoints
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Career Path Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict-career-paths",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_loaded = predictor.skill_vectors is not None
    return {
        "status": "healthy" if model_loaded else "degraded",
        "model_loaded": model_loaded,
        "message": "Model loaded and ready" if model_loaded else "Model not loaded"
    }


@app.post("/api/predict-career-paths", response_model=PredictionResponse)
async def predict_career_paths(request: SkillsRequest):
    """
    Predict career paths based on user skills
    
    Args:
        request: SkillsRequest containing list of skills and optional top_n
        
    Returns:
        PredictionResponse with career path recommendations
    """
    try:
        # Validate input
        if not request.skills or len(request.skills) == 0:
            raise HTTPException(
                status_code=400,
                detail="Skills list cannot be empty"
            )
        
        if request.top_n < 1 or request.top_n > 10:
            raise HTTPException(
                status_code=400,
                detail="top_n must be between 1 and 10"
            )
        
        # Check if model is loaded
        if predictor.skill_vectors is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please contact administrator."
            )
        
        # Get predictions
        predictions = predictor.predict_career_paths(
            user_skills=request.skills,
            top_n=request.top_n
        )
        
        # Format response
        career_paths = [
            CareerPath(
                id=pred['id'],
                title=pred['title'],
                description=pred['description'],
                match_score=pred['match_score'],
                confidence=pred['confidence']
            )
            for pred in predictions
        ]
        
        return PredictionResponse(
            success=True,
            career_paths=career_paths,
            user_skills=request.skills
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in prediction: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


@app.get("/api/available-careers")
async def get_available_careers():
    """Get list of all available career paths in the model"""
    try:
        if predictor.career_data is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded"
            )
        
        careers = [
            {
                "title": career['title'],
                "description": career['description']
            }
            for career in predictor.career_data
        ]
        
        return {
            "success": True,
            "total_careers": len(careers),
            "careers": careers
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching careers: {str(e)}"
        )


class TrainingRequest(BaseModel):
    skills: List[str]
    job_title: str = ""
    top_n: int = 5
    
    class Config:
        json_schema_extra = {
            "example": {
                "skills": ["JavaScript", "React", "Node.js"],
                "job_title": "Frontend Developer",
                "top_n": 5
            }
        }


class TrainingResponse(BaseModel):
    success: bool
    training_recommendations: List[TrainingRecommendation]
    user_skills: List[str]
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "training_recommendations": [
                    {
                        "id": 1,
                        "title": "Frontend Developer",
                        "courses": [
                            {
                                "platform": "Coursera",
                                "name": "Meta Front-End Developer",
                                "link": "https://www.coursera.org/professional-certificates/meta-front-end-developer",
                                "description": "Learn React, HTML, CSS from Meta"
                            }
                        ]
                    }
                ],
                "user_skills": ["JavaScript", "React"]
            }
        }


@app.post("/api/recommend-training", response_model=TrainingResponse)
async def recommend_training(request: TrainingRequest):
    """
    Recommend training courses based on user skills and job title
    
    Args:
        request: TrainingRequest containing skills, job title, and optional top_n
        
    Returns:
        TrainingResponse with training recommendations and courses
    """
    try:
        # Validate input
        if not request.skills or len(request.skills) == 0:
            raise HTTPException(
                status_code=400,
                detail="Skills list cannot be empty"
            )
        
        if request.top_n < 1 or request.top_n > 10:
            raise HTTPException(
                status_code=400,
                detail="top_n must be between 1 and 10"
            )
        
        # Check if model is loaded
        if predictor.skill_vectors is None:
            raise HTTPException(
                status_code=503,
                detail="Model not loaded. Please contact administrator."
            )
        
        # Get career path predictions first
        career_predictions = predictor.predict_career_paths(
            user_skills=request.skills,
            top_n=request.top_n
        )
        
        # Get course recommendations based on career paths
        training_recommendations = CourseRecommender.recommend_training(
            career_paths=career_predictions,
            user_skills=request.skills
        )
        
        # Format response
        formatted_recommendations = [
            TrainingRecommendation(
                id=rec['id'],
                title=rec['title'],
                courses=[
                    Course(
                        platform=course['platform'],
                        name=course['name'],
                        link=course['link'],
                        description=course['description']
                    )
                    for course in rec['courses']
                ]
            )
            for rec in training_recommendations
        ]
        
        return TrainingResponse(
            success=True,
            training_recommendations=formatted_recommendations,
            user_skills=request.skills
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in training recommendation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    
    print("=" * 70)
    print("Starting Career Path Prediction API Server")
    print("=" * 70)
    print()
    print("📚 API Documentation: http://localhost:8001/docs")
    print("🔍 Health Check: http://localhost:8001/health")
    print("🚀 API Endpoint: http://localhost:8001/api/predict-career-paths")
    print()
    print("=" * 70)
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )

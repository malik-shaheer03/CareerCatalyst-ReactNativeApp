"""
Career Path Prediction Model Training Script

This script trains a machine learning model to predict career paths based on user skills.
It uses TF-IDF vectorization and cosine similarity for skill matching, combined with
a content-based recommendation system.
"""

import json
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

class CareerPathPredictor:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            ngram_range=(1, 2),  # Use unigrams and bigrams
            max_features=500
        )
        self.skill_vectors = None
        self.career_data = []
        
    def load_training_data(self, data_path):
        """Load training data from JSON file"""
        print("Loading training data...")
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        self.training_data = data['training_data']
        print(f"Loaded {len(self.training_data)} training examples")
        
        # Build comprehensive career database
        career_map = {}
        for example in self.training_data:
            skills_text = ', '.join(example['skills']).lower()
            for career in example['career_paths']:
                career_title = career['title']
                if career_title not in career_map:
                    career_map[career_title] = {
                        'title': career_title,
                        'description': career['description'],
                        'related_skills': set(example['skills']),
                        'occurrences': 1
                    }
                else:
                    career_map[career_title]['related_skills'].update(example['skills'])
                    career_map[career_title]['occurrences'] += 1
        
        # Convert to list and create skill text for each career
        self.career_data = []
        for career_title, career_info in career_map.items():
            self.career_data.append({
                'title': career_title,
                'description': career_info['description'],
                'skills_text': ', '.join(career_info['related_skills']).lower(),
                'popularity': career_info['occurrences']
            })
        
        print(f"Built database of {len(self.career_data)} unique career paths")
        
    def train(self):
        """Train the model using TF-IDF vectorization"""
        print("\nTraining model...")
        
        # Create skill text for each career
        career_texts = [career['skills_text'] for career in self.career_data]
        
        # Fit vectorizer and transform career texts
        self.skill_vectors = self.vectorizer.fit_transform(career_texts)
        
        print("Model training completed!")
        print(f"Vocabulary size: {len(self.vectorizer.vocabulary_)}")
        
    def predict_career_paths(self, user_skills, top_n=5):
        """
        Predict top N career paths for given user skills
        
        Args:
            user_skills (list): List of user skills
            top_n (int): Number of career paths to return
            
        Returns:
            list: Top N career paths with match scores
        """
        # Convert user skills to text
        user_skills_text = ', '.join(user_skills).lower()
        
        # Transform user skills using the trained vectorizer
        user_vector = self.vectorizer.transform([user_skills_text])
        
        # Calculate cosine similarity between user skills and all careers
        similarities = cosine_similarity(user_vector, self.skill_vectors)[0]
        
        # Get top N indices
        top_indices = np.argsort(similarities)[::-1][:top_n]
        
        # Build results
        results = []
        for idx, career_idx in enumerate(top_indices):
            match_score = similarities[career_idx]
            career = self.career_data[career_idx]
            
            results.append({
                'id': idx + 1,
                'title': career['title'],
                'description': career['description'],
                'match_score': float(match_score),
                'confidence': 'high' if match_score > 0.5 else 'medium' if match_score > 0.3 else 'low'
            })
        
        return results
    
    def save_model(self, model_dir):
        """Save trained model and vectorizer"""
        print(f"\nSaving model to {model_dir}...")
        
        os.makedirs(model_dir, exist_ok=True)
        
        # Save vectorizer
        with open(os.path.join(model_dir, 'vectorizer.pkl'), 'wb') as f:
            pickle.dump(self.vectorizer, f)
        
        # Save skill vectors
        with open(os.path.join(model_dir, 'skill_vectors.pkl'), 'wb') as f:
            pickle.dump(self.skill_vectors, f)
        
        # Save career data
        with open(os.path.join(model_dir, 'career_data.pkl'), 'wb') as f:
            pickle.dump(self.career_data, f)
        
        print("Model saved successfully!")
    
    def load_model(self, model_dir):
        """Load trained model"""
        print(f"Loading model from {model_dir}...")
        
        with open(os.path.join(model_dir, 'vectorizer.pkl'), 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        with open(os.path.join(model_dir, 'skill_vectors.pkl'), 'rb') as f:
            self.skill_vectors = pickle.load(f)
        
        with open(os.path.join(model_dir, 'career_data.pkl'), 'rb') as f:
            self.career_data = pickle.load(f)
        
        print("Model loaded successfully!")


def main():
    """Main training function"""
    print("=" * 60)
    print("Career Path Prediction Model - Training Script")
    print("=" * 60)
    print()
    
    # Initialize predictor
    predictor = CareerPathPredictor()
    
    # Get paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(current_dir, 'data', 'career_skills_dataset.json')
    model_dir = os.path.join(current_dir, 'models')
    
    # Load and train
    predictor.load_training_data(data_path)
    predictor.train()
    
    # Test the model
    print("\n" + "=" * 60)
    print("Testing Model")
    print("=" * 60)
    
    test_cases = [
        ["JavaScript", "React", "Node.js", "HTML", "CSS"],
        ["Python", "Machine Learning", "TensorFlow", "Data Analysis"],
        ["Java", "Spring Boot", "Microservices", "Docker"],
        ["AWS", "Kubernetes", "DevOps", "CI/CD"]
    ]
    
    for test_skills in test_cases:
        print(f"\nTest Skills: {', '.join(test_skills)}")
        predictions = predictor.predict_career_paths(test_skills, top_n=3)
        
        for pred in predictions:
            print(f"  {pred['id']}. {pred['title']} (Match: {pred['match_score']:.2f}, Confidence: {pred['confidence']})")
    
    # Save the model
    predictor.save_model(model_dir)
    
    print("\n" + "=" * 60)
    print("Training completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()

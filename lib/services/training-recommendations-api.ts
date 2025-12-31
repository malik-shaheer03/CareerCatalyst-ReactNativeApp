import { AIChatSession } from './ai-model';

// ML Service API Configuration
const ML_API_URL = 'http://localhost:8001/api/recommend-training';
const USE_ML_SERVICE = true; // Set to false to use Gemini API fallback

export interface Course {
  platform: string;
  name: string;
  link: string;
  description: string;
}

export interface TrainingRecommendation {
  id: number;
  title: string;
  courses: Course[];
}

/**
 * Get training recommendations from ML service
 */
const getTrainingFromML = async (skillsArray: string[], jobTitle: string): Promise<TrainingRecommendation[]> => {
  try {
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: skillsArray,
        job_title: jobTitle,
        top_n: 5
      })
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.training_recommendations) {
      return data.training_recommendations;
    } else {
      throw new Error('Invalid response from ML service');
    }
  } catch (error) {
    console.error("Error getting training from ML service:", error);
    throw error;
  }
};

/**
 * Get training recommendations from Gemini API (Fallback)
 */
const getTrainingFromGemini = async (skillsArray: string[], jobTitle: string): Promise<TrainingRecommendation[]> => {
  try {
    const prompt = `
Given the user's job title: "${jobTitle}"
and skills: ${skillsArray.join(", ")}

Suggest 5 highly-relevant software development career paths for this user. For each path, provide:
- id: number (1-based index)
- title: string
- courses: array of 2-3 objects, each with:
    - platform: string
    - name: string
    - link: string (USE the **actual, current** URL to a real course on Coursera, Udemy, edX, LinkedIn Learning, or Pluralsight. NEVER use "#", always provide a real URL. Coursera template: https://www.coursera.org/specializations/(course name like google-ai))
    - description: string (1 sentence about the course)

Return only a valid JSON array and nothing else.
`;

    const result = await AIChatSession.sendMessage(prompt);
    const text = await result.response.text();
    
    try {
      const cleaned = text.replace(/```(json)?/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse Gemini response:", text, e);
      return [];
    }
  } catch (error) {
    console.error("Error getting training from Gemini:", error);
    throw error;
  }
};

/**
 * Main function to get training recommendations
 * Uses ML service by default, falls back to Gemini API if ML service is unavailable
 */
export const getRecommendedTraining = async (skillsArray: string[], jobTitle: string): Promise<TrainingRecommendation[]> => {
  try {
    if (USE_ML_SERVICE) {
      // Try ML service first
      try {
        console.log("🤖 Using ML Service for training recommendations...");
        const recommendations = await getTrainingFromML(skillsArray, jobTitle);
        console.log("✅ ML Service returned", recommendations.length, "training recommendations");
        return recommendations;
      } catch (mlError) {
        console.warn("⚠️ ML Service unavailable, falling back to Gemini API...");
        // Fall back to Gemini API
        const recommendations = await getTrainingFromGemini(skillsArray, jobTitle);
        console.log("✅ Gemini API returned", recommendations.length, "training recommendations");
        return recommendations;
      }
    } else {
      // Use Gemini API directly
      console.log("🌟 Using Gemini API for training recommendations...");
      const recommendations = await getTrainingFromGemini(skillsArray, jobTitle);
      console.log("✅ Gemini API returned", recommendations.length, "training recommendations");
      return recommendations;
    }
  } catch (error) {
    console.error("Error getting recommended training:", error);
    throw error;
  }
};

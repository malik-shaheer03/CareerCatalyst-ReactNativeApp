// ML Service API Configuration
const ML_API_URL = 'http://localhost:8001/api/predict-career-paths';
const USE_ML_SERVICE = true; // Set to false to use Gemini API fallback

export interface CareerPath {
  id: number;
  title: string;
  description: string;
  match_score?: number;
  confidence?: string;
}

/**
 * Get career path predictions from ML service
 */
const getCareerPathsFromML = async (skillsArray: string[]): Promise<CareerPath[]> => {
  try {
    const response = await fetch(ML_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        skills: skillsArray,
        top_n: 5
      })
    });

    if (!response.ok) {
      throw new Error(`ML API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.success && data.career_paths) {
      return data.career_paths;
    } else {
      throw new Error('Invalid response from ML service');
    }
  } catch (error) {
    console.error("Error getting career paths from ML service:", error);
    throw error;
  }
};

/**
 * Get career path predictions from Gemini API (Fallback)
 */
const getCareerPathsFromGemini = async (skillsArray: string[]): Promise<CareerPath[]> => {
  try {
    const { AIChatSession } = await import('./ai-model');
    
    // Build a prompt for Gemini
    const prompt = `
Given the following user skills: ${skillsArray.join(", ")}

Suggest 5 suitable software development career paths for this user. 
For each path, provide a JSON object with:
- id: (number, 1-based index)
- title: (string)
- description: (string, 1-2 sentences about the path and relevant technologies)

Return only a valid JSON array and nothing else.
`;

    // Gemini API call
    const result = await AIChatSession.sendMessage(prompt);
    const text = await result.response.text();

    // Parse JSON safely
    try {
      // Remove any codeblock markers if present
      const cleaned = text.replace(/```(json)?/g, "").trim();
      const careerPaths = JSON.parse(cleaned);
      return careerPaths;
    } catch (e) {
      console.error("Failed to parse Gemini response:", text, e);
      return [];
    }
  } catch (error) {
    console.error("Error getting career paths from Gemini:", error);
    throw error;
  }
};

/**
 * Main function to get career paths from skills
 * Uses ML service by default, falls back to Gemini API if ML service is unavailable
 */
export const getCareerPathsFromSkills = async (skillsArray: string[]): Promise<CareerPath[]> => {
  try {
    if (USE_ML_SERVICE) {
      // Try ML service first
      try {
        console.log("🤖 Using ML Service for career path predictions...");
        const paths = await getCareerPathsFromML(skillsArray);
        console.log("✅ ML Service returned", paths.length, "career paths");
        return paths;
      } catch (mlError) {
        console.warn("⚠️ ML Service unavailable, falling back to Gemini API...");
        // Fall back to Gemini API
        const paths = await getCareerPathsFromGemini(skillsArray);
        console.log("✅ Gemini API returned", paths.length, "career paths");
        return paths;
      }
    } else {
      // Use Gemini API directly
      console.log("🌟 Using Gemini API for career path predictions...");
      const paths = await getCareerPathsFromGemini(skillsArray);
      console.log("✅ Gemini API returned", paths.length, "career paths");
      return paths;
    }
  } catch (error) {
    console.error("Error getting career paths from skills:", error);
    throw error;
  }
};

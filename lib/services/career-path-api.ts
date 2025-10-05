import { AIChatSession } from './ai-model';

export interface CareerPath {
  id: number;
  title: string;
  description: string;
}

// Pass an array of skills, receive an array of career paths (id, title, description)
export const getCareerPathsFromSkills = async (skillsArray: string[]): Promise<CareerPath[]> => {
  try {
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
    // result.response.text() returns the model's text output
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
    console.error("Error getting career paths from skills:", error);
    throw error;
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key - In production, this should be stored securely
const API_KEY = "AIzaSyBbhkLUVTDC1j9GpVBJyGcs3YYe2oQHoC0";

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

// Use Gemini 2.5 Flash Lite model
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
});

// Generation configuration
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// Create AI chat session
export const AIChatSession = model.startChat({
  generationConfig,
  history: [],
});

// AI Service class for resume-related operations
export class ResumeAIService {
  /**
   * Generate professional summary based on job title and experience level
   */
  static async generateSummary(jobTitle: string, experienceLevel?: string): Promise<string[]> {
    try {
      const prompt = `Job Title: ${jobTitle}${experienceLevel ? `, Experience Level: ${experienceLevel}` : ''}
      
      Generate a professional summary for this job title. Return a JSON object with the following structure:
      {
        "summaries": [
          {
            "summary": "Professional summary text here",
            "experience_level": "Fresher/Mid-Level/Senior"
          }
        ]
      }
      
      Generate 3 different summaries for different experience levels (Fresher, Mid-Level, Senior) if no specific level is provided.
      Each summary should be 3-4 lines and highlight relevant skills, achievements, and career focus.`;

      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      // Parse JSON response
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed.summaries)) {
        return parsed.summaries.map((item: any) => item.summary);
      } else if (parsed.summary) {
        return [parsed.summary];
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary. Please try again.');
    }
  }

  /**
   * Generate work experience bullet points
   */
  static async generateExperienceBullets(jobTitle: string, companyName?: string): Promise<string[]> {
    try {
      const prompt = `Job Title: ${jobTitle}${companyName ? `, Company: ${companyName}` : ''}
      
      Create a JSON object with the following fields:
      {
        "experience": [
          "Bullet point 1 describing relevant experience",
          "Bullet point 2 describing key responsibilities",
          "Bullet point 3 describing achievements",
          "Bullet point 4 describing skills used",
          "Bullet point 5 describing impact/results"
        ]
      }
      
      Generate 5-7 bullet points that describe relevant experience, responsibilities, achievements, and skills for this job title.
      Each bullet point should be concise, action-oriented, and highlight quantifiable achievements where possible.
      Format each bullet point in HTML with <li> tags.`;

      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed.experience)) {
        return parsed.experience;
      } else if (parsed.experience_bullets) {
        return parsed.experience_bullets;
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Error generating experience bullets:', error);
      throw new Error('Failed to generate experience bullets. Please try again.');
    }
  }

  /**
   * Generate project summary based on project name and tech stack
   */
  static async generateProjectSummary(projectName: string, techStack: string): Promise<string[]> {
    try {
      const prompt = `Project Name: ${projectName}
      Tech Stack: ${techStack}
      
      Create a JSON object with the following fields:
      {
        "projectSummary": [
          "Bullet point 1 describing project overview",
          "Bullet point 2 describing technical implementation",
          "Bullet point 3 describing key features",
          "Bullet point 4 describing challenges solved",
          "Bullet point 5 describing results/impact"
        ]
      }
      
      Generate 5-7 bullet points that describe this project, its technical implementation, key features, challenges, and results.
      Focus on the technologies mentioned in the tech stack and highlight technical achievements.
      Format each bullet point in HTML with <li> tags.`;

      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed.projectSummary)) {
        return parsed.projectSummary;
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Error generating project summary:', error);
      throw new Error('Failed to generate project summary. Please try again.');
    }
  }

  /**
   * Generate skills recommendations based on job title
   */
  static async generateSkillsRecommendations(jobTitle: string): Promise<string[]> {
    try {
      const prompt = `Job Title: ${jobTitle}
      
      Generate a JSON object with the following structure:
      {
        "skills": [
          "Skill 1",
          "Skill 2",
          "Skill 3",
          "Skill 4",
          "Skill 5"
        ]
      }
      
      Generate 8-12 relevant technical and soft skills for this job title.
      Include both hard skills (technical) and soft skills (communication, leadership, etc.).
      Focus on skills that are commonly required and valued in this role.`;

      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      console.log('Raw AI response:', response);
      
      const parsed = JSON.parse(response);
      console.log('Parsed AI response:', parsed);
      
      // Handle different response formats
      if (Array.isArray(parsed.skills)) {
        return parsed.skills;
      } else if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      }
      
      console.error('Unexpected AI response format:', parsed);
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Error generating skills recommendations:', error);
      
      // If it's a JSON parsing error, try to extract skills from the raw response
      if (error instanceof SyntaxError) {
        console.log('JSON parsing failed, trying to extract skills from raw response');
        try {
          // Try to extract skills from the raw response using regex
          const skillMatches = response.match(/"([^"]+)"/g);
          if (skillMatches && skillMatches.length > 0) {
            const skills = skillMatches.map(match => match.replace(/"/g, '')).filter(skill => 
              skill.length > 2 && skill.length < 50 // Reasonable skill name length
            );
            if (skills.length > 0) {
              console.log('Extracted skills from raw response:', skills);
              return skills;
            }
          }
        } catch (extractError) {
          console.error('Failed to extract skills from raw response:', extractError);
        }
      }
      
      throw new Error('Failed to generate skills recommendations. Please try again.');
    }
  }

  /**
   * Generate job recommendations based on user profile
   */
  static async generateJobRecommendations(userProfile: any): Promise<any[]> {
    try {
      const prompt = `User Profile:
      - Job Title: ${userProfile.jobTitle || 'Not specified'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      - Experience: ${userProfile.experience?.length || 0} positions
      - Education: ${userProfile.education?.map((e: any) => e.degree).join(', ') || 'Not specified'}
      
      Generate a JSON object with job recommendations:
      {
        "recommendations": [
          {
            "title": "Job Title",
            "company": "Company Name",
            "location": "Location",
            "description": "Brief job description",
            "match_score": 85
          }
        ]
      }
      
      Generate 5-8 job recommendations that match the user's profile.
      Include match scores (0-100) based on skills, experience, and education alignment.`;

      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed.recommendations)) {
        return parsed.recommendations;
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Error generating job recommendations:', error);
      throw new Error('Failed to generate job recommendations. Please try again.');
    }
  }

  /**
   * Generate training recommendations based on user profile
   */
  static async generateTrainingRecommendations(userProfile: any): Promise<any[]> {
    try {
      const prompt = `User Profile:
      - Job Title: ${userProfile.jobTitle || 'Not specified'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      - Experience Level: ${userProfile.experience?.length || 0} positions
      
      Generate a JSON object with training recommendations:
      {
        "trainings": [
          {
            "title": "Training Course Title",
            "provider": "Provider Name",
            "duration": "Duration",
            "description": "Course description",
            "relevance_score": 90
          }
        ]
      }
      
      Generate 5-8 training recommendations that would help improve skills for this job title.
      Include relevance scores (0-100) and focus on both technical and soft skills development.`;

      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      
      if (Array.isArray(parsed.trainings)) {
        return parsed.trainings;
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('Error generating training recommendations:', error);
      throw new Error('Failed to generate training recommendations. Please try again.');
    }
  }
}

// Export as default
export default ResumeAIService;

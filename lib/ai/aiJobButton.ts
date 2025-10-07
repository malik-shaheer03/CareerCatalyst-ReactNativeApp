import { ResumeAIService } from './aiModel';

export interface JobRecommendation {
  title: string;
  company: string;
  location: string;
  description: string;
  match_score: number;
  salary_range?: string;
  job_type?: string;
  experience_required?: string;
}

export interface TrainingRecommendation {
  title: string;
  provider: string;
  duration: string;
  description: string;
  relevance_score: number;
  cost?: string;
  format?: string;
  certification?: boolean;
}

export class AIJobButtonService {
  /**
   * Get job recommendations based on user profile
   */
  static async getJobRecommendations(userProfile: any): Promise<JobRecommendation[]> {
    try {
      const recommendations = await ResumeAIService.generateJobRecommendations(userProfile);
      return recommendations;
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      throw error;
    }
  }

  /**
   * Get training recommendations based on user profile
   */
  static async getTrainingRecommendations(userProfile: any): Promise<TrainingRecommendation[]> {
    try {
      const recommendations = await ResumeAIService.generateTrainingRecommendations(userProfile);
      return recommendations;
    } catch (error) {
      console.error('Error getting training recommendations:', error);
      throw error;
    }
  }

  /**
   * Get personalized career advice based on user profile
   */
  static async getCareerAdvice(userProfile: any): Promise<string> {
    try {
      const prompt = `User Profile:
      - Job Title: ${userProfile.jobTitle || 'Not specified'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      - Experience: ${userProfile.experience?.length || 0} positions
      - Education: ${userProfile.education?.map((e: any) => e.degree).join(', ') || 'Not specified'}
      
      Provide personalized career advice in 2-3 paragraphs. Focus on:
      1. Career growth opportunities
      2. Skills to develop
      3. Industry trends and insights
      4. Next steps for career advancement
      
      Be encouraging and specific to their profile.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      return response;
    } catch (error) {
      console.error('Error getting career advice:', error);
      throw new Error('Failed to generate career advice. Please try again.');
    }
  }

  /**
   * Analyze resume completeness and provide suggestions
   */
  static async analyzeResumeCompleteness(resumeData: any): Promise<{
    completeness_score: number;
    suggestions: string[];
    missing_sections: string[];
  }> {
    try {
      const prompt = `Resume Analysis:
      - Personal Details: ${resumeData.personal ? 'Present' : 'Missing'}
      - Summary: ${resumeData.summary ? 'Present' : 'Missing'}
      - Experience: ${resumeData.experience?.length || 0} entries
      - Education: ${resumeData.education?.length || 0} entries
      - Skills: ${resumeData.skills?.length || 0} entries
      - Projects: ${resumeData.projects?.length || 0} entries
      
      Analyze this resume and return a JSON object:
      {
        "completeness_score": 85,
        "suggestions": [
          "Add more quantifiable achievements to experience section",
          "Include relevant certifications",
          "Add a professional summary"
        ],
        "missing_sections": [
          "Certifications",
          "Languages"
        ]
      }
      
      Provide a completeness score (0-100) and specific suggestions for improvement.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error analyzing resume completeness:', error);
      throw new Error('Failed to analyze resume. Please try again.');
    }
  }

  /**
   * Generate interview questions based on job title and resume
   */
  static async generateInterviewQuestions(jobTitle: string, resumeData: any): Promise<{
    technical_questions: string[];
    behavioral_questions: string[];
    situational_questions: string[];
  }> {
    try {
      const prompt = `Job Title: ${jobTitle}
      Resume Summary: ${resumeData.summary || 'Not provided'}
      Skills: ${resumeData.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      
      Generate interview questions for this position and candidate profile:
      {
        "technical_questions": [
          "Question 1",
          "Question 2",
          "Question 3"
        ],
        "behavioral_questions": [
          "Question 1",
          "Question 2",
          "Question 3"
        ],
        "situational_questions": [
          "Question 1",
          "Question 2",
          "Question 3"
        ]
      }
      
      Generate 5-7 questions for each category that are relevant to the job title and candidate's background.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error generating interview questions:', error);
      throw new Error('Failed to generate interview questions. Please try again.');
    }
  }
}

export default AIJobButtonService;

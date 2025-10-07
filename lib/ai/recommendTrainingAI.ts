import { ResumeAIService } from './aiModel';

export interface TrainingCourse {
  title: string;
  provider: string;
  duration: string;
  description: string;
  relevance_score: number;
  cost?: string;
  format?: 'Online' | 'In-person' | 'Hybrid';
  certification?: boolean;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  skills_covered?: string[];
  prerequisites?: string[];
  rating?: number;
  url?: string;
}

export interface SkillGap {
  skill: string;
  current_level: number;
  target_level: number;
  gap_score: number;
  recommended_courses: string[];
}

export class RecommendTrainingAIService {
  /**
   * Analyze skill gaps and recommend training courses
   */
  static async analyzeSkillGaps(
    userProfile: any,
    targetJobTitle?: string
  ): Promise<SkillGap[]> {
    try {
      const prompt = `User Profile:
      - Current Job Title: ${userProfile.jobTitle || 'Not specified'}
      - Target Job Title: ${targetJobTitle || 'Same as current'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      - Experience Level: ${userProfile.experience?.length || 0} positions
      
      Analyze skill gaps and return a JSON object:
      {
        "skill_gaps": [
          {
            "skill": "React.js",
            "current_level": 3,
            "target_level": 8,
            "gap_score": 5,
            "recommended_courses": [
              "Advanced React Development",
              "React Performance Optimization"
            ]
          }
        ]
      }
      
      Identify 5-8 key skills where there are gaps between current and target levels.
      Use a scale of 1-10 for skill levels.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return parsed.skill_gaps || [];
    } catch (error) {
      console.error('Error analyzing skill gaps:', error);
      throw new Error('Failed to analyze skill gaps. Please try again.');
    }
  }

  /**
   * Get personalized training recommendations
   */
  static async getPersonalizedTraining(
    userProfile: any,
    skillGaps?: SkillGap[]
  ): Promise<TrainingCourse[]> {
    try {
      const prompt = `User Profile:
      - Job Title: ${userProfile.jobTitle || 'Not specified'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      - Experience Level: ${userProfile.experience?.length || 0} positions
      - Skill Gaps: ${skillGaps?.map(gap => `${gap.skill} (Level ${gap.current_level} → ${gap.target_level})`).join(', ') || 'Not analyzed'}
      
      Generate personalized training recommendations:
      {
        "courses": [
          {
            "title": "Course Title",
            "provider": "Provider Name",
            "duration": "4 weeks",
            "description": "Detailed course description",
            "relevance_score": 95,
            "cost": "$299",
            "format": "Online",
            "certification": true,
            "difficulty": "Intermediate",
            "skills_covered": ["React", "JavaScript", "TypeScript"],
            "prerequisites": ["Basic JavaScript knowledge"],
            "rating": 4.8,
            "url": "https://example.com/course"
          }
        ]
      }
      
      Generate 8-12 training courses that address the identified skill gaps and career goals.
      Include a mix of technical and soft skills courses.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return parsed.courses || [];
    } catch (error) {
      console.error('Error getting personalized training:', error);
      throw new Error('Failed to get training recommendations. Please try again.');
    }
  }

  /**
   * Get trending skills and training recommendations
   */
  static async getTrendingSkillsTraining(
    industry?: string,
    jobTitle?: string
  ): Promise<{
    trending_skills: string[];
    recommended_training: TrainingCourse[];
  }> {
    try {
      const prompt = `Industry: ${industry || 'Technology'}
      Job Title: ${jobTitle || 'Software Developer'}
      
      Generate trending skills and training recommendations:
      {
        "trending_skills": [
          "Artificial Intelligence",
          "Machine Learning",
          "Cloud Computing",
          "DevOps",
          "Cybersecurity"
        ],
        "recommended_training": [
          {
            "title": "AI Fundamentals Course",
            "provider": "Tech Academy",
            "duration": "6 weeks",
            "description": "Comprehensive AI course covering ML, deep learning, and practical applications",
            "relevance_score": 98,
            "cost": "$499",
            "format": "Online",
            "certification": true,
            "difficulty": "Intermediate",
            "skills_covered": ["Python", "TensorFlow", "Machine Learning"],
            "rating": 4.9
          }
        ]
      }
      
      Identify 8-10 trending skills in the industry and recommend 6-8 training courses.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return {
        trending_skills: parsed.trending_skills || [],
        recommended_training: parsed.recommended_training || []
      };
    } catch (error) {
      console.error('Error getting trending skills training:', error);
      throw new Error('Failed to get trending skills training. Please try again.');
    }
  }

  /**
   * Create a personalized learning path
   */
  static async createLearningPath(
    userProfile: any,
    targetRole?: string,
    timeFrame?: string
  ): Promise<{
    learning_path: {
      phase: string;
      duration: string;
      courses: TrainingCourse[];
      goals: string[];
    }[];
    total_duration: string;
    estimated_cost: string;
  }> {
    try {
      const prompt = `User Profile:
      - Current Role: ${userProfile.jobTitle || 'Not specified'}
      - Target Role: ${targetRole || 'Senior Developer'}
      - Time Frame: ${timeFrame || '6 months'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      
      Create a personalized learning path:
      {
        "learning_path": [
          {
            "phase": "Foundation",
            "duration": "4 weeks",
            "courses": [
              {
                "title": "Fundamentals Course",
                "provider": "Tech Academy",
                "duration": "4 weeks",
                "description": "Build strong foundations",
                "relevance_score": 95,
                "cost": "$199"
              }
            ],
            "goals": [
              "Master basic concepts",
              "Complete foundation course"
            ]
          }
        ],
        "total_duration": "6 months",
        "estimated_cost": "$1,200"
      }
      
      Create a 3-4 phase learning path with specific courses and goals for each phase.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error creating learning path:', error);
      throw new Error('Failed to create learning path. Please try again.');
    }
  }

  /**
   * Get certification recommendations
   */
  static async getCertificationRecommendations(
    userProfile: any,
    industry?: string
  ): Promise<{
    certifications: {
      name: string;
      provider: string;
      description: string;
      relevance_score: number;
      cost: string;
      duration: string;
      difficulty: string;
      prerequisites: string[];
      benefits: string[];
    }[];
  }> {
    try {
      const prompt = `User Profile:
      - Job Title: ${userProfile.jobTitle || 'Not specified'}
      - Industry: ${industry || 'Technology'}
      - Skills: ${userProfile.skills?.map((s: any) => s.name).join(', ') || 'Not specified'}
      - Experience: ${userProfile.experience?.length || 0} positions
      
      Recommend relevant certifications:
      {
        "certifications": [
          {
            "name": "AWS Certified Developer",
            "provider": "Amazon Web Services",
            "description": "Validate technical expertise in developing and maintaining applications on AWS",
            "relevance_score": 92,
            "cost": "$150",
            "duration": "3 months preparation",
            "difficulty": "Intermediate",
            "prerequisites": ["Basic cloud knowledge", "Programming experience"],
            "benefits": [
              "Industry recognition",
              "Career advancement",
              "Higher salary potential"
            ]
          }
        ]
      }
      
      Recommend 6-8 relevant certifications for the user's profile and industry.`;

      const { AIChatSession } = await import('./aiModel');
      const result = await AIChatSession.sendMessage(prompt);
      const response = await result.response.text();
      
      const parsed = JSON.parse(response);
      return parsed;
    } catch (error) {
      console.error('Error getting certification recommendations:', error);
      throw new Error('Failed to get certification recommendations. Please try again.');
    }
  }
}

export default RecommendTrainingAIService;

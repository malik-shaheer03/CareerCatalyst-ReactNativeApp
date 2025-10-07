// Test file for AI services
// This file can be used to test AI functionality during development

import { ResumeAIService, AIJobButtonService, RecommendTrainingAIService } from './index';

// Example usage and testing functions
export class AIServiceTester {
  /**
   * Test summary generation
   */
  static async testSummaryGeneration() {
    try {
      console.log('Testing summary generation...');
      const summaries = await ResumeAIService.generateSummary('Software Developer', 'Mid-Level');
      console.log('Generated summaries:', summaries);
      return summaries;
    } catch (error) {
      console.error('Summary generation test failed:', error);
      throw error;
    }
  }

  /**
   * Test experience bullets generation
   */
  static async testExperienceBullets() {
    try {
      console.log('Testing experience bullets generation...');
      const bullets = await ResumeAIService.generateExperienceBullets('React Developer', 'Tech Corp');
      console.log('Generated experience bullets:', bullets);
      return bullets;
    } catch (error) {
      console.error('Experience bullets test failed:', error);
      throw error;
    }
  }

  /**
   * Test project summary generation
   */
  static async testProjectSummary() {
    try {
      console.log('Testing project summary generation...');
      const summary = await ResumeAIService.generateProjectSummary(
        'E-commerce Platform',
        'React, Node.js, MongoDB'
      );
      console.log('Generated project summary:', summary);
      return summary;
    } catch (error) {
      console.error('Project summary test failed:', error);
      throw error;
    }
  }

  /**
   * Test skills recommendations
   */
  static async testSkillsRecommendations() {
    try {
      console.log('Testing skills recommendations...');
      const skills = await ResumeAIService.generateSkillsRecommendations('Full Stack Developer');
      console.log('Generated skills recommendations:', skills);
      return skills;
    } catch (error) {
      console.error('Skills recommendations test failed:', error);
      throw error;
    }
  }

  /**
   * Test job recommendations
   */
  static async testJobRecommendations() {
    try {
      console.log('Testing job recommendations...');
      const mockProfile = {
        jobTitle: 'Frontend Developer',
        skills: [{ name: 'React' }, { name: 'JavaScript' }, { name: 'CSS' }],
        experience: [{ title: 'Junior Developer' }],
        education: [{ degree: 'Computer Science' }]
      };
      
      const recommendations = await AIJobButtonService.getJobRecommendations(mockProfile);
      console.log('Generated job recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('Job recommendations test failed:', error);
      throw error;
    }
  }

  /**
   * Test training recommendations
   */
  static async testTrainingRecommendations() {
    try {
      console.log('Testing training recommendations...');
      const mockProfile = {
        jobTitle: 'Software Engineer',
        skills: [{ name: 'Python' }, { name: 'Django' }],
        experience: [{ title: 'Backend Developer' }]
      };
      
      const recommendations = await RecommendTrainingAIService.getPersonalizedTraining(mockProfile);
      console.log('Generated training recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('Training recommendations test failed:', error);
      throw error;
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Starting AI Services Tests...\n');
    
    try {
      await this.testSummaryGeneration();
      console.log('✅ Summary generation test passed\n');
      
      await this.testExperienceBullets();
      console.log('✅ Experience bullets test passed\n');
      
      await this.testProjectSummary();
      console.log('✅ Project summary test passed\n');
      
      await this.testSkillsRecommendations();
      console.log('✅ Skills recommendations test passed\n');
      
      await this.testJobRecommendations();
      console.log('✅ Job recommendations test passed\n');
      
      await this.testTrainingRecommendations();
      console.log('✅ Training recommendations test passed\n');
      
      console.log('🎉 All AI Services tests passed successfully!');
    } catch (error) {
      console.error('❌ AI Services tests failed:', error);
      throw error;
    }
  }
}

export default AIServiceTester;

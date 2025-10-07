// Test file for Resume API services
// This file can be used to test resume functionality during development

import ResumeAPI from './resumeAPI';
import { ResumeValidationService } from './resumeValidation';
import { ResumeUtils } from './resumeUtils';
import { ResumeData } from './resumeAPI';

// Example usage and testing functions
export class ResumeAPITester {
  /**
   * Test creating a new resume
   */
  static async testCreateResume(): Promise<ResumeData> {
    try {
      console.log('Testing resume creation...');
      
      const sampleResume = {
        title: 'Test Resume',
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          jobTitle: 'Software Developer',
          email: 'john.doe@example.com',
          phone: '+1234567890',
          address: '123 Main St, City, State 12345'
        },
        summary: 'Experienced software developer with 5+ years of experience in web development.',
        experience: [{
          title: 'Senior Developer',
          companyName: 'Tech Corp',
          city: 'San Francisco',
          state: 'CA',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          currentlyWorking: false,
          workSummary: 'Led development of web applications using React and Node.js'
        }],
        education: [{
          universityName: 'University of Technology',
          degree: 'Bachelor of Science',
          major: 'Computer Science',
          grade: '3.8',
          gradeType: 'GPA' as const,
          startDate: '2016-09-01',
          endDate: '2020-05-31',
          description: 'Graduated with honors'
        }],
        skills: [
          { name: 'JavaScript' },
          { name: 'React' },
          { name: 'Node.js' },
          { name: 'Python' }
        ],
        projects: [{
          projectName: 'E-commerce Platform',
          techStack: 'React, Node.js, MongoDB',
          projectSummary: 'Built a full-stack e-commerce platform with user authentication and payment processing'
        }]
      };

      const createdResume = await ResumeAPI.createResume(sampleResume);
      console.log('Resume created successfully:', createdResume.id);
      return createdResume;
    } catch (error) {
      console.error('Resume creation test failed:', error);
      throw error;
    }
  }

  /**
   * Test fetching all resumes
   */
  static async testGetAllResumes() {
    try {
      console.log('Testing fetch all resumes...');
      const resumes = await ResumeAPI.getAllResumes();
      console.log('Fetched resumes:', resumes.length);
      return resumes;
    } catch (error) {
      console.error('Fetch all resumes test failed:', error);
      throw error;
    }
  }

  /**
   * Test fetching a specific resume
   */
  static async testGetResume(resumeId: string) {
    try {
      console.log('Testing fetch specific resume...');
      const resume = await ResumeAPI.getResume(resumeId);
      console.log('Fetched resume:', resume.title);
      return resume;
    } catch (error) {
      console.error('Fetch resume test failed:', error);
      throw error;
    }
  }

  /**
   * Test updating a resume
   */
  static async testUpdateResume(resumeId: string) {
    try {
      console.log('Testing resume update...');
      const updateData = {
        title: 'Updated Test Resume',
        summary: 'Updated summary with more details about my experience.'
      };
      
      await ResumeAPI.updateResume(resumeId, updateData);
      console.log('Resume updated successfully');
    } catch (error) {
      console.error('Resume update test failed:', error);
      throw error;
    }
  }

  /**
   * Test updating a specific section
   */
  static async testUpdateResumeSection(resumeId: string) {
    try {
      console.log('Testing resume section update...');
      const newSkills = [
        { name: 'TypeScript' },
        { name: 'Vue.js' },
        { name: 'Docker' }
      ];
      
      await ResumeAPI.updateResumeSection(resumeId, 'skills', newSkills);
      console.log('Resume section updated successfully');
    } catch (error) {
      console.error('Resume section update test failed:', error);
      throw error;
    }
  }

  /**
   * Test resume validation
   */
  static async testResumeValidation() {
    try {
      console.log('Testing resume validation...');
      
      const incompleteResume = {
        title: 'Incomplete Resume',
        personal: {
          firstName: 'Jane',
          lastName: 'Smith',
          jobTitle: '',
          email: 'invalid-email',
          phone: '',
          address: ''
        },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        projects: []
      };

      const validation = ResumeValidationService.validateResume(incompleteResume);
      console.log('Validation result:', validation);
      return validation;
    } catch (error) {
      console.error('Resume validation test failed:', error);
      throw error;
    }
  }

  /**
   * Test resume utilities
   */
  static async testResumeUtils() {
    try {
      console.log('Testing resume utilities...');
      
      const sampleResume = {
        title: 'Test Resume',
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          jobTitle: 'Software Developer',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St'
        },
        summary: 'Experienced developer',
        experience: [{
          title: 'Developer',
          companyName: 'Tech Corp',
          city: 'SF',
          state: 'CA',
          startDate: '2020-01-01',
          endDate: '2023-12-31',
          currentlyWorking: false,
          workSummary: 'Built React applications'
        }],
        education: [],
        skills: [{ name: 'JavaScript' }, { name: 'React' }],
        projects: []
      };

      // Test title generation
      const title = ResumeUtils.generateResumeTitle(sampleResume.personal);
      console.log('Generated title:', title);

      // Test experience years calculation
      const years = ResumeUtils.calculateExperienceYears(sampleResume.experience);
      console.log('Experience years:', years);

      // Test experience level
      const level = ResumeUtils.getExperienceLevel(years);
      console.log('Experience level:', level);

      // Test preview text generation
      const preview = ResumeUtils.generatePreviewText(sampleResume as ResumeData);
      console.log('Preview text:', preview);

      // Test resume stats
      const stats = ResumeUtils.getResumeStats(sampleResume as ResumeData);
      console.log('Resume stats:', stats);

      return {
        title,
        years,
        level,
        preview,
        stats
      };
    } catch (error) {
      console.error('Resume utilities test failed:', error);
      throw error;
    }
  }

  /**
   * Test resume search
   */
  static async testResumeSearch() {
    try {
      console.log('Testing resume search...');
      const searchResults = await ResumeAPI.searchResumes('Test');
      console.log('Search results:', searchResults.length);
      return searchResults;
    } catch (error) {
      console.error('Resume search test failed:', error);
      throw error;
    }
  }

  /**
   * Test resume duplication
   */
  static async testResumeDuplication(resumeId: string) {
    try {
      console.log('Testing resume duplication...');
      const duplicatedResume = await ResumeAPI.duplicateResume(resumeId, 'Duplicated Resume');
      console.log('Resume duplicated successfully:', duplicatedResume.id);
      return duplicatedResume;
    } catch (error) {
      console.error('Resume duplication test failed:', error);
      throw error;
    }
  }

  /**
   * Test resume export/import
   */
  static async testResumeExportImport(resumeId: string) {
    try {
      console.log('Testing resume export/import...');
      
      // Export resume
      const jsonData = await ResumeAPI.exportResume(resumeId);
      console.log('Resume exported, size:', jsonData.length, 'characters');
      
      // Import resume
      const importedResume = await ResumeAPI.importResume(jsonData, 'Imported Resume');
      console.log('Resume imported successfully:', importedResume.id);
      
      return { exported: jsonData, imported: importedResume };
    } catch (error) {
      console.error('Resume export/import test failed:', error);
      throw error;
    }
  }

  /**
   * Test resume statistics
   */
  static async testResumeStats() {
    try {
      console.log('Testing resume statistics...');
      const stats = await ResumeAPI.getResumeStats();
      console.log('Resume statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Resume statistics test failed:', error);
      throw error;
    }
  }

  /**
   * Run all tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Resume API Tests...\n');
    
    try {
      // Test utilities first (no API calls)
      await this.testResumeUtils();
      console.log('✅ Resume utilities test passed\n');
      
      await this.testResumeValidation();
      console.log('✅ Resume validation test passed\n');
      
      // Test API operations
      const createdResume = await this.testCreateResume();
      console.log('✅ Resume creation test passed\n');
      
      await this.testGetAllResumes();
      console.log('✅ Fetch all resumes test passed\n');
      
      await this.testGetResume(createdResume.id!);
      console.log('✅ Fetch specific resume test passed\n');
      
      await this.testUpdateResume(createdResume.id!);
      console.log('✅ Resume update test passed\n');
      
      await this.testUpdateResumeSection(createdResume.id!);
      console.log('✅ Resume section update test passed\n');
      
      await this.testResumeSearch();
      console.log('✅ Resume search test passed\n');
      
      await this.testResumeDuplication(createdResume.id!);
      console.log('✅ Resume duplication test passed\n');
      
      await this.testResumeExportImport(createdResume.id!);
      console.log('✅ Resume export/import test passed\n');
      
      await this.testResumeStats();
      console.log('✅ Resume statistics test passed\n');
      
      console.log('🎉 All Resume API tests passed successfully!');
    } catch (error) {
      console.error('❌ Resume API tests failed:', error);
      throw error;
    }
  }
}

export default ResumeAPITester;

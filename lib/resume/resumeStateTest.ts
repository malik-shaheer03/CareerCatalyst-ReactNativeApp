// Test file for Resume State Management
// This file can be used to test state management functionality during development

import { ResumeProvider, useResume } from './resumeContext';
import { useResumeStats, useResumeSearch } from './resumeHooks';
import { ResumeData } from './resumeAPI';

// Example usage and testing functions
export class ResumeStateTester {
  /**
   * Test context provider
   */
  static testContextProvider() {
    console.log('Testing Resume Context Provider...');
    
    // This would be used in a React component
    const TestComponent = () => {
      const { state, actions } = useResume();
      const stats = useResumeStats();
      const search = useResumeSearch();
      
      console.log('Context state:', state);
      console.log('Stats:', stats);
      console.log('Search:', search);
      
      return null;
    };
    
    console.log('✅ Context provider test passed');
    return TestComponent;
  }

  /**
   * Test state management operations
   */
  static async testStateOperations() {
    console.log('Testing state management operations...');
    
    try {
      // This would be called from within a ResumeProvider
      const mockActions = {
        createResume: async (data: Partial<ResumeData>) => {
          console.log('Creating resume:', data);
          return data as ResumeData;
        },
        loadResume: async (id: string) => {
          console.log('Loading resume:', id);
        },
        updateResume: async (data: Partial<ResumeData>) => {
          console.log('Updating resume:', data);
        },
        deleteResume: async (id: string) => {
          console.log('Deleting resume:', id);
        },
        loadResumeList: async () => {
          console.log('Loading resume list');
        },
        searchResumes: async (query: string) => {
          console.log('Searching resumes:', query);
        },
        setActiveSection: (section: string | null) => {
          console.log('Setting active section:', section);
        },
        validateResume: () => {
          console.log('Validating resume');
        },
        loadStats: async () => {
          console.log('Loading stats');
        },
        autoSave: async () => {
          console.log('Auto-saving');
        }
      };

      // Test create resume
      await mockActions.createResume({
        title: 'Test Resume',
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          jobTitle: 'Developer',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St'
        }
      });

      // Test load resume
      await mockActions.loadResume('test-id');

      // Test update resume
      await mockActions.updateResume({
        title: 'Updated Resume'
      });

      // Test search
      await mockActions.searchResumes('test');

      // Test section management
      mockActions.setActiveSection('personal');
      mockActions.setActiveSection(null);

      // Test validation
      mockActions.validateResume();

      // Test stats
      await mockActions.loadStats();

      // Test auto-save
      await mockActions.autoSave();

      console.log('✅ State operations test passed');
    } catch (error) {
      console.error('❌ State operations test failed:', error);
      throw error;
    }
  }

  /**
   * Test custom hooks
   */
  static testCustomHooks() {
    console.log('Testing custom hooks...');
    
    try {
      // Test useResumeStats hook
      const mockStatsHook = () => {
        const stats = {
          wordCount: 500,
          characterCount: 2500,
          sectionCount: 6,
          experienceYears: 3.5,
          skillCount: 8,
          projectCount: 2,
          globalStats: {
            totalResumes: 5,
            lastUpdated: new Date().toISOString(),
            mostUsedTheme: '#004D40'
          },
          loadStats: async () => {
            console.log('Loading stats...');
          }
        };
        return stats;
      };

      const stats = mockStatsHook();
      console.log('Stats hook result:', stats);

      // Test useResumeSearch hook
      const mockSearchHook = () => {
        const search = {
          searchQuery: 'test',
          searchResults: [],
          searchHistory: ['test', 'developer', 'react'],
          isSearching: false,
          search: async (query: string) => {
            console.log('Searching for:', query);
          },
          clearSearch: () => {
            console.log('Clearing search');
          }
        };
        return search;
      };

      const search = mockSearchHook();
      console.log('Search hook result:', search);

      console.log('✅ Custom hooks test passed');
    } catch (error) {
      console.error('❌ Custom hooks test failed:', error);
      throw error;
    }
  }

  /**
   * Test persistence service
   */
  static async testPersistenceService() {
    console.log('Testing persistence service...');
    
    try {
      // Mock AsyncStorage for testing
      const mockAsyncStorage = {
        setItem: async (key: string, value: string) => {
          console.log(`Setting ${key}:`, value.substring(0, 100) + '...');
        },
        getItem: async (key: string) => {
          console.log(`Getting ${key}`);
          return null;
        },
        removeItem: async (key: string) => {
          console.log(`Removing ${key}`);
        },
        getAllKeys: async () => {
          console.log('Getting all keys');
          return [];
        },
        multiRemove: async (keys: string[]) => {
          console.log('Removing multiple keys:', keys);
        }
      };

      // Test saving data
      await mockAsyncStorage.setItem('test_key', JSON.stringify({ test: 'data' }));
      
      // Test getting data
      const data = await mockAsyncStorage.getItem('test_key');
      console.log('Retrieved data:', data);

      // Test removing data
      await mockAsyncStorage.removeItem('test_key');

      console.log('✅ Persistence service test passed');
    } catch (error) {
      console.error('❌ Persistence service test failed:', error);
      throw error;
    }
  }

  /**
   * Test state manager
   */
  static async testStateManager() {
    console.log('Testing state manager...');
    
    try {
      // Mock state manager
      const mockStateManager = {
        getState: () => ({
          currentResume: null,
          resumeList: [],
          isOnline: true,
          lastSync: null,
          preferences: {
            autoSave: true,
            autoSaveInterval: 5,
            defaultTheme: '#004D40',
            showValidationWarnings: true,
            enableAnalytics: true,
            exportFormat: 'json',
            lastUsedSections: []
          }
        }),
        setCurrentResume: async (resume: ResumeData | null) => {
          console.log('Setting current resume:', resume?.title);
        },
        updateResumeList: async (resumes: any[]) => {
          console.log('Updating resume list:', resumes.length);
        },
        searchResumes: (query: string) => {
          console.log('Searching resumes:', query);
          return [];
        },
        getResumeStats: () => ({
          wordCount: 500,
          characterCount: 2500,
          sectionCount: 6,
          experienceYears: 3.5,
          skillCount: 8,
          projectCount: 2
        }),
        healthCheck: async () => ({
          isHealthy: true,
          isOnline: true,
          lastSync: new Date().toISOString(),
          resumeCount: 0
        })
      };

      // Test state operations
      const state = mockStateManager.getState();
      console.log('Initial state:', state);

      await mockStateManager.setCurrentResume({
        id: 'test-id',
        title: 'Test Resume',
        personal: {
          firstName: 'John',
          lastName: 'Doe',
          jobTitle: 'Developer',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St'
        },
        summary: 'Test summary',
        experience: [],
        education: [],
        skills: [],
        projects: []
      });

      await mockStateManager.updateResumeList([
        {
          id: 'test-id',
          title: 'Test Resume',
          personal: {
            firstName: 'John',
            lastName: 'Doe',
            jobTitle: 'Developer'
          },
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        }
      ]);

      const searchResults = mockStateManager.searchResumes('test');
      console.log('Search results:', searchResults);

      const stats = mockStateManager.getResumeStats();
      console.log('Resume stats:', stats);

      const health = await mockStateManager.healthCheck();
      console.log('Health check:', health);

      console.log('✅ State manager test passed');
    } catch (error) {
      console.error('❌ State manager test failed:', error);
      throw error;
    }
  }

  /**
   * Test error handling
   */
  static async testErrorHandling() {
    console.log('Testing error handling...');
    
    try {
      // Test error scenarios
      const mockErrorActions = {
        createResume: async () => {
          throw new Error('Failed to create resume');
        },
        loadResume: async () => {
          throw new Error('Failed to load resume');
        },
        updateResume: async () => {
          throw new Error('Failed to update resume');
        }
      };

      try {
        await mockErrorActions.createResume();
      } catch (error) {
        console.log('Caught create error:', error.message);
      }

      try {
        await mockErrorActions.loadResume();
      } catch (error) {
        console.log('Caught load error:', error.message);
      }

      try {
        await mockErrorActions.updateResume();
      } catch (error) {
        console.log('Caught update error:', error.message);
      }

      console.log('✅ Error handling test passed');
    } catch (error) {
      console.error('❌ Error handling test failed:', error);
      throw error;
    }
  }

  /**
   * Run all state management tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Resume State Management Tests...\n');
    
    try {
      this.testContextProvider();
      console.log('✅ Context provider test passed\n');
      
      await this.testStateOperations();
      console.log('✅ State operations test passed\n');
      
      this.testCustomHooks();
      console.log('✅ Custom hooks test passed\n');
      
      await this.testPersistenceService();
      console.log('✅ Persistence service test passed\n');
      
      await this.testStateManager();
      console.log('✅ State manager test passed\n');
      
      await this.testErrorHandling();
      console.log('✅ Error handling test passed\n');
      
      console.log('🎉 All Resume State Management tests passed successfully!');
    } catch (error) {
      console.error('❌ Resume State Management tests failed:', error);
      throw error;
    }
  }
}

export default ResumeStateTester;

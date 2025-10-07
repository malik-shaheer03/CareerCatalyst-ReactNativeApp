import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResumeData, ResumeListItem } from './resumeAPI';

// Storage keys
const STORAGE_KEYS = {
  CURRENT_RESUME: 'resume_current',
  RESUME_LIST: 'resume_list',
  ACTIVE_SECTION: 'resume_active_section',
  SEARCH_QUERY: 'resume_search_query',
  THEME_PREFERENCES: 'resume_theme_preferences',
  USER_PREFERENCES: 'resume_user_preferences',
  DRAFT_DATA: 'resume_draft_data',
  LAST_SYNC: 'resume_last_sync'
};

// User preferences interface
export interface ResumeUserPreferences {
  autoSave: boolean;
  autoSaveInterval: number; // in seconds
  defaultTheme: string;
  showValidationWarnings: boolean;
  enableAnalytics: boolean;
  exportFormat: 'json' | 'txt' | 'md';
  lastUsedSections: string[];
}

// Default preferences
const DEFAULT_PREFERENCES: ResumeUserPreferences = {
  autoSave: true,
  autoSaveInterval: 5,
  defaultTheme: '#004D40',
  showValidationWarnings: true,
  enableAnalytics: true,
  exportFormat: 'json',
  lastUsedSections: []
};

export class ResumePersistenceService {
  /**
   * Save current resume to local storage
   */
  static async saveCurrentResume(resume: ResumeData | null): Promise<void> {
    try {
      if (resume) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_RESUME, JSON.stringify(resume));
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_RESUME);
      }
    } catch (error) {
      console.error('Failed to save current resume:', error);
      throw new Error('Failed to save resume locally');
    }
  }

  /**
   * Load current resume from local storage
   */
  static async loadCurrentResume(): Promise<ResumeData | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_RESUME);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load current resume:', error);
      return null;
    }
  }

  /**
   * Save resume list to local storage
   */
  static async saveResumeList(resumes: ResumeListItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RESUME_LIST, JSON.stringify(resumes));
    } catch (error) {
      console.error('Failed to save resume list:', error);
      throw new Error('Failed to save resume list locally');
    }
  }

  /**
   * Load resume list from local storage
   */
  static async loadResumeList(): Promise<ResumeListItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RESUME_LIST);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load resume list:', error);
      return [];
    }
  }

  /**
   * Save active section
   */
  static async saveActiveSection(section: string | null): Promise<void> {
    try {
      if (section) {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_SECTION, section);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_SECTION);
      }
    } catch (error) {
      console.error('Failed to save active section:', error);
    }
  }

  /**
   * Load active section
   */
  static async loadActiveSection(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SECTION);
    } catch (error) {
      console.error('Failed to load active section:', error);
      return null;
    }
  }

  /**
   * Save search query
   */
  static async saveSearchQuery(query: string): Promise<void> {
    try {
      if (query.trim()) {
        await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_QUERY, query);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_QUERY);
      }
    } catch (error) {
      console.error('Failed to save search query:', error);
    }
  }

  /**
   * Load search query
   */
  static async loadSearchQuery(): Promise<string> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_QUERY) || '';
    } catch (error) {
      console.error('Failed to load search query:', error);
      return '';
    }
  }

  /**
   * Save user preferences
   */
  static async saveUserPreferences(preferences: Partial<ResumeUserPreferences>): Promise<void> {
    try {
      const currentPrefs = await this.loadUserPreferences();
      const updatedPrefs = { ...currentPrefs, ...preferences };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(updatedPrefs));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  /**
   * Load user preferences
   */
  static async loadUserPreferences(): Promise<ResumeUserPreferences> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
      return data ? { ...DEFAULT_PREFERENCES, ...JSON.parse(data) } : DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Failed to load user preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Save draft data for offline editing
   */
  static async saveDraftData(resumeId: string, data: Partial<ResumeData>): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_DATA}_${resumeId}`;
      await AsyncStorage.setItem(key, JSON.stringify({
        ...data,
        lastModified: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save draft data:', error);
      throw new Error('Failed to save draft data');
    }
  }

  /**
   * Load draft data
   */
  static async loadDraftData(resumeId: string): Promise<Partial<ResumeData> | null> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_DATA}_${resumeId}`;
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load draft data:', error);
      return null;
    }
  }

  /**
   * Clear draft data
   */
  static async clearDraftData(resumeId: string): Promise<void> {
    try {
      const key = `${STORAGE_KEYS.DRAFT_DATA}_${resumeId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear draft data:', error);
    }
  }

  /**
   * Get all draft data keys
   */
  static async getAllDraftKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.filter(key => key.startsWith(STORAGE_KEYS.DRAFT_DATA));
    } catch (error) {
      console.error('Failed to get draft keys:', error);
      return [];
    }
  }

  /**
   * Clear all draft data
   */
  static async clearAllDraftData(): Promise<void> {
    try {
      const draftKeys = await this.getAllDraftKeys();
      await AsyncStorage.multiRemove(draftKeys);
    } catch (error) {
      console.error('Failed to clear all draft data:', error);
      throw new Error('Failed to clear draft data');
    }
  }

  /**
   * Save last sync timestamp
   */
  static async saveLastSync(timestamp: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Failed to save last sync:', error);
    }
  }

  /**
   * Load last sync timestamp
   */
  static async loadLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Failed to load last sync:', error);
      return null;
    }
  }

  /**
   * Save complete app state
   */
  static async saveAppState(state: {
    currentResume: ResumeData | null;
    resumeList: ResumeListItem[];
    activeSection: string | null;
    searchQuery: string;
    preferences: ResumeUserPreferences;
  }): Promise<void> {
    try {
      await Promise.all([
        this.saveCurrentResume(state.currentResume),
        this.saveResumeList(state.resumeList),
        this.saveActiveSection(state.activeSection),
        this.saveSearchQuery(state.searchQuery),
        this.saveUserPreferences(state.preferences)
      ]);
    } catch (error) {
      console.error('Failed to save app state:', error);
      throw new Error('Failed to save app state');
    }
  }

  /**
   * Load complete app state
   */
  static async loadAppState(): Promise<{
    currentResume: ResumeData | null;
    resumeList: ResumeListItem[];
    activeSection: string | null;
    searchQuery: string;
    preferences: ResumeUserPreferences;
  }> {
    try {
      const [currentResume, resumeList, activeSection, searchQuery, preferences] = await Promise.all([
        this.loadCurrentResume(),
        this.loadResumeList(),
        this.loadActiveSection(),
        this.loadSearchQuery(),
        this.loadUserPreferences()
      ]);

      return {
        currentResume,
        resumeList,
        activeSection,
        searchQuery,
        preferences
      };
    } catch (error) {
      console.error('Failed to load app state:', error);
      return {
        currentResume: null,
        resumeList: [],
        activeSection: null,
        searchQuery: '',
        preferences: DEFAULT_PREFERENCES
      };
    }
  }

  /**
   * Clear all resume data
   */
  static async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw new Error('Failed to clear all data');
    }
  }

  /**
   * Get storage usage information
   */
  static async getStorageInfo(): Promise<{
    totalSize: number;
    keyCount: number;
    resumeCount: number;
    draftCount: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const resumeKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DRAFT_DATA));
      
      let totalSize = 0;
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return {
        totalSize,
        keyCount: keys.length,
        resumeCount: resumeKeys.length,
        draftCount: resumeKeys.length
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return {
        totalSize: 0,
        keyCount: 0,
        resumeCount: 0,
        draftCount: 0
      };
    }
  }

  /**
   * Migrate data from old format (if needed)
   */
  static async migrateData(): Promise<void> {
    try {
      // This would contain migration logic for app updates
      // For now, it's a placeholder
      console.log('Data migration completed');
    } catch (error) {
      console.error('Data migration failed:', error);
      throw new Error('Data migration failed');
    }
  }
}

export default ResumePersistenceService;

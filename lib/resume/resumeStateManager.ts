import { ResumeData, ResumeListItem, ValidationResult } from './resumeAPI';
import { ResumePersistenceService, ResumeUserPreferences } from './resumePersistence';
import { ResumeUtils } from './resumeUtils';

// State Manager for complex resume operations
export class ResumeStateManager {
  private static instance: ResumeStateManager;
  private listeners: Set<(state: any) => void> = new Set();
  private state: {
    currentResume: ResumeData | null;
    resumeList: ResumeListItem[];
    isOnline: boolean;
    lastSync: string | null;
    preferences: ResumeUserPreferences;
  } = {
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
  };

  private constructor() {
    this.initializeState();
  }

  static getInstance(): ResumeStateManager {
    if (!ResumeStateManager.instance) {
      ResumeStateManager.instance = new ResumeStateManager();
    }
    return ResumeStateManager.instance;
  }

  private async initializeState() {
    try {
      const savedState = await ResumePersistenceService.loadAppState();
      this.state = {
        ...this.state,
        ...savedState,
        isOnline: navigator.onLine !== false
      };
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to initialize state:', error);
    }
  }

  // Subscribe to state changes
  subscribe(listener: (state: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Set current resume
  async setCurrentResume(resume: ResumeData | null) {
    this.state.currentResume = resume;
    await ResumePersistenceService.saveCurrentResume(resume);
    this.notifyListeners();
  }

  // Update resume list
  async updateResumeList(resumes: ResumeListItem[]) {
    this.state.resumeList = resumes;
    await ResumePersistenceService.saveResumeList(resumes);
    this.notifyListeners();
  }

  // Add resume to list
  async addResumeToList(resume: ResumeListItem) {
    this.state.resumeList = [resume, ...this.state.resumeList];
    await ResumePersistenceService.saveResumeList(this.state.resumeList);
    this.notifyListeners();
  }

  // Update resume in list
  async updateResumeInList(resume: ResumeListItem) {
    this.state.resumeList = this.state.resumeList.map(r => 
      r.id === resume.id ? resume : r
    );
    await ResumePersistenceService.saveResumeList(this.state.resumeList);
    this.notifyListeners();
  }

  // Remove resume from list
  async removeResumeFromList(resumeId: string) {
    this.state.resumeList = this.state.resumeList.filter(r => r.id !== resumeId);
    await ResumePersistenceService.saveResumeList(this.state.resumeList);
    this.notifyListeners();
  }

  // Set online status
  setOnlineStatus(isOnline: boolean) {
    this.state.isOnline = isOnline;
    this.notifyListeners();
  }

  // Update preferences
  async updatePreferences(preferences: Partial<ResumeUserPreferences>) {
    this.state.preferences = { ...this.state.preferences, ...preferences };
    await ResumePersistenceService.saveUserPreferences(preferences);
    this.notifyListeners();
  }

  // Get preferences
  getPreferences(): ResumeUserPreferences {
    return { ...this.state.preferences };
  }

  // Save draft data
  async saveDraft(resumeId: string, data: Partial<ResumeData>) {
    if (!this.state.isOnline) {
      await ResumePersistenceService.saveDraftData(resumeId, data);
    }
  }

  // Load draft data
  async loadDraft(resumeId: string): Promise<Partial<ResumeData> | null> {
    return await ResumePersistenceService.loadDraftData(resumeId);
  }

  // Clear draft data
  async clearDraft(resumeId: string) {
    await ResumePersistenceService.clearDraftData(resumeId);
  }

  // Sync with server (when online)
  async syncWithServer() {
    if (!this.state.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    try {
      // This would contain sync logic with the server
      const now = new Date().toISOString();
      this.state.lastSync = now;
      await ResumePersistenceService.saveLastSync(now);
      this.notifyListeners();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  // Get resume statistics
  getResumeStats() {
    const currentResume = this.state.currentResume;
    if (!currentResume) {
      return null;
    }

    return ResumeUtils.getResumeStats(currentResume);
  }

  // Get validation result
  getValidationResult(): ValidationResult | null {
    const currentResume = this.state.currentResume;
    if (!currentResume) {
      return null;
    }

    // This would use the validation service
    return {
      isValid: true,
      errors: [],
      warnings: [],
      completenessScore: 100
    };
  }

  // Export resume
  async exportResume(resumeId: string, format: 'json' | 'txt' | 'md' = 'json') {
    const resume = this.state.resumeList.find(r => r.id === resumeId);
    if (!resume) {
      throw new Error('Resume not found');
    }

    // This would load the full resume data and export it
    return ResumeUtils.exportResume(resume as ResumeData, format);
  }

  // Search resumes
  searchResumes(query: string): ResumeListItem[] {
    if (!query.trim()) {
      return this.state.resumeList;
    }

    const searchTerm = query.toLowerCase();
    return this.state.resumeList.filter(resume => 
      resume.title.toLowerCase().includes(searchTerm) ||
      resume.personal.firstName.toLowerCase().includes(searchTerm) ||
      resume.personal.lastName.toLowerCase().includes(searchTerm) ||
      resume.personal.jobTitle.toLowerCase().includes(searchTerm)
    );
  }

  // Get recent resumes
  getRecentResumes(limit: number = 5): ResumeListItem[] {
    return this.state.resumeList
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, limit);
  }

  // Get resume by ID
  getResumeById(resumeId: string): ResumeListItem | null {
    return this.state.resumeList.find(r => r.id === resumeId) || null;
  }

  // Check if resume exists
  hasResume(resumeId: string): boolean {
    return this.state.resumeList.some(r => r.id === resumeId);
  }

  // Get resume count
  getResumeCount(): number {
    return this.state.resumeList.length;
  }

  // Get storage info
  async getStorageInfo() {
    return await ResumePersistenceService.getStorageInfo();
  }

  // Clear all data
  async clearAllData() {
    await ResumePersistenceService.clearAllData();
    this.state = {
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
    };
    this.notifyListeners();
  }

  // Migrate data
  async migrateData() {
    await ResumePersistenceService.migrateData();
  }

  // Health check
  async healthCheck() {
    try {
      const storageInfo = await this.getStorageInfo();
      return {
        isHealthy: true,
        isOnline: this.state.isOnline,
        lastSync: this.state.lastSync,
        storageInfo,
        resumeCount: this.getResumeCount()
      };
    } catch (error) {
      return {
        isHealthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        isOnline: this.state.isOnline,
        lastSync: this.state.lastSync,
        resumeCount: this.getResumeCount()
      };
    }
  }
}

// Export singleton instance
export const resumeStateManager = ResumeStateManager.getInstance();

// Export types
export type { ResumeUserPreferences } from './resumePersistence';

export default resumeStateManager;

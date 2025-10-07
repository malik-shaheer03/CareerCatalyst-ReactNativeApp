import { useEffect, useState, useCallback } from 'react';
import { useResume, useCurrentResume, useResumeList } from './resumeContext';
import { ResumeData, ResumeListItem } from './resumeAPI';
import { ResumeUtils } from './resumeUtils';

// Hook for resume statistics
export function useResumeStats() {
  const { state, actions } = useResume();
  const [localStats, setLocalStats] = useState({
    wordCount: 0,
    characterCount: 0,
    sectionCount: 0,
    experienceYears: 0,
    skillCount: 0,
    projectCount: 0
  });

  const currentResume = useCurrentResume();

  useEffect(() => {
    if (currentResume) {
      const stats = ResumeUtils.getResumeStats(currentResume);
      setLocalStats(stats);
    }
  }, [currentResume]);

  const loadStats = useCallback(async () => {
    await actions.loadStats();
  }, [actions]);

  return {
    ...localStats,
    globalStats: state.stats,
    loadStats
  };
}

// Hook for resume search and filtering
export function useResumeSearch() {
  const { state, actions } = useResume();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const search = useCallback(async (query: string) => {
    if (query.trim()) {
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, 10);
        return newHistory;
      });
    }
    await actions.searchResumes(query);
  }, [actions]);

  const clearSearch = useCallback(() => {
    actions.clearSearch();
  }, [actions]);

  return {
    searchQuery: state.searchQuery,
    searchResults: state.filteredResumes,
    searchHistory,
    isSearching: state.isLoading,
    search,
    clearSearch
  };
}

// Hook for resume validation
export function useResumeValidation() {
  const { state, actions } = useResume();
  const [validationSummary, setValidationSummary] = useState<{
    message: string;
    color: string;
    suggestions: string[];
  } | null>(null);

  useEffect(() => {
    if (state.validation) {
      const summary = ResumeUtils.getValidationSummary ? 
        ResumeUtils.getValidationSummary(state.validation) :
        {
          message: state.validation.isValid ? 'Resume is valid' : 'Resume has errors',
          color: state.validation.isValid ? 'green' : 'red',
          suggestions: []
        };
      setValidationSummary(summary);
    }
  }, [state.validation]);

  const validate = useCallback(() => {
    actions.validateResume();
  }, [actions]);

  return {
    validation: state.validation,
    validationSummary,
    validate
  };
}

// Hook for resume auto-save
export function useResumeAutoSave() {
  const { state, actions } = useResume();
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<string | null>(null);

  useEffect(() => {
    if (autoSaveEnabled && state.isDirty && state.currentResumeId) {
      const timer = setTimeout(async () => {
        try {
          await actions.autoSave();
          setLastAutoSave(new Date().toISOString());
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 3000); // Auto-save after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [state.isDirty, state.currentResumeId, autoSaveEnabled, actions]);

  const toggleAutoSave = useCallback(() => {
    setAutoSaveEnabled(prev => !prev);
  }, []);

  return {
    autoSaveEnabled,
    lastAutoSave,
    isDirty: state.isDirty,
    lastSaved: state.lastSaved,
    toggleAutoSave
  };
}

// Hook for resume sections
export function useResumeSections() {
  const { state, actions } = useResume();
  const [sectionProgress, setSectionProgress] = useState<{ [key: string]: boolean }>({});

  const currentResume = useCurrentResume();

  useEffect(() => {
    if (currentResume) {
      const progress: { [key: string]: boolean } = {
        personal: !!(currentResume.personal?.firstName && currentResume.personal?.lastName),
        summary: !!currentResume.summary?.trim(),
        experience: !!(currentResume.experience && currentResume.experience.length > 0),
        education: !!(currentResume.education && currentResume.education.length > 0),
        skills: !!(currentResume.skills && currentResume.skills.length > 0),
        projects: !!(currentResume.projects && currentResume.projects.length > 0)
      };
      setSectionProgress(progress);
    }
  }, [currentResume]);

  const setActiveSection = useCallback((section: string | null) => {
    actions.setActiveSection(section);
  }, [actions]);

  const getSectionCompletion = useCallback((section: string) => {
    return sectionProgress[section] || false;
  }, [sectionProgress]);

  const getOverallProgress = useCallback(() => {
    const sections = Object.keys(sectionProgress);
    const completedSections = sections.filter(section => sectionProgress[section]).length;
    return Math.round((completedSections / sections.length) * 100);
  }, [sectionProgress]);

  return {
    activeSection: state.activeSection,
    sectionProgress,
    setActiveSection,
    getSectionCompletion,
    getOverallProgress
  };
}

// Hook for resume export/import
export function useResumeExport() {
  const { actions } = useResume();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const exportResume = useCallback(async (resumeId: string, format: 'json' | 'txt' | 'md' = 'json') => {
    try {
      setIsExporting(true);
      const resume = await actions.loadResume(resumeId);
      if (resume) {
        return ResumeUtils.exportResume(resume, format);
      }
      throw new Error('Resume not found');
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [actions]);

  const importResume = useCallback(async (jsonData: string, title?: string) => {
    try {
      setIsImporting(true);
      const resume = await ResumeAPI.importResume(jsonData, title);
      return resume;
    } catch (error) {
      console.error('Import failed:', error);
      throw error;
    } finally {
      setIsImporting(false);
    }
  }, []);

  return {
    isExporting,
    isImporting,
    exportResume,
    importResume
  };
}

// Hook for resume themes
export function useResumeThemes() {
  const { state, actions } = useResume();
  const [availableThemes] = useState([
    { name: 'Default', color: '#004D40' },
    { name: 'Blue', color: '#1976D2' },
    { name: 'Purple', color: '#7B1FA2' },
    { name: 'Green', color: '#388E3C' },
    { name: 'Orange', color: '#F57C00' },
    { name: 'Red', color: '#D32F2F' },
    { name: 'Teal', color: '#00796B' },
    { name: 'Indigo', color: '#303F9F' }
  ]);

  const currentTheme = state.currentResume?.themeColor || '#004D40';

  const setTheme = useCallback(async (color: string) => {
    if (state.currentResumeId) {
      await actions.updateResumeSection('themeColor', color);
    }
  }, [state.currentResumeId, actions]);

  return {
    availableThemes,
    currentTheme,
    setTheme
  };
}

// Hook for resume keywords and search optimization
export function useResumeKeywords() {
  const currentResume = useCurrentResume();
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    if (currentResume) {
      const extractedKeywords = ResumeUtils.generateKeywords(currentResume);
      setKeywords(extractedKeywords);
    }
  }, [currentResume]);

  const addKeyword = useCallback((keyword: string) => {
    if (!keywords.includes(keyword)) {
      setKeywords(prev => [...prev, keyword]);
    }
  }, [keywords]);

  const removeKeyword = useCallback((keyword: string) => {
    setKeywords(prev => prev.filter(k => k !== keyword));
  }, []);

  return {
    keywords,
    addKeyword,
    removeKeyword
  };
}

// Hook for resume sharing
export function useResumeSharing() {
  const { state, actions } = useResume();
  const [isSharing, setIsSharing] = useState(false);

  const shareResume = useCallback(async (resumeId: string) => {
    try {
      setIsSharing(true);
      const resume = await actions.loadResume(resumeId);
      if (resume) {
        // In a real app, this would integrate with native sharing
        const shareData = {
          title: resume.title,
          text: ResumeUtils.generatePreviewText(resume),
          url: `resume://view/${resumeId}` // Custom URL scheme
        };
        
        // For now, just return the data
        return shareData;
      }
      throw new Error('Resume not found');
    } catch (error) {
      console.error('Share failed:', error);
      throw error;
    } finally {
      setIsSharing(false);
    }
  }, [actions]);

  return {
    isSharing,
    shareResume
  };
}

// Hook for resume analytics
export function useResumeAnalytics() {
  const { state } = useResume();
  const [analytics, setAnalytics] = useState({
    totalEdits: 0,
    lastEditTime: null as string | null,
    mostEditedSection: null as string | null,
    averageEditTime: 0
  });

  // This would typically integrate with analytics services
  const trackEdit = useCallback((section: string) => {
    setAnalytics(prev => ({
      ...prev,
      totalEdits: prev.totalEdits + 1,
      lastEditTime: new Date().toISOString(),
      mostEditedSection: section
    }));
  }, []);

  return {
    analytics,
    trackEdit
  };
}

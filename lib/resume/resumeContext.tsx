import React, { createContext, useContext, useReducer, useEffect, useMemo, useRef, ReactNode } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ResumeAPI from './resumeAPI';
import { ResumeValidationService } from './resumeValidation';
import { ResumeUtils } from './resumeUtils';
import { ResumeData, ResumeListItem, ValidationResult } from './resumeAPI';

// Resume State Interface
export interface ResumeState {
  // Current resume being edited
  currentResume: ResumeData | null;
  currentResumeId: string | null;
  
  // Resume list for dashboard
  resumeList: ResumeListItem[];
  
  // UI state
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Form state
  activeSection: string | null;
  isDirty: boolean; // Has unsaved changes
  lastSaved: string | null;
  
  // Validation state
  validation: ValidationResult | null;
  
  // Search and filter state
  searchQuery: string;
  filteredResumes: ResumeListItem[];
  
  // Statistics
  stats: {
    totalResumes: number;
    lastUpdated: string | null;
    mostUsedTheme: string | null;
  } | null;
}

// Action Types
export type ResumeAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CURRENT_RESUME'; payload: ResumeData | null }
  | { type: 'SET_CURRENT_RESUME_ID'; payload: string | null }
  | { type: 'SET_RESUME_LIST'; payload: ResumeListItem[] }
  | { type: 'ADD_RESUME_TO_LIST'; payload: ResumeListItem }
  | { type: 'UPDATE_RESUME_IN_LIST'; payload: ResumeListItem }
  | { type: 'REMOVE_RESUME_FROM_LIST'; payload: string }
  | { type: 'SET_ACTIVE_SECTION'; payload: string | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_LAST_SAVED'; payload: string | null }
  | { type: 'SET_VALIDATION'; payload: ValidationResult | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERED_RESUMES'; payload: ResumeListItem[] }
  | { type: 'SET_STATS'; payload: ResumeState['stats'] }
  | { type: 'UPDATE_RESUME_SECTION'; payload: { section: keyof ResumeData; data: any } }
  | { type: 'RESET_STATE' };

// Initial State
const initialState: ResumeState = {
  currentResume: null,
  currentResumeId: null,
  resumeList: [],
  isLoading: false,
  isSaving: false,
  error: null,
  activeSection: null,
  isDirty: false,
  lastSaved: null,
  validation: null,
  searchQuery: '',
  filteredResumes: [],
  stats: null,
};

// Reducer
function resumeReducer(state: ResumeState, action: ResumeAction): ResumeState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_CURRENT_RESUME':
      return { 
        ...state, 
        currentResume: action.payload,
        isDirty: false,
        validation: action.payload ? ResumeValidationService.validateResume(action.payload) : null
      };
    
    case 'SET_CURRENT_RESUME_ID':
      return { ...state, currentResumeId: action.payload };
    
    case 'SET_RESUME_LIST':
      return { 
        ...state, 
        resumeList: action.payload,
        filteredResumes: action.payload
      };
    
    case 'ADD_RESUME_TO_LIST':
      return {
        ...state,
        resumeList: [action.payload, ...state.resumeList],
        filteredResumes: [action.payload, ...state.filteredResumes]
      };
    
    case 'UPDATE_RESUME_IN_LIST':
      return {
        ...state,
        resumeList: state.resumeList.map(resume => 
          resume.id === action.payload.id ? action.payload : resume
        ),
        filteredResumes: state.filteredResumes.map(resume => 
          resume.id === action.payload.id ? action.payload : resume
        )
      };
    
    case 'REMOVE_RESUME_FROM_LIST':
      return {
        ...state,
        resumeList: state.resumeList.filter(resume => resume.id !== action.payload),
        filteredResumes: state.filteredResumes.filter(resume => resume.id !== action.payload)
      };
    
    case 'SET_ACTIVE_SECTION':
      return { ...state, activeSection: action.payload };
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    
    case 'SET_LAST_SAVED':
      return { ...state, lastSaved: action.payload };
    
    case 'SET_VALIDATION':
      return { ...state, validation: action.payload };
    
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    
    case 'SET_FILTERED_RESUMES':
      return { ...state, filteredResumes: action.payload };
    
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    
    case 'UPDATE_RESUME_SECTION':
      if (!state.currentResume) return state;
      
      const updatedResume = {
        ...state.currentResume,
        [action.payload.section]: action.payload.data
      };
      
      return {
        ...state,
        currentResume: updatedResume,
        isDirty: true,
        validation: ResumeValidationService.validateResume(updatedResume)
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
const ResumeContext = createContext<{
  state: ResumeState;
  dispatch: React.Dispatch<ResumeAction>;
  actions: ResumeActions;
} | null>(null);

// Actions Interface
export interface ResumeActions {
  // Resume CRUD operations
  createResume: (resumeData: Partial<ResumeData>) => Promise<ResumeData>;
  loadResume: (resumeId: string) => Promise<void>;
  updateResume: (resumeData: Partial<ResumeData>) => Promise<void>;
  updateResumeLocal: (resumeData: Partial<ResumeData>) => void;
  updateResumeSection: (section: keyof ResumeData, data: any) => Promise<void>;
  deleteResume: (resumeId: string) => Promise<void>;
  duplicateResume: (resumeId: string, newTitle?: string) => Promise<ResumeData>;
  
  // Resume list operations
  loadResumeList: () => Promise<void>;
  searchResumes: (query: string) => Promise<void>;
  clearSearch: () => void;
  
  // UI operations
  setActiveSection: (section: string | null) => void;
  setDirty: (isDirty: boolean) => void;
  clearError: () => void;
  resetState: () => void;
  
  // Validation
  validateResume: () => void;
  
  // Statistics
  loadStats: () => Promise<void>;
  
  // Auto-save
  autoSave: () => Promise<void>;
}

// Provider Component
export function ResumeProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(resumeReducer, initialState);
  const stateRef = useRef(state);
  
  // Keep stateRef up to date
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Helper function to get current state
  const getCurrentState = () => stateRef.current;

  // Actions implementation
  const actions: ResumeActions = {
    // Create a new resume
    createResume: async (resumeData: Partial<ResumeData>) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const cleanedData = ResumeUtils.cleanResumeData(resumeData);
        const newResume = await ResumeAPI.createResume(cleanedData);
        
        dispatch({ type: 'SET_CURRENT_RESUME', payload: newResume });
        dispatch({ type: 'SET_CURRENT_RESUME_ID', payload: newResume.id! });
        dispatch({ type: 'ADD_RESUME_TO_LIST', payload: {
          id: newResume.id!,
          title: newResume.title,
          personal: newResume.personal,
          createdAt: newResume.createdAt!,
          lastUpdated: newResume.lastUpdated!,
          themeColor: newResume.themeColor
        }});
        
        return newResume;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create resume';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Load a specific resume
    loadResume: async (resumeId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const resume = await ResumeAPI.getResume(resumeId);
        
        dispatch({ type: 'SET_CURRENT_RESUME', payload: resume });
        dispatch({ type: 'SET_CURRENT_RESUME_ID', payload: resumeId });
        dispatch({ type: 'SET_DIRTY', payload: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load resume';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Update entire resume
    updateResume: async (resumeData: Partial<ResumeData>) => {
      // Get the current state at the time of execution using helper function
      const currentState = getCurrentState();
      const currentResumeId = currentState.currentResumeId;
      
      if (!currentResumeId) {
        console.error('No resume selected for update:', { 
          currentResumeId, 
          currentResume: !!currentState.currentResume,
          resumeId: resumeData.id 
        });
        throw new Error('No resume selected');
      }

      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        console.log('Updating resume with ID:', currentResumeId);
        const cleanedData = ResumeUtils.cleanResumeData(resumeData);
        await ResumeAPI.updateResume(currentResumeId, cleanedData);
        
        const updatedResume = { ...currentState.currentResume!, ...cleanedData };
        dispatch({ type: 'SET_CURRENT_RESUME', payload: updatedResume });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
        dispatch({ type: 'SET_DIRTY', payload: false });
        console.log('Resume updated successfully');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update resume';
        console.error('Update resume error:', error);
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },

    // Update resume locally (for real-time UI updates)
    updateResumeLocal: (resumeData: Partial<ResumeData>) => {
      const currentState = getCurrentState();
      if (!currentState.currentResume) return;
      
      const updatedResume = { ...currentState.currentResume, ...resumeData };
      dispatch({ type: 'SET_CURRENT_RESUME', payload: updatedResume });
      dispatch({ type: 'SET_DIRTY', payload: true });
    },

    // Update specific section
    updateResumeSection: async (section: keyof ResumeData, data: any) => {
      const currentState = getCurrentState();
      if (!currentState.currentResumeId) {
        throw new Error('No resume selected');
      }

      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        await ResumeAPI.updateResumeSection(currentState.currentResumeId, section, data);
        
        dispatch({ type: 'UPDATE_RESUME_SECTION', payload: { section, data } });
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
        dispatch({ type: 'SET_DIRTY', payload: false });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update resume section';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },

    // Delete resume
    deleteResume: async (resumeId: string) => {
      try {
        console.log('Context: Deleting resume:', resumeId);
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        await ResumeAPI.deleteResume(resumeId);
        console.log('Context: Resume deleted from API');
        
        // Get current state to check if we're deleting the current resume
        const currentState = getCurrentState();
        
        dispatch({ type: 'REMOVE_RESUME_FROM_LIST', payload: resumeId });
        console.log('Context: Resume removed from list');
        
        // If deleting current resume, clear it
        if (currentState.currentResumeId === resumeId) {
          dispatch({ type: 'SET_CURRENT_RESUME', payload: null });
          dispatch({ type: 'SET_CURRENT_RESUME_ID', payload: null });
          console.log('Context: Current resume cleared');
        }
      } catch (error) {
        console.error('Context: Delete error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete resume';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Duplicate resume
    duplicateResume: async (resumeId: string, newTitle?: string) => {
      try {
        console.log('Context: Duplicating resume:', resumeId, 'with title:', newTitle);
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const duplicatedResume = await ResumeAPI.duplicateResume(resumeId, newTitle);
        console.log('Context: Resume duplicated from API:', duplicatedResume.id);
        
        dispatch({ type: 'ADD_RESUME_TO_LIST', payload: {
          id: duplicatedResume.id!,
          title: duplicatedResume.title,
          personal: duplicatedResume.personal,
          createdAt: duplicatedResume.createdAt!,
          lastUpdated: duplicatedResume.lastUpdated!,
          themeColor: duplicatedResume.themeColor
        }});
        console.log('Context: Resume added to list');
        
        return duplicatedResume;
      } catch (error) {
        console.error('Context: Duplicate error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to duplicate resume';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Load resume list
    loadResumeList: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const resumes = await ResumeAPI.getAllResumes();
        dispatch({ type: 'SET_RESUME_LIST', payload: resumes });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load resumes';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Search resumes
    searchResumes: async (query: string) => {
      try {
        dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        if (query.trim() === '') {
          dispatch({ type: 'SET_FILTERED_RESUMES', payload: state.resumeList });
        } else {
          const searchResults = await ResumeAPI.searchResumes(query);
          dispatch({ type: 'SET_FILTERED_RESUMES', payload: searchResults });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search resumes';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Clear search
    clearSearch: () => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
      dispatch({ type: 'SET_FILTERED_RESUMES', payload: state.resumeList });
    },

    // Set active section
    setActiveSection: (section: string | null) => {
      dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
    },

    // Set dirty state
    setDirty: (isDirty: boolean) => {
      dispatch({ type: 'SET_DIRTY', payload: isDirty });
    },

    // Clear error
    clearError: () => {
      dispatch({ type: 'SET_ERROR', payload: null });
    },

    // Reset state
    resetState: () => {
      dispatch({ type: 'RESET_STATE' });
    },

    // Validate resume
    validateResume: () => {
      if (state.currentResume) {
        const validation = ResumeValidationService.validateResume(state.currentResume);
        dispatch({ type: 'SET_VALIDATION', payload: validation });
      }
    },

    // Load statistics
    loadStats: async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
        
        const stats = await ResumeAPI.getResumeStats();
        dispatch({ type: 'SET_STATS', payload: stats });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load statistics';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },

    // Auto-save functionality
    autoSave: async () => {
      if (!state.currentResume || !state.currentResumeId || !state.isDirty) {
        return;
      }

      try {
        await ResumeAPI.updateResume(state.currentResumeId, state.currentResume);
        dispatch({ type: 'SET_LAST_SAVED', payload: new Date().toISOString() });
        dispatch({ type: 'SET_DIRTY', payload: false });
      } catch (error) {
        console.error('Auto-save failed:', error);
        // Don't show error to user for auto-save failures
      }
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (state.isDirty && state.currentResumeId) {
      const autoSaveTimer = setTimeout(() => {
        actions.autoSave();
      }, 5000); // Auto-save after 5 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [state.isDirty, state.currentResumeId]);

  // Load resume list on mount and when authentication state changes
  useEffect(() => {
    const auth = getAuth();
    
    // Listen to authentication state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('User authenticated, loading resume list...');
        try {
          await actions.loadResumeList();
        } catch (error) {
          console.error('Failed to load resume list:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load resumes. Please try again.' });
        }
      } else {
        console.log('User not authenticated, clearing resume list');
        dispatch({ type: 'SET_RESUME_LIST', payload: [] });
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_ERROR', payload: null });
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <ResumeContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </ResumeContext.Provider>
  );
}

// Custom hook to use resume context
export function useResume() {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}

// Custom hooks for specific state slices
export function useResumeState() {
  const { state } = useResume();
  return state;
}

export function useResumeActions() {
  const { actions } = useResume();
  return actions;
}

export function useCurrentResume() {
  const { state } = useResume();
  return state.currentResume;
}

export function useResumeList() {
  const { state } = useResume();
  return state.resumeList;
}

export function useResumeValidation() {
  const { state } = useResume();
  return state.validation;
}

export function useResumeLoading() {
  const { state } = useResume();
  return {
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error
  };
}

export default ResumeProvider;

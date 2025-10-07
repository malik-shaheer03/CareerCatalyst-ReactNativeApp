// Resume Services Export
export { 
  createNewResume,
  saveResumeToDocument,
  getAllResumeData,
  getResumeData,
  updateThisResume,
  deleteThisResume,
  duplicateResume,
  searchResumesByTitle,
  getRecentResumes,
  listenToResume,
  listenToAllResumes,
  updateResumeTitle
} from './resumeAPI';

// Export ResumeAPI as default
export { default as ResumeAPI } from './resumeAPI';

export { ResumeValidationService } from './resumeValidation';
export { ResumeUtils } from './resumeUtils';

// State Management Export
export { ResumeProvider, useResume, useResumeState, useResumeActions, useCurrentResume, useResumeList, useResumeValidation, useResumeLoading } from './resumeContext';
export { 
  useResumeStats, 
  useResumeSearch, 
  useResumeValidation as useResumeValidationHook, 
  useResumeAutoSave, 
  useResumeSections, 
  useResumeExport, 
  useResumeThemes, 
  useResumeKeywords, 
  useResumeSharing, 
  useResumeAnalytics 
} from './resumeHooks';
export { ResumePersistenceService } from './resumePersistence';
export { ResumeStateManager, resumeStateManager } from './resumeStateManager';

// Type exports
export type {
  ResumeData,
  ResumeListItem,
  PersonalDetails,
  Experience,
  Education,
  Skill,
  Project
} from './resumeAPI';

export type {
  ValidationError,
  ValidationResult
} from './resumeValidation';

export type {
  ResumeState,
  ResumeAction,
  ResumeActions
} from './resumeContext';

export type {
  ResumeUserPreferences
} from './resumePersistence';

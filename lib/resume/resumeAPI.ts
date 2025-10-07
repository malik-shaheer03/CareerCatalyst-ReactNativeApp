import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  Timestamp, 
  query, 
  where, 
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth } from 'firebase/auth';

// Types for resume data
export interface PersonalDetails {
  firstName: string;
  lastName: string;
  jobTitle: string;
  address: string;
  phone: string;
  email: string;
  avatar?: string;
}

export interface Experience {
  title: string;
  companyName: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  workSummary: string;
}

export interface Education {
  universityName: string;
  degree: string;
  major: string;
  grade: string;
  gradeType: 'CGPA' | 'GPA' | 'Percentage';
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Skill {
  name: string;
  category?: string;
  rating?: number;
  yearsOfExperience?: number;
}

export interface Project {
  projectName: string;
  techStack: string;
  projectSummary: string;
  projectUrl?: string;
  githubUrl?: string;
}

export interface ResumeData {
  id?: string;
  title: string;
  personal: PersonalDetails;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  themeColor?: string;
  createdAt?: string;
  lastUpdated?: string;
  userId?: string;
}

export interface ResumeListItem {
  id: string;
  title: string;
  personal: {
    firstName: string;
    lastName: string;
    jobTitle: string;
  };
  createdAt: string;
  lastUpdated: string;
  themeColor?: string;
}

// Helper function to convert Firestore Timestamps to ISO strings
function convertTimestamps(obj: any): any {
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      result[key] = convertTimestamps(obj[key]);
    }
    return result;
  }
  return obj;
}

// Helper function to get current user ID
function getCurrentUserId(): string {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated. Please log in to continue.');
  }
  return user.uid;
}

// Helper function to get resumes collection reference
function getResumesCollectionRef() {
  const userId = getCurrentUserId();
  return collection(db, 'employees', userId, 'resumes');
}

// Helper function to get specific resume document reference
function getResumeDocRef(resumeId: string) {
  const userId = getCurrentUserId();
  return doc(db, 'employees', userId, 'resumes', resumeId);
}

export class ResumeAPI {
  /**
   * Create a new resume
   */
  static async createResume(resumeData: Partial<ResumeData>): Promise<ResumeData> {
    try {
      const colRef = getResumesCollectionRef();
      const now = new Date().toISOString();
      
      const newResumeData = {
        ...resumeData,
        title: resumeData.title || 'Untitled Resume',
        createdAt: now,
        lastUpdated: now,
        userId: getCurrentUserId(),
      };

      const docRef = await addDoc(colRef, {
        ...newResumeData,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
      });

      return {
        ...newResumeData,
        id: docRef.id,
        createdAt: now,
        lastUpdated: now,
      };
    } catch (error) {
      console.error('Error creating resume:', error);
      throw new Error('Failed to create resume. Please try again.');
    }
  }

  /**
   * Get all resumes for the current user
   */
  static async getAllResumes(): Promise<ResumeListItem[]> {
    try {
      // Check authentication first
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated. Please log in to continue.');
      }

      const colRef = getResumesCollectionRef();
      const q = query(colRef, orderBy('lastUpdated', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...convertTimestamps(data),
        } as ResumeListItem;
      });
    } catch (error) {
      console.error('Error fetching resumes:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not authenticated')) {
          throw new Error('Please log in to view your resumes.');
        } else if (error.message.includes('permission')) {
          throw new Error('You do not have permission to access resumes.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your connection.');
        }
      }
      
      throw new Error('Failed to fetch resumes. Please try again.');
    }
  }

  /**
   * Get a specific resume by ID
   */
  static async getResume(resumeId: string): Promise<ResumeData> {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required.');
      }

      const docRef = getResumeDocRef(resumeId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Resume not found.');
      }

      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...convertTimestamps(data),
      } as ResumeData;
    } catch (error) {
      console.error('Error fetching resume:', error);
      if (error instanceof Error && error.message === 'Resume not found.') {
        throw error;
      }
      throw new Error('Failed to fetch resume. Please try again.');
    }
  }

  /**
   * Update a specific resume
   */
  static async updateResume(resumeId: string, updateData: Partial<ResumeData>): Promise<void> {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required.');
      }

      const docRef = getResumeDocRef(resumeId);
      await updateDoc(docRef, {
        ...updateData,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating resume:', error);
      throw new Error('Failed to update resume. Please try again.');
    }
  }

  /**
   * Update specific section of a resume
   */
  static async updateResumeSection(
    resumeId: string, 
    section: keyof ResumeData, 
    sectionData: any
  ): Promise<void> {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required.');
      }

      const docRef = getResumeDocRef(resumeId);
      await updateDoc(docRef, {
        [section]: sectionData,
        lastUpdated: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating resume ${section}:`, error);
      throw new Error(`Failed to update ${section}. Please try again.`);
    }
  }

  /**
   * Delete a resume
   */
  static async deleteResume(resumeId: string): Promise<void> {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required.');
      }

      const docRef = getResumeDocRef(resumeId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error('Failed to delete resume. Please try again.');
    }
  }

  /**
   * Duplicate a resume
   */
  static async duplicateResume(resumeId: string, newTitle?: string): Promise<ResumeData> {
    try {
      const originalResume = await this.getResume(resumeId);
      
      // Create a clean copy without id, createdAt, and lastUpdated
      const { id, createdAt, lastUpdated, ...resumeData } = originalResume;
      
      const duplicatedResume = {
        ...resumeData,
        title: newTitle || `${originalResume.title} (Copy)`,
      };

      return await this.createResume(duplicatedResume);
    } catch (error) {
      console.error('Error duplicating resume:', error);
      throw new Error('Failed to duplicate resume. Please try again.');
    }
  }

  /**
   * Search resumes by title
   */
  static async searchResumes(searchTerm: string): Promise<ResumeListItem[]> {
    try {
      const colRef = getResumesCollectionRef();
      const q = query(
        colRef,
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        orderBy('title'),
        orderBy('lastUpdated', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...convertTimestamps(data),
        } as ResumeListItem;
      });
    } catch (error) {
      console.error('Error searching resumes:', error);
      throw new Error('Failed to search resumes. Please try again.');
    }
  }

  /**
   * Get recent resumes (last 5)
   */
  static async getRecentResumes(): Promise<ResumeListItem[]> {
    try {
      const colRef = getResumesCollectionRef();
      const q = query(
        colRef,
        orderBy('lastUpdated', 'desc'),
        limit(5)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...convertTimestamps(data),
        } as ResumeListItem;
      });
    } catch (error) {
      console.error('Error fetching recent resumes:', error);
      throw new Error('Failed to fetch recent resumes. Please try again.');
    }
  }

  /**
   * Listen to resume changes in real-time
   */
  static listenToResumes(
    callback: (resumes: ResumeListItem[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      const colRef = getResumesCollectionRef();
      const q = query(colRef, orderBy('lastUpdated', 'desc'));
      
      return onSnapshot(
        q,
        (querySnapshot) => {
          const resumes = querySnapshot.docs.map((docSnap) => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              ...convertTimestamps(data),
            } as ResumeListItem;
          });
          callback(resumes);
        },
        (error) => {
          console.error('Error listening to resumes:', error);
          if (onError) {
            onError(new Error('Failed to listen to resume changes.'));
          }
        }
      );
    } catch (error) {
      console.error('Error setting up resume listener:', error);
      if (onError) {
        onError(new Error('Failed to set up resume listener.'));
      }
      // Return a dummy unsubscribe function
      return () => {};
    }
  }

  /**
   * Listen to specific resume changes in real-time
   */
  static listenToResume(
    resumeId: string,
    callback: (resume: ResumeData | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe {
    try {
      if (!resumeId) {
        throw new Error('Resume ID is required.');
      }

      const docRef = getResumeDocRef(resumeId);
      
      return onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const resume = {
              id: docSnap.id,
              ...convertTimestamps(data),
            } as ResumeData;
            callback(resume);
          } else {
            callback(null);
          }
        },
        (error) => {
          console.error('Error listening to resume:', error);
          if (onError) {
            onError(new Error('Failed to listen to resume changes.'));
          }
        }
      );
    } catch (error) {
      console.error('Error setting up resume listener:', error);
      if (onError) {
        onError(new Error('Failed to set up resume listener.'));
      }
      // Return a dummy unsubscribe function
      return () => {};
    }
  }

  /**
   * Export resume data as JSON
   */
  static async exportResume(resumeId: string): Promise<string> {
    try {
      const resume = await this.getResume(resumeId);
      return JSON.stringify(resume, null, 2);
    } catch (error) {
      console.error('Error exporting resume:', error);
      throw new Error('Failed to export resume. Please try again.');
    }
  }

  /**
   * Import resume data from JSON
   */
  static async importResume(jsonData: string, title?: string): Promise<ResumeData> {
    try {
      const resumeData = JSON.parse(jsonData);
      
      // Remove ID and timestamps to create new resume
      const { id, createdAt, lastUpdated, ...cleanData } = resumeData;
      
      return await this.createResume({
        ...cleanData,
        title: title || resumeData.title || 'Imported Resume',
      });
    } catch (error) {
      console.error('Error importing resume:', error);
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please check your file.');
      }
      throw new Error('Failed to import resume. Please try again.');
    }
  }

  /**
   * Get resume statistics
   */
  static async getResumeStats(): Promise<{
    totalResumes: number;
    lastUpdated: string | null;
    mostUsedTheme: string | null;
  }> {
    try {
      const resumes = await this.getAllResumes();
      
      const totalResumes = resumes.length;
      const lastUpdated = resumes.length > 0 ? resumes[0].lastUpdated : null;
      
      // Count theme usage
      const themeCount: { [key: string]: number } = {};
      resumes.forEach(resume => {
        if (resume.themeColor) {
          themeCount[resume.themeColor] = (themeCount[resume.themeColor] || 0) + 1;
        }
      });
      
      const mostUsedTheme = Object.keys(themeCount).reduce((a, b) => 
        themeCount[a] > themeCount[b] ? a : b, null
      );

      return {
        totalResumes,
        lastUpdated,
        mostUsedTheme,
      };
    } catch (error) {
      console.error('Error getting resume stats:', error);
      throw new Error('Failed to get resume statistics. Please try again.');
    }
  }
}

export default ResumeAPI;

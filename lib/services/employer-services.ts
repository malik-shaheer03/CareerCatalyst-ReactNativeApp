import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  limit,
} from 'firebase/firestore';

// Types
export interface JobData {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
  skills?: string[];
  status?: 'active' | 'paused' | 'closed';
  employerId?: string;
  postedAt?: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter: string;
  email: string;
  phone: string;
  resumeId?: string;
  appliedAt: any;
  status?: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
}

export interface EmployerProfile {
  companyInfo: {
    companyName: string;
    companyWebsite: string;
    companyLocation: string;
    companyDescription: string;
  };
  metadata: {
    createdAt: any;
    updatedAt: any;
    profileComplete: boolean;
  };
}

// ============= JOB MANAGEMENT =============

// Post a new job
export async function postJob(jobData: Omit<JobData, 'id' | 'employerId' | 'postedAt'>): Promise<string> {
  try {
    console.log('🔍 postJob() called with:', jobData);
    
    const user = auth.currentUser;
    console.log('📱 Current user:', user ? { uid: user.uid, email: user.email } : 'None');
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('User not logged in');
    }

    // Verify user is an employer
    console.log('🔍 Checking employer document for UID:', user.uid);
    const employerDoc = await getDoc(doc(db, 'employers', user.uid));
    console.log('📄 Employer document exists:', employerDoc.exists());
    
    if (!employerDoc.exists()) {
      console.error('❌ No employer document found for user:', user.uid);
      throw new Error('User is not registered as an employer');
    }
    
    console.log('✅ Employer verified, posting job...');

    const jobsCollection = collection(db, 'jobs');
    const jobToPost: Omit<JobData, 'id'> = {
      ...jobData,
      employerId: user.uid,
      status: 'active',
      postedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    console.log('📝 Job data to post:', jobToPost);
    console.log('🔥 Attempting to write to Firestore...');

    const jobRef = await addDoc(jobsCollection, jobToPost);
    console.log('🎉 Job posted successfully with ID:', jobRef.id);
    return jobRef.id;
  } catch (error) {
    console.error('💥 Error in postJob():', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error instanceof Error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// Get all jobs for current employer
export async function getEmployerJobs(): Promise<JobData[]> {
  try {
    console.log('🔍 Fetching employer jobs...');
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    // Remove orderBy to avoid index requirements
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('employerId', '==', user.uid)
    );

    const snapshot = await getDocs(jobsQuery);
    console.log(`📋 Found ${snapshot.size} jobs for employer`);
    
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as JobData[];

    // Sort by postedAt client-side
    jobs.sort((a, b) => {
      const dateA = new Date(a.postedAt || 0);
      const dateB = new Date(b.postedAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    throw error;
  }
}

// Change job status (activate, pause, close)
export async function changeJobStatus(jobId: string, newStatus: 'active' | 'paused' | 'closed'): Promise<void> {
  try {
    console.log(`🔄 Changing job ${jobId} status to ${newStatus}`);
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const jobRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('Job not found');
    }

    const jobData = jobDoc.data();
    if (jobData.employerId !== user.uid) {
      throw new Error('Unauthorized: You can only modify your own jobs');
    }

    await updateDoc(jobRef, {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    console.log(`✅ Job status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating job status:', error);
    throw error;
  }
}

// Update job
export async function updateJob(jobId: string, updates: Partial<JobData>): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const jobRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      throw new Error('Job not found');
    }

    const jobData = jobDoc.data();
    if (jobData.employerId !== user.uid) {
      throw new Error('Unauthorized: You can only update your own jobs');
    }

    await updateDoc(jobRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    console.log('Job updated successfully');
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
}

// Delete job
export async function deleteJob(jobId: string): Promise<void> {
  try {
    console.log('🗑️ deleteJob() called with jobId:', jobId);
    
    const user = auth.currentUser;
    console.log('📱 Current user:', user ? { uid: user.uid, email: user.email } : 'None');
    
    if (!user) {
      console.error('❌ No authenticated user found');
      throw new Error('User not logged in');
    }

    console.log('🔍 Getting job document for jobId:', jobId);
    const jobRef = doc(db, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (!jobDoc.exists()) {
      console.error('❌ Job document not found for jobId:', jobId);
      throw new Error('Job not found');
    }

    const jobData = jobDoc.data();
    console.log('📄 Job data:', { employerId: jobData.employerId, currentUserId: user.uid });
    
    if (jobData.employerId !== user.uid) {
      console.error('❌ Unauthorized access attempt:', {
        jobEmployerId: jobData.employerId,
        currentUserId: user.uid
      });
      throw new Error('Unauthorized: You can only delete your own jobs');
    }

    console.log('🔥 Attempting to delete job from Firestore...');
    await deleteDoc(jobRef);
    console.log('✅ Job deleted successfully from Firestore');
  } catch (error) {
    console.error('💥 Error in deleteJob():', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error instanceof Error);
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    throw error;
  }
}

// ============= APPLICATION MANAGEMENT =============

// Get all applications for employer's jobs
export async function getEmployerApplications(): Promise<Application[]> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    // First, get all jobs for this employer
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('employerId', '==', user.uid)
    );
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobIds = jobsSnapshot.docs.map(doc => doc.id);

    if (jobIds.length === 0) return [];

    // Get all applications for these jobs (handle Firestore 'in' query limit of 10)
    const applications: Application[] = [];
    for (let i = 0; i < jobIds.length; i += 10) {
      const batchJobIds = jobIds.slice(i, i + 10);
      const appsQuery = query(
        collection(db, 'applications'),
        where('jobId', 'in', batchJobIds)
        // Removed orderBy to avoid composite index requirement
      );
      const appsSnapshot = await getDocs(appsQuery);
      
      const batchApplications = appsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Application[];
      
      applications.push(...batchApplications);
    }

    // Sort applications in memory by appliedAt date (most recent first)
    applications.sort((a, b) => {
      const dateA = a.appliedAt?.toMillis ? a.appliedAt.toMillis() : 0;
      const dateB = b.appliedAt?.toMillis ? b.appliedAt.toMillis() : 0;
      return dateB - dateA;
    });

    return applications;
  } catch (error) {
    console.error('Error fetching employer applications:', error);
    throw error;
  }
}

// Get applications for a specific job
export async function getJobApplications(jobId: string): Promise<Application[]> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    // Verify the job belongs to this employer
    const jobDoc = await getDoc(doc(db, 'jobs', jobId));
    if (!jobDoc.exists()) {
      throw new Error('Job not found');
    }

    const jobData = jobDoc.data();
    if (jobData.employerId !== user.uid) {
      throw new Error('Unauthorized: You can only view applications for your own jobs');
    }

    const appsQuery = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      orderBy('appliedAt', 'desc')
    );

    const snapshot = await getDocs(appsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Application[];
  } catch (error) {
    console.error('Error fetching job applications:', error);
    throw error;
  }
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string, 
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    // Verify the application is for employer's job
    const appDoc = await getDoc(doc(db, 'applications', applicationId));
    if (!appDoc.exists()) {
      throw new Error('Application not found');
    }

    const appData = appDoc.data();
    const jobDoc = await getDoc(doc(db, 'jobs', appData.jobId));
    
    if (!jobDoc.exists()) {
      throw new Error('Associated job not found');
    }

    const jobData = jobDoc.data();
    if (jobData.employerId !== user.uid) {
      throw new Error('Unauthorized: You can only update applications for your own jobs');
    }

    const appRef = doc(db, 'applications', applicationId);
    await updateDoc(appRef, { status });

    console.log('Application status updated successfully');
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

// Delete an application
export async function deleteApplication(applicationId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    // Verify the application is for employer's job
    const appDoc = await getDoc(doc(db, 'applications', applicationId));
    if (!appDoc.exists()) {
      throw new Error('Application not found');
    }

    const appData = appDoc.data();
    const jobDoc = await getDoc(doc(db, 'jobs', appData.jobId));
    
    if (!jobDoc.exists()) {
      throw new Error('Associated job not found');
    }

    const jobData = jobDoc.data();
    if (jobData.employerId !== user.uid) {
      throw new Error('Unauthorized: You can only delete applications for your own jobs');
    }

    const appRef = doc(db, 'applications', applicationId);
    await deleteDoc(appRef);

    console.log('Application deleted successfully');
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
}

// ============= EMPLOYER PROFILE MANAGEMENT =============

// Get employer profile
export async function getEmployerProfile(): Promise<EmployerProfile | null> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const employerDataRef = doc(
      collection(db, 'employers', user.uid, 'employer data'),
      'profile'
    );
    const docSnap = await getDoc(employerDataRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as EmployerProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching employer profile:', error);
    throw error;
  }
}

// Update employer profile
export async function updateEmployerProfile(profileData: EmployerProfile): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const companyProfile: EmployerProfile = {
      ...profileData,
      metadata: {
        ...profileData.metadata,
        updatedAt: serverTimestamp(),
      }
    };

    // Update employer basic info
    const basicCompanyInfo = {
      companyName: profileData.companyInfo.companyName,
      companyWebsite: profileData.companyInfo.companyWebsite,
      companyLocation: profileData.companyInfo.companyLocation,
      profileComplete: true,
      lastUpdated: serverTimestamp(),
    };

    const companyDocRef = doc(db, 'employers', user.uid);
    await updateDoc(companyDocRef, basicCompanyInfo);

    // Update detailed profile
    const employerDataRef = doc(
      collection(db, 'employers', user.uid, 'employer data'),
      'profile'
    );
    await updateDoc(employerDataRef, companyProfile);

    console.log('Employer profile updated successfully');
  } catch (error) {
    console.error('Error updating employer profile:', error);
    throw error;
  }
}

// ============= ANALYTICS =============

// Get employer analytics data
export async function getEmployerAnalytics(period: string = '30d') {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    // Get jobs
    const jobs = await getEmployerJobs();
    
    // Get applications
    const applications = await getEmployerApplications();

    // Calculate basic metrics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const totalApplications = applications.length;

    // Calculate applications by status
    const applicationsByStatus = applications.reduce((acc, app) => {
      const status = app.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate job performance
    const jobPerformance = jobs.map(job => {
      const jobApplications = applications.filter(app => app.jobId === job.id);
      // Calculate conversion rate based on actual applications
      // For now, we'll use applications count as a baseline metric
      const conversionRate = jobApplications.length > 0 ? 
        Math.min((jobApplications.length / Math.max(totalApplications, 1)) * 100, 100) : 0;
      
      return {
        jobId: job.id || '',
        title: job.title,
        views: 0, // Views tracking not implemented yet
        applications: jobApplications.length,
        conversionRate
      };
    }).filter(job => job.applications > 0); // Only show jobs with applications

    // Calculate date-based trends (simplified for demo)
    const now = new Date();
    const applicationsTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      const dayApplications = applications.filter(app => {
        const appDate = app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
        return appDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toISOString().split('T')[0],
        count: dayApplications.length
      };
    });

    // Calculate new applications this week
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newApplicationsThisWeek = applications.filter(app => {
      const appDate = app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
      return appDate >= oneWeekAgo;
    }).length;

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      newApplicationsThisWeek,
      applicationsByStatus: {
        pending: applicationsByStatus.pending || 0,
        shortlisted: applicationsByStatus.shortlisted || 0,
        rejected: applicationsByStatus.rejected || 0,
        hired: applicationsByStatus.hired || 0,
      },
      jobPerformance,
      applicationsTrend,
    };
  } catch (error) {
    console.error('Error fetching employer analytics:', error);
    throw error;
  }
}

// ============= UTILITY FUNCTIONS =============

// Check if current user is an employer
export async function isCurrentUserEmployer(): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    const employerDoc = await getDoc(doc(db, 'employers', user.uid));
    return employerDoc.exists();
  } catch (error) {
    console.error('Error checking employer status:', error);
    return false;
  }
}

// Get employer company name
export async function getEmployerCompanyName(): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('User not logged in');

    const employerDoc = await getDoc(doc(db, 'employers', user.uid));
    if (!employerDoc.exists()) {
      throw new Error('Employer profile not found');
    }

    const data = employerDoc.data();
    return data.companyName || 'Your Company';
  } catch (error) {
    console.error('Error fetching company name:', error);
    return 'Your Company';
  }
}
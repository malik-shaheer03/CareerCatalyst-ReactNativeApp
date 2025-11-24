import { collection, query, where, orderBy, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

export interface JobSeeker {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: string;
  level: string;
  salary: string;
  applicants: string;
  capacity: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: Date;
  companyIcon: string;
  companyColor: string;
  employerId: string;
}

/**
 * Fetch all active jobs posted by employers for job seekers
 */
export async function getAllJobsForJobSeekers(): Promise<JobSeeker[]> {
  try {
    console.log('🔍 Fetching all active jobs for job seekers...');
    
    // Query for all active jobs (remove orderBy to avoid index requirements for now)
    const jobsQuery = query(
      collection(db, 'jobs'),
      where('status', '==', 'active')
    );

    console.log('📡 Executing Firestore query...');
    const querySnapshot = await getDocs(jobsQuery);
    console.log(`📋 Found ${querySnapshot.size} active jobs`);

    const jobs: JobSeeker[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Processing job document:', doc.id, data);
      
      // Transform Firebase job data to JobSeeker interface format
      const job: JobSeeker = {
        id: doc.id,
        title: data.title || 'Untitled Position',
        company: data.company || 'Company',
        location: data.location || 'Location not specified',
        type: data.type || 'Full-time',
        category: mapToCategory(data.title, data.description), // Map from title/description
        level: data.experience || 'Entry',
        salary: data.salary || 'Competitive',
        applicants: '0', // This would come from applications collection
        capacity: '50', // This could be a field in the job document
        description: data.description || '',
        requirements: Array.isArray(data.requirements) ? data.requirements : [data.requirements || ''],
        benefits: Array.isArray(data.benefits) ? data.benefits : [data.benefits || ''],
        postedDate: data.postedAt ? new Date(data.postedAt) : new Date(),
        companyIcon: generateCompanyIcon(data.company),
        companyColor: generateCompanyColor(data.company),
        employerId: data.employerId || ''
      };

      jobs.push(job);
    });

    console.log(`✅ Successfully fetched ${jobs.length} jobs for job seekers`);
    return jobs;

  } catch (error) {
    console.error('❌ Error fetching jobs for job seekers:', error);
    throw error;
  }
}

/**
 * Map job title and description to a category
 */
function mapToCategory(title: string = '', description: string = ''): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('design') || text.includes('ui') || text.includes('ux') || text.includes('developer') || text.includes('frontend') || text.includes('backend')) {
    return 'Design & Development';
  }
  if (text.includes('marketing') || text.includes('communication') || text.includes('social media')) {
    return 'Marketing & Communication';
  }
  if (text.includes('finance') || text.includes('accounting') || text.includes('financial')) {
    return 'Finance';
  }
  if (text.includes('project') || text.includes('manager') || text.includes('management')) {
    return 'Project Management';
  }
  if (text.includes('hr') || text.includes('human') || text.includes('research')) {
    return 'Human Research';
  }
  
  return 'Other';
}

/**
 * Generate a company icon based on company name
 */
function generateCompanyIcon(companyName: string = ''): string {
  const name = companyName.toLowerCase();
  
  // Common company mappings
  if (name.includes('google')) return 'google';
  if (name.includes('microsoft')) return 'microsoft';
  if (name.includes('apple')) return 'apple';
  if (name.includes('facebook') || name.includes('meta')) return 'facebook';
  if (name.includes('amazon')) return 'amazon';
  if (name.includes('netflix')) return 'netflix';
  if (name.includes('spotify')) return 'spotify';
  if (name.includes('uber')) return 'uber';
  if (name.includes('airbnb')) return 'airbnb';
  
  // Default icon for unknown companies
  return 'office-building';
}

/**
 * Generate a company color based on company name
 */
function generateCompanyColor(companyName: string = ''): string {
  const name = companyName.toLowerCase();
  
  // Brand colors for known companies
  if (name.includes('google')) return '#4285F4';
  if (name.includes('microsoft')) return '#00BCF2';
  if (name.includes('apple')) return '#007AFF';
  if (name.includes('facebook') || name.includes('meta')) return '#1877F2';
  if (name.includes('amazon')) return '#FF9900';
  if (name.includes('netflix')) return '#E50914';
  if (name.includes('spotify')) return '#1DB954';
  if (name.includes('uber')) return '#000000';
  if (name.includes('airbnb')) return '#FF5A5F';
  
  // Generate a color based on company name hash
  const colors = ['#00A389', '#4F46E5', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
  const hash = companyName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * Submit a job application
 */
export async function submitApplication({
  jobId,
  coverLetter,
  email,
  phone,
}: {
  jobId: string;
  coverLetter: string;
  email: string;
  phone: string;
}): Promise<string> {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('You must be logged in to submit an application');
    }

    if (!jobId || !coverLetter || !email || !phone) {
      throw new Error('Missing required application fields');
    }

    console.log('📝 Submitting application for job:', jobId);

    const applicationsRef = collection(db, 'applications');
    const docRef = await addDoc(applicationsRef, {
      jobId,
      userId: currentUser.uid,
      coverLetter,
      email,
      phone,
      status: 'pending',
      appliedAt: Timestamp.now(),
    });

    console.log('✅ Application submitted successfully:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    throw error;
  }
}

/**
 * Get all applications submitted by the current user
 */
export async function getUserApplications(): Promise<any[]> {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('You must be logged in to view your applications');
    }

    console.log('📋 Fetching applications for user:', currentUser.uid);

    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', currentUser.uid)
    );

    const querySnapshot = await getDocs(applicationsQuery);
    const applications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      appliedAt: doc.data().appliedAt?.toDate() || new Date(),
    }));

    console.log(`✅ Found ${applications.length} applications`);
    return applications;
  } catch (error) {
    console.error('❌ Error fetching user applications:', error);
    throw error;
  }
}

/**
 * Check if user has already applied to a specific job
 */
export async function hasUserAppliedToJob(jobId: string): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return false;
    }

    const applicationsQuery = query(
      collection(db, 'applications'),
      where('userId', '==', currentUser.uid),
      where('jobId', '==', jobId)
    );

    const querySnapshot = await getDocs(applicationsQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('❌ Error checking application status:', error);
    return false;
  }
}
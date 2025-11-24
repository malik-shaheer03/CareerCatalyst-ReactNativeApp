import { auth, db } from './firebase';
import { getDoc, doc, addDoc, collection } from 'firebase/firestore';

// Simple test functions to debug Firebase connectivity
export async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');
    
    // Check auth
    const user = auth.currentUser;
    console.log('User:', user ? { uid: user.uid, email: user.email } : 'Not authenticated');
    
    if (!user) {
      console.log('❌ No user authenticated');
      return { success: false, error: 'No user authenticated' };
    }
    
    // Check employer document
    console.log('🔍 Checking employer document...');
    const employerDoc = await getDoc(doc(db, 'employers', user.uid));
    console.log('Employer doc exists:', employerDoc.exists());
    
    if (employerDoc.exists()) {
      console.log('Employer data:', employerDoc.data());
    }
    
    // Test simple write to jobs collection
    console.log('🔍 Testing write to jobs collection...');
    const testJob = {
      title: 'Test Job - DELETE ME',
      company: 'Test Company',
      location: 'Test Location',
      type: 'Full-time',
      experience: 'Entry Level',
      salary: 'Test',
      description: 'Test job for Firebase connectivity',
      requirements: 'None',
      benefits: 'None',
      employerId: user.uid,
      status: 'active',
      postedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await addDoc(collection(db, 'jobs'), testJob);
    console.log('✅ Test job created with ID:', result.id);
    
    return { success: true, jobId: result.id };
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return { success: false, error };
  }
}

// Check auth state
export function checkAuthState() {
  const user = auth.currentUser;
  console.log('Current auth state:');
  console.log('- User:', user ? user.uid : 'None');
  console.log('- Email:', user ? user.email : 'None');
  console.log('- Authenticated:', !!user);
  return !!user;
}
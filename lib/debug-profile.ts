import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';

/**
 * Debug utility to check and fix employer profile issues
 * Call this function to see what's happening with the current user's profile
 */
export async function debugEmployerProfile() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log('❌ No authenticated user');
    return;
  }

  console.log('🔍 Debugging profile for user:', currentUser.uid);
  console.log('📧 User email:', currentUser.email);

  // Check if employer document exists with UID as document ID
  const employerDocRef = doc(db, 'employers', currentUser.uid);
  const employerSnap = await getDoc(employerDocRef);

  console.log('🏢 Employer document (UID as ID) exists:', employerSnap.exists());
  if (employerSnap.exists()) {
    console.log('✅ Employer data:', employerSnap.data());
    return 'employer';
  }

  // Check if employer document exists in the collection with UID field
  const employerQuery = query(collection(db, 'employers'), where('uid', '==', currentUser.uid));
  const employerQuerySnap = await getDocs(employerQuery);

  console.log('🔍 Employer documents found by UID field:', employerQuerySnap.size);

  if (!employerQuerySnap.empty) {
    console.log('🔧 Found employer document with wrong structure, fixing...');
    const wrongDoc = employerQuerySnap.docs[0];
    const data = wrongDoc.data();
    
    // Create new document with correct structure
    await setDoc(doc(db, 'employers', currentUser.uid), data);
    console.log('✅ Created correct employer document');

    // Delete old document
    await deleteDoc(wrongDoc.ref);
    console.log('🗑️ Deleted old document');
    
    return 'employer';
  }

  // Check employee documents
  const employeeDocRef = doc(db, 'employees', currentUser.uid);
  const employeeSnap = await getDoc(employeeDocRef);

  console.log('👤 Employee document (UID as ID) exists:', employeeSnap.exists());
  if (employeeSnap.exists()) {
    console.log('✅ Employee data:', employeeSnap.data());
    return 'employee';
  }

  // Check if employee document exists in the collection with UID field
  const employeeQuery = query(collection(db, 'employees'), where('uid', '==', currentUser.uid));
  const employeeQuerySnap = await getDocs(employeeQuery);

  console.log('🔍 Employee documents found by UID field:', employeeQuerySnap.size);

  if (!employeeQuerySnap.empty) {
    console.log('🔧 Found employee document with wrong structure, fixing...');
    const wrongDoc = employeeQuerySnap.docs[0];
    const data = wrongDoc.data();
    
    // Create new document with correct structure
    await setDoc(doc(db, 'employees', currentUser.uid), data);
    console.log('✅ Created correct employee document');

    // Delete old document
    await deleteDoc(wrongDoc.ref);
    console.log('🗑️ Deleted old document');
    
    return 'employee';
  }

  console.log('❌ No profile found for user');
  return null;
}

/**
 * Create a test employer profile for the current user
 */
export async function createTestEmployerProfile() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log('❌ No authenticated user');
    return;
  }

  const employerData = {
    uid: currentUser.uid,
    email: currentUser.email,
    companyName: 'Test Company',
    companyWebsite: 'https://testcompany.com',
    companyLocation: 'Test City, Test Country',
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'employers', currentUser.uid), employerData);
  console.log('✅ Created test employer profile:', employerData);
}

/**
 * Create a test employee profile for the current user
 */
export async function createTestEmployeeProfile() {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    console.log('❌ No authenticated user');
    return;
  }

  const employeeData = {
    uid: currentUser.uid,
    email: currentUser.email,
    fullName: 'Test User',
    createdAt: new Date(),
  };

  await setDoc(doc(db, 'employees', currentUser.uid), employeeData);
  console.log('✅ Created test employee profile:', employeeData);
}
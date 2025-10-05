import { auth, db } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

// Test Firebase Authentication
export const testFirebaseAuth = async () => {
  console.log('🔥 Testing Firebase Authentication...');
  
  try {
    // Test 1: Check if Firebase is initialized
    console.log('✅ Firebase Auth initialized:', !!auth);
    console.log('✅ Firebase Firestore initialized:', !!db);
    
    // Test 2: Test email/password signup
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';
    
    console.log('📝 Testing email/password signup...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ User created:', userCredential.user.uid);
    
    // Test 3: Test Firestore write
    console.log('💾 Testing Firestore write...');
    const docRef = await addDoc(collection(db, 'employees'), {
      uid: userCredential.user.uid,
      email: testEmail,
      createdAt: new Date(),
      testData: true
    });
    console.log('✅ Document written with ID:', docRef.id);
    
    // Test 4: Test Firestore read
    console.log('📖 Testing Firestore read...');
    const q = query(collection(db, 'employees'), where('uid', '==', userCredential.user.uid));
    const querySnapshot = await getDocs(q);
    console.log('✅ Documents found:', querySnapshot.size);
    
    // Test 5: Test sign out
    console.log('🚪 Testing sign out...');
    await signOut(auth);
    console.log('✅ User signed out');
    
    console.log('🎉 All Firebase tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    return false;
  }
};

// Test Google Sign-In (requires proper configuration)
export const testGoogleSignIn = async () => {
  console.log('🔍 Google Sign-In test requires proper web client ID configuration');
  console.log('📋 Please update App/lib/google-signin-config.js with your web client ID');
  return false;
};

// Run tests
export const runAllTests = async () => {
  console.log('🚀 Starting Firebase Authentication Tests...');
  
  const authTest = await testFirebaseAuth();
  const googleTest = await testGoogleSignIn();
  
  console.log('📊 Test Results:');
  console.log('  Firebase Auth:', authTest ? '✅ PASS' : '❌ FAIL');
  console.log('  Google Sign-In:', googleTest ? '✅ PASS' : '⚠️  CONFIG NEEDED');
  
  return { authTest, googleTest };
};


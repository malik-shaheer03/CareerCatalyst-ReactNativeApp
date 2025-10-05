#!/usr/bin/env node

/**
 * Firebase Setup Script
 * This script helps configure Firebase for the Career Catalyst app
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Career Catalyst Firebase Setup');
console.log('=====================================\n');

// Check if Firebase config exists
const firebaseConfigPath = path.join(__dirname, 'lib', 'firebase.js');
const googleConfigPath = path.join(__dirname, 'lib', 'google-signin-config.js');

console.log('📋 Setup Checklist:');
console.log('');

// 1. Check Firebase configuration
if (fs.existsSync(firebaseConfigPath)) {
  console.log('✅ Firebase configuration file exists');
} else {
  console.log('❌ Firebase configuration file missing');
}

// 2. Check Google Sign-In configuration
if (fs.existsSync(googleConfigPath)) {
  console.log('✅ Google Sign-In configuration file exists');
} else {
  console.log('❌ Google Sign-In configuration file missing');
}

console.log('');
console.log('🔧 Required Setup Steps:');
console.log('');

console.log('1. Firebase Console Setup:');
console.log('   - Go to https://console.firebase.google.com/');
console.log('   - Select project: careercatalyst-a6a21');
console.log('   - Enable Authentication > Sign-in method');
console.log('   - Enable Email/Password and Google providers');
console.log('');

console.log('2. Get Google Sign-In Web Client ID:');
console.log('   - In Firebase Console, go to Project Settings > General');
console.log('   - Find your web app and copy the Web client ID');
console.log('   - Update App/lib/google-signin-config.js');
console.log('');

console.log('3. Apply Firestore Rules:');
console.log('   - Go to Firestore Database > Rules');
console.log('   - Copy rules from App/firestore.rules');
console.log('   - Paste and publish the rules');
console.log('');

console.log('4. Test Authentication:');
console.log('   - Run the app');
console.log('   - Try creating an account');
console.log('   - Test both email/password and Google Sign-In');
console.log('');

console.log('📚 For detailed instructions, see App/FIREBASE_SETUP.md');
console.log('');

// Check if we can read the current config
try {
  const firebaseConfig = fs.readFileSync(firebaseConfigPath, 'utf8');
  if (firebaseConfig.includes('YOUR_WEB_CLIENT_ID')) {
    console.log('⚠️  WARNING: Google Sign-In web client ID needs to be configured');
  }
} catch (error) {
  console.log('❌ Could not read Firebase configuration');
}

console.log('🎉 Setup script completed!');


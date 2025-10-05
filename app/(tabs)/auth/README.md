# Authentication System - React Native

This folder contains the converted authentication screens from the web version to React Native, following proper mobile app structure and design patterns.

## 📁 File Structure

```
App/app/auth/
├── _layout.tsx          # Auth navigation layout
├── login.tsx           # Login screen (converted from web Login.js)
├── signup.tsx          # Sign up screen (converted from web SignUp.js)
└── forgot-password.tsx # Password reset screen
```

## 🚀 Features

### **Login Screen (`login.tsx`)**
- ✅ Email/Password authentication
- ✅ Google Sign-in integration
- ✅ Job Seeker/Employer toggle switch
- ✅ Form validation with error handling
- ✅ Password visibility toggle
- ✅ Forgot password navigation
- ✅ Navigation to sign up
- ✅ Loading states and disabled buttons

### **Sign Up Screen (`signup.tsx`)**
- ✅ Email/Password registration
- ✅ Google Sign-up integration
- ✅ Job Seeker/Employer registration types
- ✅ Employer-specific fields (Company Name, Website, Location)
- ✅ Password confirmation validation
- ✅ Form validation with real-time error clearing
- ✅ Responsive design for mobile
- ✅ Loading states and proper error handling

### **Forgot Password Screen (`forgot-password.tsx`)**
- ✅ Email-based password reset
- ✅ Email validation
- ✅ Success state with confirmation
- ✅ Resend email functionality
- ✅ Back navigation to login

## 🎨 Design Features

### **Mobile-First Design**
- **Native Components**: Uses React Native components instead of Material-UI
- **Touch-Friendly**: Proper touch targets and mobile interactions
- **Responsive Layout**: Adapts to different screen sizes
- **Native Icons**: Uses @expo/vector-icons for consistent iconography

### **Color Scheme** (Matches Web Version)
- **Primary**: `#004D40` (Dark Teal)
- **Secondary**: `#00A389` (Teal)
- **Error**: `#f44336` (Red)
- **Text**: White on dark background

### **User Experience**
- **Switch Component**: Native toggle for Job Seeker/Employer selection
- **Form Validation**: Real-time validation with error clearing
- **Loading States**: Activity indicators and disabled states
- **Alert System**: Native Alert dialogs for feedback
- **Keyboard Handling**: Proper keyboard types and autocomplete

## 🔧 Setup Instructions

### 1. **Firebase Configuration**
The screens are ready for Firebase integration. Uncomment and configure:

```typescript
// In your firebase config file (lib/firebase.js or similar)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 2. **Enable Firebase Authentication**
Uncomment the Firebase imports in `login.tsx` and `signup.tsx`:

```typescript
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider, 
  signInWithPopup 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
```

### 3. **Navigation Setup**
The auth layout is configured to work with Expo Router. Make sure your main app layout includes the auth routes:

```typescript
// In your main _layout.tsx
export const unstable_settings = {
  initialRouteName: 'auth', // or your preferred initial route
};
```

### 4. **Google Sign-In Setup**
For Google authentication, you'll need to:
1. Configure Google Sign-In in Firebase Console
2. Add Google Sign-In to your app configuration
3. For React Native, consider using `@react-native-google-signin/google-signin`

## 📱 Usage

### **Navigation**
```typescript
// Navigate to login
router.push('/auth/login');

// Navigate to sign up
router.push('/auth/signup');

// Navigate to forgot password
router.push('/auth/forgot-password');
```

### **User Types**
The system supports two user types:
- **Job Seekers**: Standard user accounts
- **Employers**: Business accounts with company information

### **Data Storage**
- **Job Seekers** → `employees` collection in Firestore
- **Employers** → `employers` collection in Firestore

## 🔄 Conversion Notes

### **From Web to React Native**
- **Material-UI** → **React Native Components**
- **styled-components** → **StyleSheet**
- **Snackbar** → **Alert**
- **useNavigate** → **useRouter (Expo Router)**
- **onClick** → **onPress**
- **CSS Flexbox** → **React Native Flexbox**

### **Enhanced Features**
- ✅ **Better Mobile UX**: Touch-optimized interface
- ✅ **Native Keyboard Handling**: Proper input types
- ✅ **Loading States**: Activity indicators
- ✅ **Form Validation**: Real-time error clearing
- ✅ **Password Visibility**: Toggle for better UX

## 🚨 TODO Items

1. **Firebase Integration**: Uncomment and configure Firebase methods
2. **Google Sign-In**: Implement proper Google authentication for React Native
3. **Biometric Authentication**: Add Face ID/Fingerprint support
4. **Deep Linking**: Handle password reset email links
5. **Offline Support**: Handle network connectivity issues
6. **Push Notifications**: Setup for authentication events

## 🧪 Testing

Test the screens by:
1. Running the app: `npx expo start`
2. Navigate to `/auth/login`, `/auth/signup`, or `/auth/forgot-password`
3. Test form validation, navigation, and user flows
4. Verify responsive design on different screen sizes

## 📚 Dependencies

The screens use these packages:
- `@expo/vector-icons` - For icons
- `expo-router` - For navigation
- `react-native` - Core components
- Firebase packages (when enabled)

This authentication system provides a solid foundation for mobile app authentication with proper TypeScript support, mobile-optimized design, and integration-ready Firebase configuration.
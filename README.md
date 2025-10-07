# 🚀 CareerCatalyst - AI-Powered Career Development Platform

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)

*Comprehensive mobile career development platform with AI-powered interview preparation and job matching*

**📱 Cross-Platform | 🤖 AI-Powered | 🔐 Secure Authentication | 📊 Real-time Analytics**

</div>

## 🚀 Overview

**CareerCatalyst** is a cutting-edge mobile application that revolutionizes career development through AI-powered tools and comprehensive job search capabilities. Built with React Native and Expo, it provides job seekers with intelligent interview preparation, personalized career guidance, and seamless job discovery experiences.

### ✨ Key Features

- 🎯 **AI-Powered Interview Prep** - Mock interviews with real-time speech recognition and analysis
- 📝 **Smart MCQ Practice** - Adaptive quiz system with AI-generated questions
- 🗺️ **Career Path Guidance** - Personalized career recommendations using Google Gemini AI
- 💼 **Job Discovery** - Advanced job search with filtering and real-time updates
- 📄 **Advanced Resume Builder** - Professional resume creation with rich text editing and PDF export
- 📊 **Resume Dashboard** - Manage multiple resumes with preview and sharing capabilities
- 🔐 **Multi-role Authentication** - Secure login for job seekers and employers
- 📊 **Performance Analytics** - Detailed insights into interview and quiz performance
- 🎨 **Modern UI/UX** - Beautiful, intuitive design with smooth animations
- 🔔 **Toast Notifications** - Real-time feedback and user notifications
- ✅ **Confirmation Modals** - Interactive confirmation dialogs for better UX

## 🏗️ System Architecture

### Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React Native** | Cross-platform mobile framework | Latest |
| **Expo** | Development platform and tools | Latest |
| **TypeScript** | Type safety & development | 5+ |
| **Firebase** | Backend services & authentication | Latest |
| **Google Gemini AI** | AI-powered content generation | 2.5 Flash Lite |
| **Expo Router** | File-based navigation | Latest |
| **React Navigation** | Navigation library | Latest |

### Core Components

1. **Authentication System**: Secure multi-role login with Firebase
2. **Job Seeker Dashboard**: Personal career management interface
3. **Employer Dashboard**: Job posting and candidate management
4. **Interview Module**: AI-powered mock interviews and MCQ practice
5. **Career Path Module**: Personalized career guidance and training recommendations
6. **Job Search**: Advanced filtering and real-time job discovery
7. **Advanced Resume System**: Professional resume builder with rich text editing and PDF export
8. **Resume Dashboard**: Multi-resume management with preview and sharing
9. **AI Integration**: Enhanced AI services for content generation and recommendations
10. **Notification System**: Toast notifications and confirmation modals

## 🎨 User Interface Features

### Modern Android Design

- 🏠 **Hero Sections**: Compelling introductions with gradient backgrounds
- 🎯 **Card-based Layout**: Clean, organized information display
- 💳 **Interactive Elements**: Smooth animations and micro-interactions
- 👥 **Profile Management**: Comprehensive user profile and resume builder
- 📞 **Real-time Updates**: Live data synchronization across all screens
- 🧭 **Intuitive Navigation**: Tab-based navigation with active state indicators

### Dashboard Features

- 📊 **Real-time Statistics**: Live job count, application status, and performance metrics
- 🔄 **Live Data Sync**: Instant updates across all user interfaces
- 📱 **Responsive Design**: Optimized for all Android device sizes
- 🎭 **Smooth Animations**: Professional transitions and glassmorphism effects
- 🔔 **Notification System**: Real-time alerts and updates

## 🔐 Authentication & Security

### Multi-role System

```typescript
// Role-based access control
✅ Job Seeker: Personal career management and job search
✅ Employer: Job posting and candidate management
✅ Secure Firebase Authentication
✅ Real-time session management
✅ Protected routes and data access
```

### Security Features

- 🔐 **Role-based Access Control**: Granular permissions for each user type
- 🔒 **Firebase Security Rules**: Database-level security enforcement
- 🛡️ **Protected Routes**: Automatic redirects based on user roles
- 🔑 **Secure Authentication**: Email/password with session management
- 📱 **Biometric Support**: Fingerprint and face recognition (Android)

## 📱 Cross-Platform Compatibility

### Device Support

| Platform | Version | Features |
|----------|---------|----------|
| 🤖 **Android** | 6.0+ | Full feature support with native performance |
| 🍎 **iOS** | 12.0+ | Complete compatibility with iOS-specific optimizations |
| 📱 **Tablets** | All sizes | Adaptive layouts for larger screens |
| 🖥️ **Web** | Modern browsers | Progressive web app capabilities |

## 🚀 Getting Started

### Prerequisites

```bash
# Node.js (v18 or higher)
node --version

# npm or yarn
npm --version

# Expo CLI
npm install -g @expo/cli

# Android Studio (for Android development)
# Xcode (for iOS development - macOS only)
```

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-username/CareerCatalyst.git

# Navigate to project directory
cd CareerCatalyst/App

# Install dependencies
npm install

# Set up Firebase configuration
# Add your Firebase config to lib/firebase.ts

# Set up Google AI API key
# Add your Gemini API key to lib/services/mcq-api.ts

# Start development server
npx expo start

# Run on Android
npx expo start --android

# Run on iOS
npx expo start --ios

# Build for production
npx expo build:android
npx expo build:ios
```

### Firebase Configuration

```typescript
// lib/firebase.ts
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Google AI Configuration

```typescript
// lib/services/mcq-api.ts
const apiKey = "your-gemini-api-key";
const model = "gemini-2.5-flash-lite";
```

## 💻 Usage Examples

### Job Seeker Features

```typescript
// Job Seeker Dashboard
1. Profile Management - Complete profile setup and editing
2. Job Search - Advanced filtering and real-time job discovery
3. Interview Prep - AI-powered mock interviews and MCQ practice
4. Career Guidance - Personalized career path recommendations
5. Resume Builder - Professional resume creation and optimization
6. Performance Tracking - Detailed analytics and progress monitoring
```

### Employer Features

```typescript
// Employer Dashboard
1. Job Posting - Create and manage job listings
2. Candidate Management - Review applications and profiles
3. Interview Scheduling - Coordinate interview sessions
4. Analytics - Track job posting performance
5. Company Profile - Manage company information
```

### AI-Powered Features

```typescript
// Interview Module
1. Mock Interviews - Real-time speech recognition and analysis
2. MCQ Practice - AI-generated questions with adaptive difficulty
3. Performance Analysis - Detailed feedback and improvement suggestions
4. Career Recommendations - Personalized career path guidance
5. Training Suggestions - AI-curated learning resources
```

## 🌟 Feature Highlights

### 1. **AI-Powered Interview System**
- Real-time speech recognition for mock interviews
- Intelligent performance analysis and feedback
- Adaptive question generation based on job roles
- Comprehensive scoring and improvement suggestions

### 2. **Smart Career Guidance**
- Personalized career path recommendations
- AI-curated training and skill development suggestions
- Industry-specific insights and trends
- Progress tracking and milestone achievements

### 3. **Advanced Job Search**
- Real-time job discovery with instant updates
- Advanced filtering by location, salary, and requirements
- Saved searches and job alerts
- Application tracking and status updates

### 4. **Advanced Resume System**
- Professional resume builder with rich text editing
- Multiple resume templates and customization options
- Real-time preview and PDF export functionality
- Resume dashboard for managing multiple resumes
- AI-powered content suggestions and optimization

### 5. **Comprehensive Analytics**
- Interview performance metrics and trends
- Career development progress tracking
- Job application success rates
- Skill assessment and improvement areas
- Resume performance and optimization insights

## 📊 Performance Metrics

- **App Launch Time**: < 2 seconds
- **Real-time Updates**: < 500ms latency
- **Speech Recognition**: < 1 second response time
- **AI Response Time**: < 3 seconds for content generation
- **Cross-platform Performance**: 95+ optimization score
- **Memory Usage**: Optimized for mobile devices
- **Battery Efficiency**: Minimal impact on device battery

## 🔧 Technical Implementation

### Firebase Services Used

- **Authentication**: User management and security
- **Firestore**: Real-time database for all operations
- **Cloud Functions**: Automated background processes
- **Storage**: Resume and document management
- **Security Rules**: Database-level access control

### AI Integration

- **Google Gemini 2.5 Flash Lite**: Content generation and analysis
- **Speech Recognition**: Real-time voice processing
- **Natural Language Processing**: Interview analysis and feedback
- **Machine Learning**: Personalized recommendations

### Key Libraries

- **Expo Router**: File-based navigation system
- **React Navigation**: Advanced navigation features
- **Expo Linear Gradient**: Beautiful gradient backgrounds
- **Expo Blur**: Glassmorphism effects
- **React Native Voice**: Speech recognition capabilities
- **Expo Speech**: Text-to-speech functionality
- **html2canvas**: HTML to canvas conversion for resume export
- **jsPDF**: PDF generation for resume downloads
- **React Native Paper**: Material Design components
- **React Native Render HTML**: Rich text rendering
- **React Native Super Grid**: Advanced grid layouts

## 📝 Project Structure

```
CareerCatalyst/
├── App/                      # React Native app directory
│   ├── app/                 # Expo Router pages
│   │   ├── (tabs)/         # Tab-based navigation screens
│   │   │   ├── auth/       # Authentication screens
│   │   │   ├── dashboards/ # User dashboards
│   │   │   ├── resume-builder.tsx    # Advanced resume builder
│   │   │   ├── resume-dashboard.tsx  # Resume management
│   │   │   └── ...         # Other feature screens
│   │   └── modal.tsx       # Modal components
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components
│   │   ├── profile-setup/ # Profile setup components
│   │   ├── resume/        # Resume-specific components
│   │   │   ├── form-components/  # Resume form components
│   │   │   ├── preview/          # Resume preview components
│   │   │   └── ...               # Other resume components
│   │   ├── ConfirmationModal.tsx    # Confirmation dialogs
│   │   └── ToastNotification.tsx    # Toast notifications
│   ├── lib/               # Utility functions and services
│   │   ├── services/      # API services and AI integration
│   │   ├── ai/           # AI-specific services and models
│   │   ├── resume/       # Resume management and utilities
│   │   ├── ToastContext.tsx  # Toast notification context
│   │   └── firebase.ts    # Firebase configuration
│   ├── hooks/             # Custom React hooks
│   ├── constants/         # App constants and themes
│   └── assets/           # Images and static assets
├── web/                   # Web version (Next.js)
└── README.md             # Project documentation
```

## 🚀 Deployment

### Production Deployment

```bash
# Build the application
npx expo build:android
npx expo build:ios

# Deploy to app stores
# Configure app store listings
# Set up Firebase project
# Deploy to Google Play Store / Apple App Store
```

### Environment Variables

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
# ... other configuration
```

## 🎯 Key Modules

### 1. **Interview Preparation**
- Mock interview sessions with AI analysis
- MCQ practice with adaptive difficulty
- Real-time speech recognition
- Performance feedback and improvement suggestions

### 2. **Career Path Guidance**
- AI-powered career recommendations
- Personalized training suggestions
- Skill assessment and development
- Industry insights and trends

### 3. **Job Search & Discovery**
- Real-time job listings
- Advanced filtering and search
- Application tracking
- Company profile insights

### 4. **Profile Management**
- Comprehensive user profiles
- Resume builder and optimization
- Skill tracking and development
- Achievement and milestone tracking

## 🔮 Future Enhancements

- 🤖 **Advanced AI Features**: More sophisticated interview analysis
- 📱 **Offline Support**: Offline mode for core features
- 🌐 **Social Features**: Networking and community features
- 📊 **Advanced Analytics**: More detailed performance insights
- 🔔 **Push Notifications**: Real-time job alerts and updates
- 🎓 **Learning Management**: Integrated course and certification tracking

## 👨‍💻 Author

**Muhammad Shaheer Malik**  
- 🌐 [Portfolio](https://shaheer-portfolio-omega.vercel.app)  
- 💼 [LinkedIn](https://linkedin.com/in/malik-shaheer03)  
- 🐙 [GitHub](https://github.com/malik-shaheer03)  
- 📸 [Instagram](https://instagram.com/malik_shaheer03)  
- 📧 [Email Me](mailto:shaheermalik03@gmail.com)   

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**⭐ Star this repository if you found it helpful!**

*Built with ❤️ and modern mobile technologies*

**🚀 Ready to revolutionize career development with AI-powered tools!**

</div>

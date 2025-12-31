# 🚀 CareerCatalyst - AI-Powered Career Development Platform

<div align="center">

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Scikit Learn](https://img.shields.io/badge/Scikit_Learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)

*Comprehensive mobile career development platform with ML-powered predictions, AI interview prep, and intelligent job matching*

**📱 Cross-Platform | 🤖 ML-Powered | 🔐 Secure | 📊 Real-time Analytics | 📧 Email Integration**

</div>

---

## 🚀 Overview

**CareerCatalyst** is a cutting-edge React Native mobile application that revolutionizes career development through **Machine Learning** and **AI-powered tools**. Built with React Native, Expo, Python ML backend, and Firebase, it provides comprehensive solutions for job seekers and employers.

### 🎯 Key Highlights

- **🤖 ML Career Predictions**: TF-IDF-based ML model predicting career paths from user skills
- **📚 130+ Course Recommendations**: Curated Coursera & Udemy courses
- **🎤 AI Interview Preparation**: Real-time speech recognition with Gemini AI feedback
- **📄 Advanced Resume Builder**: Professional resumes with PDF export and email sharing
- **🌐 Job Scraping**: Automatic job discovery from LinkedIn & Indeed
- **📧 Email Integration**: Complete communication system for employers and job seekers
- **📊 Real-time Analytics**: Performance tracking for both job seekers and employers

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [ML Service Architecture](#-ml-service-architecture)
- [Backend Services](#-backend-services)
- [Installation](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [Author](#-author)
- [License](#-license)

---

## ✨ Features

### 🤖 Machine Learning & AI Features

#### **ML Career Path Prediction Service** (NEW!)
- 🎯 **Career Path Prediction**: TF-IDF + Cosine Similarity algorithm predicts top 5 career paths
- 📚 **Training Recommendations**: 130+ curated courses from Coursera & Udemy
- 🔬 **Skill Matching**: 500+ skill vocabulary with unigrams and bigrams
- 📊 **Match Scoring**: Confidence levels (High >0.5, Medium 0.3-0.5, Low <0.3)
- 🔄 **Intelligent Fallback**: Seamless fallback to Gemini AI if ML service unavailable
- ⚡ **FastAPI Backend**: High-performance Python ML service on Port 8001
- 📖 **Interactive Docs**: Swagger UI documentation at `/docs`

#### **Career Paths Supported** (21 Total)
- Frontend Developer
- Backend Developer
- Full Stack Developer
- Mobile App Developer (React Native, Flutter, iOS, Android)
- Data Scientist
- Machine Learning Engineer
- AI Engineer
- DevOps Engineer
- Cloud Engineer (AWS, Azure, GCP)
- Data Engineer
- Database Administrator
- Security Engineer / Cybersecurity Specialist
- UI/UX Designer
- Product Manager
- QA Engineer / Test Automation
- Game Developer
- Blockchain Developer
- Data Analyst / Business Intelligence
- API Developer
- System Software Developer
- Platform Engineer

#### **AI-Powered Interview System**
- 🎤 **Mock Interviews**: Real-time speech recognition and analysis
- 💬 **AI Feedback**: Detailed performance analysis using Google Gemini AI
- 📝 **MCQ Practice**: Adaptive quiz system with AI-generated questions
- 📊 **Performance Tracking**: Detailed scores, improvements, and weak areas
- 🎯 **Role-Specific Questions**: Customized questions based on job title

#### **AI Career Guidance**
- 🗺️ **Personalized Career Paths**: AI recommendations based on skills and experience
- 🎓 **Training Suggestions**: Curated learning resources mapped to career paths
- 📈 **Skill Gap Analysis**: Identify missing skills for target careers
- 💡 **Industry Insights**: Trends and opportunities in different fields

---

### 📄 Advanced Resume System

#### **Resume Builder Features**
- 📝 **Rich Text Editor**: Professional formatting with bold, italic, bullet points
- 🎨 **Multiple Templates**: Various professional designs (ATS-friendly)
- 👁️ **Real-time Preview**: See changes instantly as you edit
- 📤 **PDF Export**: High-quality PDF generation with Expo Print
- 💾 **Auto-save**: Automatic saving every few seconds
- 🤖 **AI Summary Generation**: Gemini AI generates professional summaries
- 📊 **Resume Sections**: Personal info, summary, experience, education, skills, projects, certifications
- 🎯 **Section Management**: Add, edit, reorder, delete sections
- 🖼️ **Avatar Upload**: Professional profile pictures

#### **Resume Dashboard**
- 📚 **Multi-Resume Management**: Create and manage unlimited resumes
- 🔍 **Search & Filter**: Find resumes by title, date, or favorites
- ⭐ **Favorites System**: Mark important resumes for quick access
- 📊 **Sort Options**: Sort by date created or name
- 📤 **Email Sharing**: Share resumes via email with PDF attachments
- 📥 **Download**: Export as PDF files
- 📋 **Duplicate**: Create copies of existing resumes
- 🗑️ **Delete**: Remove unwanted resumes with confirmation
- 🔄 **Real-time Sync**: Firebase Firestore synchronization

---

### 💼 Job Discovery & Management

#### **Job Search Features**
- 🔍 **Advanced Search**: Filter by title, location, salary, type, experience
- 📍 **Location-based Search**: GPS integration for nearby jobs
- 🔄 **Real-time Updates**: Live job synchronization from Firebase
- 💾 **Saved Jobs**: Bookmark jobs for later review
- 🎯 **Smart Recommendations**: AI-powered job matching

#### **Job Scraping System** (Port 8000)
- 🔵 **LinkedIn Scraping**: Automatic job discovery with full details
- 🟣 **Indeed Scraping**: Real-time scraping with salary information
- 🎯 **Advanced Filters**: Location, salary range, job type, experience level
- 📊 **Clean Data**: Structured, validated job data
- ⚡ **Fast API**: High-performance Python FastAPI backend
- 🔄 **On-demand Scraping**: Instant job discovery

#### **Job Application System**
- 📥 **Quick Apply**: One-click application with resume attachment
- 📊 **Application Tracking**: Monitor status (Pending, Shortlisted, Rejected, Hired)
- 📧 **Email Notifications**: Get updates from employers
- 📈 **Success Rate Tracking**: Analyze application conversion rates

---

### 🏢 Employer Features

#### **Job Management**
- 📝 **Post Jobs**: Create detailed job listings with rich descriptions
- 🔧 **Edit Jobs**: Update job details, requirements, and status
- ❌ **Delete Jobs**: Remove outdated postings
- 📊 **Job Analytics**: Track views, applications, and conversions
- 🔄 **Status Management**: Activate or close job postings
- 🎨 **Modern UI**: Card-based layout with swipe gestures

#### **Application Management**
- 📥 **Review Applications**: View all candidate applications
- 👤 **Candidate Profiles**: Detailed information and resume viewing
- 📊 **Status Updates**: Pending → Shortlisted → Hired/Rejected
- 📧 **Email Communication**: Send professional emails to candidates
- 🔍 **Filter by Status**: View applications by current status
- 📈 **Analytics Dashboard**: Real-time metrics and insights

#### **Employer Dashboard**
- 📊 **Real-time Statistics**: Job counts, application metrics, hiring rates
- 📈 **Performance Charts**: Visual analytics for job postings
- 🔄 **Live Data Sync**: Instant updates across all screens
- 📱 **Mobile Optimized**: Responsive design for all devices

---

### 📧 Email Communication System

#### **Email Services** (Ports 5000-5002)

**1. Candidate Email Service** (Port 5000)
- 📧 **Professional Emails**: Employers send emails to candidates
- 🎨 **Email Templates**: Beautiful, branded email designs
- 📨 **Shortlisting Notifications**: Alert candidates when shortlisted
- 🎉 **Hiring Offers**: Professional job offer emails
- 📝 **Custom Messages**: Personalized candidate communication
- ✅ **Delivery Tracking**: Confirm email delivery

**2. Password Reset Service** (Port 5001)
- 🔐 **OTP Generation**: 6-digit OTP for password reset
- 📧 **Email Delivery**: Send OTP via email
- ⏱️ **10-Minute Expiry**: Secure time-limited OTPs
- 🔄 **Resend OTP**: Request new OTP (60-second cooldown)
- ✅ **OTP Verification**: Validate before password reset
- 🔔 **Account Notifications**: Email alerts for account changes

**3. Resume Email Service** (Port 5002)
- 📄 **PDF Attachments**: Send resumes as PDF files
- 📧 **Share Resumes**: Job seekers share with employers/recruiters
- 🎨 **Professional Templates**: Formatted email designs
- ✅ **Delivery Confirmation**: Track successful delivery

---

### 🔐 Authentication & Security

- 🔑 **Multi-Role Authentication**: Job Seeker and Employer accounts
- 📧 **Email/Password Login**: Firebase Authentication
- 🔐 **OTP Password Reset**: Secure 6-digit OTP via email
- ✉️ **Email Verification**: Account security with OTP
- 🛡️ **Protected Routes**: Role-based access control
- 🔒 **Firebase Security Rules**: Database-level protection
- 💪 **Password Strength Validation**: Enforced strong passwords
- 🚪 **Secure Logout**: Clean session management

---

### 🎨 Modern UI/UX

- 🎯 **Card-based Layouts**: Clean, organized information display
- 🎨 **Gradient Backgrounds**: Eye-catching color schemes
- 💎 **Glassmorphism Effects**: Contemporary blur and transparency
- 🔄 **Swipe Gestures**: Intuitive back navigation (right swipe)
- 📱 **Touch-to-Dismiss Modals**: Modern modal interactions
- ✨ **Smooth Animations**: Professional transitions
- 🎭 **Material Icons**: Clear visual communication
- 📊 **Beautiful Charts**: Data visualization for analytics
- 🔔 **Toast Notifications**: Informative feedback messages
- ✅ **Confirmation Modals**: Prevent accidental actions

---

## 🏗️ Tech Stack

### **Frontend**
| Technology | Purpose | Version |
|------------|---------|---------|
| React Native | Cross-platform mobile framework | Latest |
| Expo | Development platform & tools | Latest |
| TypeScript | Type safety & development | 5+ |
| Expo Router | File-based navigation | Latest |
| React Navigation | Advanced navigation | Latest |
| Expo Linear Gradient | Gradient backgrounds | Latest |
| React Native Voice | Speech recognition | Latest |
| Expo Print | PDF generation | Latest |
| Expo Sharing | Native sharing | Latest |

### **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| Firebase | Authentication & Database | Latest |
| Firestore | Real-time NoSQL database | Latest |
| Firebase Storage | File storage for resumes | Latest |
| Node.js | Email microservices | 18+ |
| Express | Web framework | Latest |
| Nodemailer | Email sending | Latest |
| Python | ML service & job scraping | 3.8+ |
| FastAPI | ML API framework | 0.104+ |
| scikit-learn | ML model training | 1.3+ |
| Beautiful Soup | Web scraping | Latest |

### **AI & ML**
| Technology | Purpose |
|------------|---------|
| Google Gemini AI 2.5 Flash Lite | Content generation, interview analysis |
| TF-IDF Vectorization | Text feature extraction |
| Cosine Similarity | Skill matching algorithm |
| Natural Language Processing | Text analysis |

---

## 🤖 ML Service Architecture

### **Career Prediction Pipeline**

```
┌─────────────────────────────────────────────────────────────┐
│                ML CAREER PREDICTION FLOW                     │
└─────────────────────────────────────────────────────────────┘

User Skills Input (Array of Strings)
            ↓
React Native App → HTTP POST Request
            ↓
FastAPI ML Service (Port 8001)
            ↓
TF-IDF Vectorization
    • Convert skills to numerical vectors
    • 500+ feature vocabulary (unigrams + bigrams)
    • Normalize and weight features
            ↓
Cosine Similarity Matching
    • Compare user vector with 21 career vectors
    • Calculate similarity scores (0-1 range)
    • Rank careers by match score
            ↓
Top 5 Career Predictions
    • Career title & description
    • Match score (0.0 - 1.0)
    • Confidence level (High/Medium/Low)
            ↓
Course Recommender System
    • Map careers to course categories
    • Select 3 relevant courses per career
    • 130+ courses from Coursera & Udemy
            ↓
JSON Response
    • Career predictions
    • Training recommendations
    • Match scores & confidence
            ↓
React Native App Display
    • Fallback to Gemini AI if ML service unavailable
```

### **ML Model Details**

- **Algorithm**: TF-IDF + Cosine Similarity
- **Training Data**: 21 career categories
- **Skill Vocabulary**: 500+ unique skills
- **Feature Extraction**: Unigrams + Bigrams (1-2 word combinations)
- **Similarity Metric**: Cosine similarity (angular distance)
- **Model Storage**: Pickle files (.pkl)
- **Performance**: < 100ms average response time

### **Course Recommendation System**

**Course Categories** (12 domains):
- Frontend Development (React, Vue, Angular)
- Backend Development (Node.js, Django, Spring Boot)
- Full Stack Development
- Mobile Development (React Native, Flutter, iOS, Android)
- Data Science & ML
- DevOps & Cloud (AWS, Azure, Docker, Kubernetes)
- Data Engineering (Spark, Hadoop, Airflow)
- Cybersecurity
- AI & Deep Learning
- QA & Testing
- UI/UX Design
- Product Management
- Blockchain

**Course Platforms**:
- **Coursera**: Professional certificates, specializations (65+ courses)
- **Udemy**: Practical bootcamps and hands-on courses (65+ courses)

---

## 📡 Backend Services

CareerCatalyst includes **5 backend services** working together:

### **1. ML Career Prediction Service** (Port 8001) 🆕

**Purpose**: Machine learning-powered career path predictions and course recommendations

**Features**:
- Career path prediction from user skills
- Training course recommendations
- Skill matching and analysis
- Health check and diagnostics
- Interactive API documentation

**Endpoints**:
- `GET /` - Service information
- `GET /health` - Health check and model status
- `POST /api/predict-career-paths` - Predict careers from skills
- `POST /api/recommend-training` - Get course recommendations
- `GET /api/available-careers` - List all supported careers
- `GET /docs` - Swagger UI documentation

**Technology**: Python, FastAPI, scikit-learn, numpy

---

### **2. Password Reset Service** (Port 5001)

**Purpose**: Secure OTP-based password reset system

**Features**:
- 6-digit OTP generation
- Email delivery via Nodemailer
- OTP verification (10-minute expiry)
- Resend OTP functionality (60-second cooldown)
- Password reset after verification
- Account deletion notifications

**Endpoints**:
- `POST /send-otp` - Generate and send OTP
- `POST /verify-otp` - Verify OTP code
- `POST /resend-otp` - Resend expired OTP
- `POST /reset-password` - Reset password after OTP verification
- `POST /send-deletion-email` - Notify about account deletion

**Technology**: Node.js, Express, Nodemailer, Firebase Admin

---

### **3. Candidate Email Service** (Port 5000)

**Purpose**: Employer-to-candidate email communication

**Features**:
- Shortlisting notifications
- Hiring offer emails
- Custom message emails
- Professional email templates
- Delivery confirmation

**Endpoints**:
- `POST /send-email` - Send email to candidate
- `GET /health` - Service health check

**Email Types**:
- Shortlisting notification
- Hiring offer
- Application rejection
- Interview invitation
- Custom message

**Technology**: Node.js, Express, Nodemailer, Gmail SMTP

---

### **4. Resume Email Service** (Port 5002)

**Purpose**: Share resumes via email with PDF attachments

**Features**:
- PDF attachment support
- Resume sharing to employers/recruiters
- Professional email templates
- Delivery tracking

**Endpoints**:
- `POST /share-resume` - Email resume with PDF attachment
- `GET /health` - Service health check

**Technology**: Node.js, Express, Nodemailer, Multer (file handling)

---

### **5. Job Scraping Service** (Port 8000)

**Purpose**: Automatic job discovery from LinkedIn and Indeed

**Features**:
- LinkedIn job scraping
- Indeed job scraping
- Advanced filtering (location, salary, type, experience)
- Clean, structured data
- Real-time scraping
- Mock data fallback

**Endpoints**:
- `POST /api/scrape-jobs` - Scrape jobs from platforms
- `GET /` - Service health check

**Scraping Capabilities**:
- Job title, company, location
- Job description and requirements
- Salary information
- Job type (Full-time, Part-time, Contract)
- Experience level
- Application links

**Technology**: Python, FastAPI, Beautiful Soup, Selenium, Jobspy

---

## 🚀 Installation & Setup

### **Prerequisites**

```bash
# Node.js (v18 or higher)
node --version

# Python (v3.8 or higher)
python --version

# npm (comes with Node.js)
npm --version

# pip (Python package manager)
pip --version

# Expo CLI (globally installed)
npm install -g @expo/cli
```

### **Clone Repository**

```bash
git clone https://github.com/malik-shaheer03/CareerCatalyst-ReactNativeApp.git
cd CareerCatalyst-ReactNativeApp/App
```

### **Install Dependencies**

#### **Frontend (React Native)**
```bash
# Install main dependencies
npm install

# Install additional dependencies if needed
npm install expo-router expo-linear-gradient expo-blur expo-speech
npm install @expo/vector-icons react-native-voice expo-print expo-sharing
```

#### **Backend (Node.js Services)**
```bash
cd backend
npm install
```

#### **Backend (Python Services)**
```bash
# Install job scraping service dependencies
cd backend
pip install -r requirements.txt

# Install ML service dependencies
cd ml_service
pip install -r requirements.txt
```

### **Configuration**

#### **1. Firebase Setup**

Create `lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

#### **2. Google Gemini AI Setup**

Update `lib/ai/aiModel.ts`:
```typescript
const API_KEY = "your-gemini-api-key-here";
const model = "gemini-2.5-flash-lite";
```

Get your API key from: https://makersuite.google.com/app/apikey

#### **3. Backend Environment Variables**

Create `backend/.env`:
```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Service Ports
RESET_PORT=5001
EMAIL_PORT=5000
RESUME_EMAIL_PORT=5002

# Optional: Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
```

**Important**: Use Gmail App Password, not your regular password.  
Learn how: https://support.google.com/accounts/answer/185833

---

## 🏃 Running the Application

### **Option 1: Quick Start (Windows)**

```bash
# Terminal 1 - Start all Node.js services
cd backend
start-all-services.bat

# Terminal 2 - Start ML service
cd backend/ml_service
start_ml_service.bat

# Terminal 3 - Start Expo
cd ../..
npx expo start
```

### **Option 2: Manual Start (All Platforms)**

#### **Start Backend Services (6 separate terminals)**

```bash
# Terminal 1 - ML Service
cd App/backend/ml_service
python train_model.py      # First time only - train the model
python api/ml_server.py    # Start ML API

# Terminal 2 - Job Scraping Service
cd App/backend
python main.py

# Terminal 3 - Password Reset Service
cd App/backend
node passwordReset.js

# Terminal 4 - Candidate Email Service
cd App/backend
node send_candidate_email.js

# Terminal 5 - Resume Email Service
cd App/backend
node sendResumeEmail.js

# Terminal 6 - Expo Development Server
cd App
npx expo start
```

### **Run on Devices**

```bash
# Android
npx expo start --android

# iOS (macOS only)
npx expo start --ios

# Web
npx expo start --web
```

### **Build for Production**

```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios

# Configure EAS Build
eas build:configure
```

---

## 📁 Project Structure

```
CareerCatalyst-ReactNativeApp/
└── App/
    ├── app/                          # Expo Router pages
    │   ├── (tabs)/                   # Tab navigation screens
    │   │   ├── auth/                 # Authentication screens
    │   │   │   ├── login.tsx
    │   │   │   ├── signup.tsx
    │   │   │   ├── forgot-password.tsx
    │   │   │   ├── verify-otp.tsx
    │   │   │   └── reset-password.tsx
    │   │   ├── dashboards/           # Dashboard screens
    │   │   │   ├── job-seeker-dashboard.tsx
    │   │   │   └── employer-dashboard.tsx
    │   │   ├── employer/             # Employer features
    │   │   │   ├── post-job.tsx
    │   │   │   ├── manage-jobs.tsx
    │   │   │   ├── applications.tsx
    │   │   │   └── analytics.tsx
    │   │   ├── profile/              # Profile management
    │   │   ├── index.tsx             # Home screen
    │   │   ├── find-jobs.tsx         # Job search
    │   │   ├── job-scraper.tsx       # Job scraping UI
    │   │   ├── job-details.tsx       # Job details view
    │   │   ├── apply-job.tsx         # Job application
    │   │   ├── resume-builder.tsx    # Resume creation
    │   │   ├── resume-dashboard.tsx  # Resume management
    │   │   ├── interview-bot.tsx     # AI interview prep
    │   │   ├── mcq-setup.tsx         # MCQ quiz setup
    │   │   ├── mcq-quiz.tsx          # MCQ quiz
    │   │   ├── career-path.tsx       # Career guidance
    │   │   ├── skills-training.tsx   # Training recommendations
    │   │   ├── profile-setup.tsx     # Profile setup wizard
    │   │   └── _layout.tsx           # Tab layout
    │   └── modal.tsx                 # Modal screens
    │
    ├── backend/                      # Backend services
    │   ├── ml_service/               # 🆕 ML Service (Port 8001)
    │   │   ├── api/
    │   │   │   ├── __init__.py
    │   │   │   └── ml_server.py      # FastAPI ML server
    │   │   ├── data/
    │   │   │   └── career_skills_dataset.json  # Training data
    │   │   ├── models/               # Trained models (gitignored)
    │   │   │   ├── vectorizer.pkl
    │   │   │   ├── skill_vectors.pkl
    │   │   │   └── career_data.pkl
    │   │   ├── utils/
    │   │   │   ├── __init__.py
    │   │   │   ├── helpers.py        # Utility functions
    │   │   │   └── course_recommender.py  # Course recommendations
    │   │   ├── __init__.py
    │   │   ├── train_model.py        # Model training script
    │   │   ├── test_enhanced_api.py  # API testing
    │   │   ├── requirements.txt      # Python dependencies
    │   │   ├── start_ml_service.bat  # Quick start (Windows)
    │   │   └── .gitignore
    │   │
    │   ├── passwordReset.js          # OTP service (Port 5001)
    │   ├── send_candidate_email.js   # Email service (Port 5000)
    │   ├── sendResumeEmail.js        # Resume email (Port 5002)
    │   ├── main.py                   # Job scraping (Port 8000)
    │   ├── package.json              # Node.js dependencies
    │   ├── requirements.txt          # Python dependencies
    │   ├── start-all-services.bat    # Start all services (Windows)
    │   ├── .env.example              # Environment template
    │   └── .env                      # Environment variables (gitignored)
    │
    ├── components/                   # Reusable UI components
    │   ├── Header.tsx
    │   ├── ToastNotification.tsx
    │   ├── ConfirmationModal.tsx
    │   ├── EmailCompositionModal.tsx
    │   ├── ShareResumeModal.tsx
    │   ├── themed-text.tsx
    │   ├── themed-view.tsx
    │   ├── find-jobs/
    │   │   └── JobCard.tsx
    │   ├── profile-setup/
    │   │   ├── EducationStep.tsx
    │   │   ├── ExperienceStep.tsx
    │   │   ├── CertificationsStep.tsx
    │   │   ├── JobPreferencesStep.tsx
    │   │   └── index.ts
    │   └── resume/
    │       ├── form-components/
    │       │   ├── PersonalInfo.tsx
    │       │   ├── Summary.tsx
    │       │   ├── Experience.tsx
    │       │   ├── Education.tsx
    │       │   ├── Skills.tsx
    │       │   └── Projects.tsx
    │       ├── preview/
    │       │   └── ResumePreview.tsx
    │       ├── RichTextEditor.tsx
    │       ├── RichTextToolbar.tsx
    │       └── index.ts
    │
    ├── lib/                          # Core utilities and services
    │   ├── ai/                       # AI services
    │   │   ├── aiModel.ts            # Gemini AI integration
    │   │   ├── aiJobButton.ts
    │   │   ├── recommendTrainingAI.ts
    │   │   └── index.ts
    │   ├── services/                 # API services
    │   │   ├── career-path-api.ts    # 🆕 ML career prediction
    │   │   ├── training-recommendations-api.ts  # 🆕 Course recommendations
    │   │   ├── jobScrapperService.ts # Job scraping client
    │   │   ├── employer-services.ts  # Employer API
    │   │   ├── backend-api.ts        # Backend integration
    │   │   └── resume-pdf-service.ts # PDF generation
    │   ├── resume/                   # Resume management
    │   │   ├── resumeContext.tsx
    │   │   ├── resumeAPI.ts
    │   │   └── index.ts
    │   ├── utils/                    # Utility functions
    │   │   └── password-validation.ts
    │   ├── firebase.ts               # Firebase config
    │   ├── auth-context.tsx          # Auth state management
    │   ├── ToastContext.tsx          # Toast notifications
    │   ├── notification-context.tsx  # Notification system
    │   ├── store.ts                  # Global state
    │   └── employer-protection.tsx   # Role protection
    │
    ├── hooks/                        # Custom React hooks
    │   ├── use-color-scheme.ts
    │   ├── use-theme-color.ts
    │   └── use-logout.ts
    │
    ├── constants/                    # App constants
    │   └── theme.ts                  # Theme configuration
    │
    ├── assets/                       # Static assets
    │   └── images/
    │       ├── icon.png
    │       ├── splash-icon.png
    │       └── white-logo-noBG.png
    │
    ├── app.json                      # Expo configuration
    ├── package.json                  # Dependencies
    ├── tsconfig.json                 # TypeScript config
    ├── babel.config.js               # Babel configuration
    ├── metro.config.js               # Metro bundler config
    ├── .gitignore                    # Git ignore rules
    └── README.md                     # This file
```

---

## 🎯 API Endpoints

### **ML Service** (Port 8001)

#### **Career Prediction**
```http
POST http://localhost:8001/api/predict-career-paths
Content-Type: application/json

{
  "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
  "top_n": 5
}

Response:
{
  "success": true,
  "career_paths": [
    {
      "id": 1,
      "title": "Full Stack Developer",
      "description": "Develop both client and server-side applications...",
      "match_score": 0.92,
      "confidence": "high"
    }
  ],
  "user_skills": ["JavaScript", "React", "Node.js", "MongoDB"]
}
```

#### **Training Recommendations**
```http
POST http://localhost:8001/api/recommend-training
Content-Type: application/json

{
  "skills": ["Python", "Machine Learning"],
  "job_title": "Data Scientist",
  "top_n": 3
}

Response:
{
  "success": true,
  "training_recommendations": [
    {
      "id": 1,
      "title": "Data Scientist",
      "courses": [
        {
          "platform": "Coursera",
          "name": "IBM Data Science Professional Certificate",
          "link": "https://www.coursera.org/...",
          "description": "Master data science with Python, SQL, ML..."
        }
      ]
    }
  ]
}
```

#### **Health Check**
```http
GET http://localhost:8001/health

Response:
{
  "status": "healthy",
  "model_loaded": true,
  "message": "Model loaded and ready"
}
```

#### **Interactive Documentation**
```
http://localhost:8001/docs  (Swagger UI)
http://localhost:8001/redoc (ReDoc)
```

---

### **Email Services**

#### **Send OTP** (Port 5001)
```http
POST http://localhost:5001/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### **Verify OTP** (Port 5001)
```http
POST http://localhost:5001/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### **Send Candidate Email** (Port 5000)
```http
POST http://localhost:5000/send-email
Content-Type: application/json

{
  "to": "candidate@example.com",
  "candidateName": "John Doe",
  "jobTitle": "Software Engineer",
  "companyName": "Tech Corp",
  "emailType": "shortlisting"
}
```

#### **Share Resume** (Port 5002)
```http
POST http://localhost:5002/share-resume
Content-Type: multipart/form-data

{
  "to": "employer@example.com",
  "subject": "Resume - John Doe",
  "message": "Please find my resume attached",
  "pdf": <file>
}
```

---

### **Job Scraping** (Port 8000)

```http
POST http://localhost:8000/api/scrape-jobs
Content-Type: application/json

{
  "site_name": ["linkedin", "indeed"],
  "search_term": "Software Engineer",
  "location": "New York",
  "results_wanted": 20,
  "country_indeed": "USA"
}

Response:
{
  "jobs": [
    {
      "title": "Senior Software Engineer",
      "company": "Google",
      "location": "New York, NY",
      "description": "...",
      "salary": "$120,000 - $180,000",
      "job_url": "https://...",
      "site": "linkedin",
      "type": "Full Time"
    }
  ]
}
```

---

## 📸 Screenshots

### Job Seeker Features
- 🏠 **Home Dashboard**: Analytics and quick actions
- 🔍 **Job Search**: Advanced filtering and search
- 🌐 **Job Scraper**: LinkedIn & Indeed scraping
- 📄 **Resume Builder**: Professional resume creation
- 📊 **Resume Dashboard**: Multi-resume management
- 🎤 **Interview Prep**: AI-powered mock interviews
- 📝 **MCQ Quiz**: Adaptive practice questions
- 🗺️ **Career Path**: ML-powered career predictions
- 📚 **Skills Training**: Course recommendations

### Employer Features
- 📊 **Employer Dashboard**: Real-time analytics
- 📝 **Post Job**: Create job listings
- 🔧 **Manage Jobs**: Edit and manage postings
- 📥 **Applications**: Review candidate applications
- 📧 **Email Candidates**: Professional communication

*(Add screenshots by placing images in `assets/screenshots/` and linking here)*

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/AmazingFeature`
3. **Commit your changes**: `git commit -m 'Add some AmazingFeature'`
4. **Push to the branch**: `git push origin feature/AmazingFeature`
5. **Open a Pull Request**

### Contribution Guidelines

- Follow TypeScript/Python best practices
- Write clean, documented code
- Test your changes thoroughly
- Update documentation as needed
- Follow existing code style

---

## 🐛 Known Issues & Troubleshooting

### ML Service Issues

**Problem**: ML service fails to start  
**Solution**: Ensure all dependencies are installed: `pip install -r backend/ml_service/requirements.txt`

**Problem**: Model not found error  
**Solution**: Train the model first: `python backend/ml_service/train_model.py`

### Email Service Issues

**Problem**: Emails not sending  
**Solution**: 
- Use Gmail App Password, not regular password
- Enable "Less secure app access" or use OAuth2
- Check .env configuration

### Job Scraping Issues

**Problem**: Scraping returns empty results  
**Solution**: 
- Check internet connection
- LinkedIn/Indeed may block frequent requests
- Use mock data fallback for testing

---

## 🔮 Future Enhancements

- 🤖 **Deep Learning Models**: Neural networks for better predictions
- 🌐 **More Job Platforms**: Glassdoor, Monster, ZipRecruiter
- 📱 **Offline Mode**: Offline ML inference and data caching
- 🎓 **Learning Paths**: Personalized learning roadmaps
- 🔔 **Push Notifications**: Real-time job alerts
- 📊 **Advanced Analytics**: Detailed performance insights
- 🌍 **Multi-language**: Internationalization support
- 💬 **Chat System**: Real-time employer-candidate chat
- 📹 **Video Interviews**: In-app video interviewing
- 🎯 **Skill Assessments**: Automated coding challenges

---

## 👨‍💻 Author

**Muhammad Shaheer Malik**

- 🌐 **Portfolio**: [shaheer-portfolio-omega.vercel.app](https://shaheer-portfolio-omega.vercel.app)
- 💼 **LinkedIn**: [linkedin.com/in/malik-shaheer03](https://linkedin.com/in/malik-shaheer03)
- 🐙 **GitHub**: [github.com/malik-shaheer03](https://github.com/malik-shaheer03)
- 📸 **Instagram**: [instagram.com/malik_shaheer03](https://instagram.com/malik_shaheer03)
- 📧 **Email**: [shaheermalik03@gmail.com](mailto:shaheermalik03@gmail.com)

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ Commercial use
- ✅ Modification
- ✅ Distribution
- ✅ Private use
- ⚠️ Liability
- ⚠️ Warranty

---

## 🙏 Acknowledgments

- **React Native Team**: For the amazing framework
- **Expo Team**: For excellent development tools
- **Firebase**: For backend infrastructure
- **Google AI**: For Gemini API access
- **scikit-learn**: For ML algorithms
- **FastAPI**: For high-performance API framework
- **Open Source Community**: For all the amazing libraries

---

## 📊 Project Stats

- **Lines of Code**: 50,000+
- **Components**: 100+
- **API Endpoints**: 20+
- **Backend Services**: 5
- **ML Career Paths**: 21
- **Training Courses**: 130+
- **Skill Vocabulary**: 500+
- **Development Time**: 6+ months
- **Technologies Used**: 15+

---

<div align="center">

### ⭐ Star this repository if you found it helpful!

**Built with ❤️ using React Native, Python ML, and modern technologies**

**🚀 Revolutionizing career development with Machine Learning and AI!**

---

**CareerCatalyst** © 2025 Muhammad Shaheer Malik. All Rights Reserved.

[⬆ Back to Top](#-careercatalyst---ai-powered-career-development-platform)

</div>

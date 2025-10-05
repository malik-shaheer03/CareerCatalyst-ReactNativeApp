import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { doc, setDoc, getDoc, serverTimestamp, collection } from 'firebase/firestore';
import { useAuth } from '@/lib/auth-context';
import { db } from '@/lib/firebase';
import { EducationStep, ExperienceStep, CertificationsStep, JobPreferencesStep } from '@/components/profile-setup';

const { width, height } = Dimensions.get('window');

interface FormData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  desiredJobTitle: string;
  jobType: string;
  workEnvironment: string;
  salaryMin: string;
  salaryMax: string;
  availability: string;
  skills: string[];
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

const steps = ['Personal Info', 'Education', 'Experience', 'Certifications', 'Job Preferences'];

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    jobTitle: '',
    email: currentUser?.email || '',
    phone: '',
    location: '',
    summary: '',
    education: [],
    experience: [],
    certifications: [],
    desiredJobTitle: '',
    jobType: '',
    workEnvironment: '',
    salaryMin: '',
    salaryMax: '',
    availability: '',
    skills: []
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        if (!currentUser) return;
        const employeeDataRef = doc(collection(db, 'employees', currentUser.uid, 'employee data'), 'profile');
        const docSnap = await getDoc(employeeDataRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            fullName: data.personalInfo?.fullName || '',
            jobTitle: data.personalInfo?.jobTitle || '',
            email: data.personalInfo?.email || currentUser.email || '',
            phone: data.personalInfo?.phone || '',
            location: data.personalInfo?.location || '',
            summary: data.personalInfo?.summary || '',
            education: data.education || [],
            experience: data.experience || [],
            certifications: data.certifications || [],
            desiredJobTitle: data.jobPreferences?.desiredJobTitle || '',
            jobType: data.jobPreferences?.jobType || '',
            workEnvironment: data.jobPreferences?.workEnvironment || '',
            salaryMin: data.jobPreferences?.salaryMin || '',
            salaryMax: data.jobPreferences?.salaryMax || '',
            availability: data.jobPreferences?.availability || '',
            skills: data.skills || []
          });
        }
      } catch (error) {
        setError('Failed to load profile data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    loadProfileData();
  }, [currentUser]);

  const updateForm = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNext = () => {
    if (activeStep === 0 && (!formData.fullName || !formData.jobTitle || !formData.email)) {
      setError('Please fill in all required fields (Name, Job Title, Email)');
      return;
    }
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      if (!currentUser) throw new Error('No authenticated user found');
      
      const userProfile = {
        personalInfo: {
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          summary: formData.summary
        },
        education: formData.education || [],
        experience: formData.experience || [],
        certifications: formData.certifications || [],
        jobPreferences: {
          desiredJobTitle: formData.desiredJobTitle,
          jobType: formData.jobType,
          workEnvironment: formData.workEnvironment,
          salaryMin: formData.salaryMin,
          salaryMax: formData.salaryMax,
          availability: formData.availability
        },
        skills: formData.skills || [],
        metadata: {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          profileComplete: true
        }
      };

      const basicUserInfo = {
        displayName: formData.fullName,
        email: formData.email,
        jobTitle: formData.jobTitle,
        profileComplete: true,
        lastUpdated: serverTimestamp()
      };

      const userDocRef = doc(db, 'employees', currentUser.uid);
      await setDoc(userDocRef, basicUserInfo, { merge: true });
      const employeeDataRef = doc(collection(db, 'employees', currentUser.uid, 'employee data'), 'profile');
      await setDoc(employeeDataRef, userProfile, { merge: true });

      setSuccess(true);
      console.log('🔄 Profile setup complete, redirecting to user dashboard');
      setTimeout(() => {
        router.replace('/(tabs)/dashboards/user-dashboard');
      }, 1500);

    } catch (error) {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#004D40', '#00A389', '#26A69A']}
        style={styles.gradientContainer}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#004D40', '#00A389', '#26A69A']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Set Up Your Profile</Text>
              <Text style={styles.subtitle}>Complete your profile to get started</Text>
            </View>

            {/* Progress Steps */}
            <View style={styles.stepsContainer}>
              {steps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <View style={[
                    styles.stepCircle,
                    index <= activeStep && styles.stepCircleActive
                  ]}>
                    <Text style={[
                      styles.stepNumber,
                      index <= activeStep && styles.stepNumberActive
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    index <= activeStep && styles.stepLabelActive
                  ]}>
                    {step}
                  </Text>
                </View>
              ))}
            </View>

            {/* Error/Success Messages */}
            {error && (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {success && (
              <View style={styles.successContainer}>
                <Icon name="check-circle" size={20} color="#00A389" />
                <Text style={styles.successText}>Profile saved successfully! Redirecting...</Text>
              </View>
            )}

            {/* Form Content */}
            <View style={styles.formContainer}>
              {getStepContent(activeStep, formData, updateForm)}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <TouchableOpacity
                style={[styles.navButton, styles.backButton, activeStep === 0 && styles.buttonDisabled]}
                onPress={handleBack}
                disabled={activeStep === 0 || saving}
              >
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              {activeStep === steps.length - 1 ? (
                <TouchableOpacity
                  style={[styles.navButton, styles.submitButton, saving && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Icon name="check" size={20} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Complete Profile</Text>
                    </>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.navButton, styles.nextButton, saving && styles.buttonDisabled]}
                  onPress={handleNext}
                  disabled={saving}
                >
                  <Text style={styles.nextButtonText}>Next</Text>
                  <Icon name="arrow-right" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Step Content Components
const PersonalInfoStep = ({ formData, updateForm }: { formData: FormData, updateForm: (field: keyof FormData, value: any) => void }) => (
  <View style={styles.stepContent}>
    <Text style={styles.stepTitle}>Personal Information</Text>
    
    <View style={styles.inputRow}>
      <View style={styles.inputHalf}>
        <Text style={styles.fieldLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="John Doe"
          value={formData.fullName}
          onChangeText={(text) => updateForm('fullName', text)}
        />
      </View>
      <View style={styles.inputHalf}>
        <Text style={styles.fieldLabel}>Job Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Software Engineer"
          value={formData.jobTitle}
          onChangeText={(text) => updateForm('jobTitle', text)}
        />
      </View>
    </View>

    <View style={styles.inputRow}>
      <View style={styles.inputHalf}>
        <Text style={styles.fieldLabel}>Email *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="john@example.com"
          value={formData.email}
          onChangeText={(text) => updateForm('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputHalf}>
        <Text style={styles.fieldLabel}>Phone</Text>
        <TextInput
          style={styles.textInput}
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChangeText={(text) => updateForm('phone', text)}
          keyboardType="phone-pad"
        />
      </View>
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.fieldLabel}>Location</Text>
      <TextInput
        style={styles.textInput}
        placeholder="City, Country"
        value={formData.location}
        onChangeText={(text) => updateForm('location', text)}
      />
    </View>

    <View style={styles.inputContainer}>
      <Text style={styles.fieldLabel}>Professional Summary</Text>
      <TextInput
        style={[styles.textInput, styles.textArea]}
        placeholder="Brief overview of your professional background and career goals..."
        value={formData.summary}
        onChangeText={(text) => updateForm('summary', text)}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  </View>
);

const getStepContent = (step: number, formData: FormData, updateForm: (field: keyof FormData, value: any) => void) => {
  switch (step) {
    case 0:
      return <PersonalInfoStep formData={formData} updateForm={updateForm} />;
    case 1:
      return <EducationStepWrapper formData={formData} updateForm={updateForm} />;
    case 2:
      return <ExperienceStepWrapper formData={formData} updateForm={updateForm} />;
    case 3:
      return <CertificationsStepWrapper formData={formData} updateForm={updateForm} />;
    case 4:
      return <JobPreferencesStepWrapper formData={formData} updateForm={updateForm} />;
    default:
      return null;
  }
};

// Step wrapper components
const EducationStepWrapper = ({ formData, updateForm }: { formData: FormData, updateForm: (field: keyof FormData, value: any) => void }) => (
  <View style={styles.stepContent}>
    <EducationStep formData={formData} updateForm={updateForm as any} />
  </View>
);

const ExperienceStepWrapper = ({ formData, updateForm }: { formData: FormData, updateForm: (field: keyof FormData, value: any) => void }) => (
  <View style={styles.stepContent}>
    <ExperienceStep formData={formData} updateForm={updateForm as any} />
  </View>
);

const CertificationsStepWrapper = ({ formData, updateForm }: { formData: FormData, updateForm: (field: keyof FormData, value: any) => void }) => (
  <View style={styles.stepContent}>
    <CertificationsStep formData={formData} updateForm={updateForm as any} />
  </View>
);

const JobPreferencesStepWrapper = ({ formData, updateForm }: { formData: FormData, updateForm: (field: keyof FormData, value: any) => void }) => (
  <View style={styles.stepContent}>
    <JobPreferencesStep formData={formData} updateForm={updateForm as any} />
  </View>
);

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#00A389',
  },
  stepNumber: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  stepLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 163, 137, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 163, 137, 0.3)',
  },
  successText: {
    color: '#00A389',
    marginLeft: 8,
    flex: 1,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    minHeight: 500,
    maxHeight: height * 0.65,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputHalf: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    justifyContent: 'center',
  },
  backButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  nextButton: {
    backgroundColor: '#00A389',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#00A389',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

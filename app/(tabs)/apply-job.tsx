import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth-context';
import { db } from '../../lib/firebase';
import { hasUserAppliedToJob, submitApplication } from '../../lib/services/job-seeker-services';
import { useToast } from '../../lib/ToastContext';
import { ResumeAIService } from '../../lib/ai/aiModel';

interface ApplicationData {
  jobId: string;
  jobTitle: string;
  company: string;
  applicantName: string;
  email: string;
  phone: string;
  coverLetter: string;
}

export default function ApplyJobScreen() {
  const router = useRouter();
  const { jobId, jobTitle, company, jobData } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false);
  const [generatedCoverLetters, setGeneratedCoverLetters] = useState<string[]>([]);
  const [showCoverLetterModal, setShowCoverLetterModal] = useState(false);
  const [formData, setFormData] = useState<ApplicationData>({
    jobId: jobId as string,
    jobTitle: jobTitle as string,
    company: company as string,
    applicantName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });

  // Swipe gesture handler for right swipe to navigate back to job-details
  const panResponder = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          // Only respond to horizontal swipes to the right
          return gestureState.dx > 20 && Math.abs(gestureState.dy) < 80;
        },
        onPanResponderRelease: (evt, gestureState) => {
          // If swipe is significant enough (more than 100 pixels to the right)
          console.log('Apply-job swipe detected:', gestureState.dx);
          if (gestureState.dx > 100) {
            console.log('Navigating back to job-details');
            if (jobData) {
              router.push({
                pathname: '/(tabs)/job-details',
                params: { jobId: jobId as string, jobData: jobData as string }
              });
            }
          }
        },
      }),
    [router, jobId, jobData]
  );

  useEffect(() => {
    // Fetch user profile data from Firestore
    const loadUserProfileData = async () => {
      if (!currentUser) return;
      
      try {
        console.log('Fetching user profile for:', currentUser.uid);
        
        // Fetch from employee data collection
        const employeeDataRef = doc(collection(db, 'employees', currentUser.uid, 'employee data'), 'profile');
        const docSnap = await getDoc(employeeDataRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log('Profile data found:', data);
          
          setFormData(prev => ({
            ...prev,
            applicantName: data.personalInfo?.fullName || currentUser.displayName || '',
            email: currentUser.email || data.personalInfo?.email || '',
            phone: data.personalInfo?.phone || '',
          }));
        } else {
          console.log('No profile data found, using default values');
          // Fallback to basic user data if profile doesn't exist
          setFormData(prev => ({
            ...prev,
            email: currentUser.email || '',
            applicantName: currentUser.displayName || '',
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback to basic user data on error
        setFormData(prev => ({
          ...prev,
          email: currentUser.email || '',
          applicantName: currentUser.displayName || '',
        }));
      }
    };

    loadUserProfileData();
  }, [currentUser]);

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Generate cover letter with AI
  const handleGenerateCoverLetter = async () => {
    console.log('[ApplyJob] Generate cover letter clicked');
    
    if (!jobTitle || !company) {
      showError('Job information is missing. Cannot generate cover letter.');
      return;
    }

    try {
      setIsGeneratingCoverLetter(true);
      console.log('[ApplyJob] Calling AI service to generate cover letter for:', jobTitle, 'at', company);
      
      const coverLetters = await ResumeAIService.generateCoverLetter(
        jobTitle as string,
        company as string
      );
      
      console.log('[ApplyJob] Generated', coverLetters.length, 'cover letters');
      setGeneratedCoverLetters(coverLetters);
      setShowCoverLetterModal(true);
      
    } catch (error) {
      console.error('[ApplyJob] Error generating cover letter:', error);
      showError(error instanceof Error ? error.message : 'Failed to generate cover letter. Please try again.');
    } finally {
      setIsGeneratingCoverLetter(false);
    }
  };

  // Select a generated cover letter
  const selectCoverLetter = (letter: string) => {
    setFormData(prev => ({
      ...prev,
      coverLetter: letter,
    }));
    setShowCoverLetterModal(false);
    showSuccess('Cover letter applied successfully!');
  };

  const validateForm = () => {
    const required = ['applicantName', 'email', 'phone', 'coverLetter'];
    
    for (const field of required) {
      if (!formData[field as keyof ApplicationData]) {
        showError(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError('Please enter a valid email address');
      return false;
    }

    // Phone validation (basic)
    if (formData.phone.length < 10) {
      showError('Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmitApplication = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Check if user has already applied
      const alreadyApplied = await hasUserAppliedToJob(formData.jobId);
      if (alreadyApplied) {
        showError('You have already applied to this job.');
        setLoading(false);
        return;
      }

      // Submit application to Firestore
      const applicationId = await submitApplication({
        jobId: formData.jobId,
        coverLetter: formData.coverLetter,
        email: formData.email,
        phone: formData.phone,
      });
      
      console.log('✅ Application submitted with ID:', applicationId);
      showSuccess(`🎉 Application submitted successfully for ${jobTitle}!`);
      
      // Navigate back to find-jobs page
      setTimeout(() => {
        router.replace('/(tabs)/find-jobs');
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      showError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modern Header with Curved Bottom */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (jobData) {
                  router.push({
                    pathname: '/(tabs)/job-details',
                    params: { jobId: jobId as string, jobData: jobData as string }
                  });
                } else {
                  router.back();
                }
              }}
            >
              <Icon name="arrow-back" size={24} color="#00A389" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerSubtitle}>Application Form</Text>
              <Text style={styles.headerTitle}>Apply Now</Text>
            </View>
            <View style={styles.headerPlaceholder} />
          </View>
        </View>

        {/* Job Info Card */}
        <View style={styles.jobInfoCard}>
          <View style={styles.jobIconContainer}>
            <Icon name="work" size={28} color="#00A389" />
          </View>
          <View style={styles.jobDetails}>
            <Text style={styles.jobTitle} numberOfLines={2}>{jobTitle}</Text>
            <View style={styles.companyRow}>
              <Icon name="business" size={14} color="#00A389" />
              <Text style={styles.companyName}>{company}</Text>
            </View>
          </View>
          <View style={styles.jobBadge}>
            <Icon name="send" size={16} color="#00A389" />
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Personal Information Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="person" size={22} color="#00A389" />
                <Text style={styles.sectionTitle}>Personal Information</Text>
              </View>
              
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="badge" size={14} color="#6B7280" /> Full Name *
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.applicantName}
                    onChangeText={(value) => handleInputChange('applicantName', value)}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="email" size={14} color="#6B7280" /> Email Address *
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="email" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Phone */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  <Icon name="phone" size={14} color="#6B7280" /> Phone Number *
                </Text>
                <View style={styles.inputWrapper}>
                  <Icon name="phone" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </View>

            {/* Cover Letter Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Icon name="description" size={22} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Cover Letter</Text>
              </View>
              
              <View style={styles.inputGroup}>
                <View style={styles.coverLetterHeader}>
                  <Text style={styles.helperText}>
                    Tell us why you're the perfect fit for this role. Highlight your relevant experience and enthusiasm.
                  </Text>
                  <TouchableOpacity
                    style={[styles.aiButton, isGeneratingCoverLetter && styles.aiButtonDisabled]}
                    onPress={handleGenerateCoverLetter}
                    disabled={isGeneratingCoverLetter}
                  >
                    {isGeneratingCoverLetter ? (
                      <>
                        <ActivityIndicator size="small" color="#FFF" />
                        <Text style={styles.aiButtonText}>Generating...</Text>
                      </>
                    ) : (
                      <>
                        <Icon name="auto-awesome" size={18} color="#FFF" />
                        <Text style={styles.aiButtonText}>Generate with AI</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <View style={styles.textAreaWrapper}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={formData.coverLetter}
                    onChangeText={(value) => handleInputChange('coverLetter', value)}
                    placeholder="Write your cover letter here..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                  <View style={styles.characterCount}>
                    <Text style={styles.characterCountText}>
                      {formData.coverLetter.length} characters
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Application Tips */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <View style={styles.tipsIconContainer}>
                  <Icon name="lightbulb" size={20} color="#F59E0B" />
                </View>
                <Text style={styles.tipsTitle}>Pro Tips for Your Application</Text>
              </View>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>Customize your cover letter for this specific role</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>Highlight relevant experience and achievements</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>Show genuine interest in the company</Text>
                </View>
                <View style={styles.tipItem}>
                  <View style={styles.tipBullet} />
                  <Text style={styles.tipText}>Keep it concise yet impactful</Text>
                </View>
              </View>
            </View>

            {/* Extra padding for submit button */}
            <View style={{ height: 140 }} />
          </View>
        </ScrollView>

        {/* Modern Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitApplication}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="send" size={22} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Application</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  headerPlaceholder: {
    width: 40,
  },
  jobInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  jobIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  jobDetails: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  companyName: {
    fontSize: 14,
    color: '#00A389',
    fontWeight: '600',
  },
  jobBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  helperText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  coverLetterHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 160,
    justifyContent: 'center',
  },
  aiButtonDisabled: {
    opacity: 0.6,
  },
  aiButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#374151',
  },
  textAreaWrapper: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 160,
    paddingTop: 14,
    paddingHorizontal: 14,
  },
  characterCount: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  characterCountText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
    flex: 1,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 20,
    flex: 1,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: '#00A389',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
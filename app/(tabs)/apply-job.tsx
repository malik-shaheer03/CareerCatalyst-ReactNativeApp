import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/ToastContext';
import { submitApplication, hasUserAppliedToJob } from '../../lib/services/job-seeker-services';

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
  const [formData, setFormData] = useState<ApplicationData>({
    jobId: jobId as string,
    jobTitle: jobTitle as string,
    company: company as string,
    applicantName: '',
    email: '',
    phone: '',
    coverLetter: '',
  });

  useEffect(() => {
    // Pre-fill user data if available
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        email: currentUser.email || '',
        applicantName: currentUser.displayName || '',
      }));
    }
  }, [currentUser]);

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
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
            <Icon name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Apply for Job</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Job Info */}
        <View style={styles.jobInfo}>
          <View style={styles.jobIconContainer}>
            <Icon name="work" size={24} color="#00A389" />
          </View>
          <View style={styles.jobDetails}>
            <Text style={styles.jobTitle} numberOfLines={2}>{jobTitle}</Text>
            <Text style={styles.companyName}>{company}</Text>
          </View>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Application Details</Text>
            
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.applicantName}
                onChangeText={(value) => handleInputChange('applicantName', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            {/* Cover Letter */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cover Letter *</Text>
              <Text style={styles.helperText}>
                Tell us why you're interested in this role and what makes you a great fit.
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.coverLetter}
                onChangeText={(value) => handleInputChange('coverLetter', value)}
                placeholder="Write your cover letter..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Application Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Icon name="lightbulb" size={20} color="#F59E0B" />
                <Text style={styles.tipsTitle}>Application Tips</Text>
              </View>
              <Text style={styles.tipsText}>
                • Customize your cover letter for this specific role{'\n'}
                • Highlight relevant experience and skills{'\n'}
                • Mention why you're interested in this company{'\n'}
                • Keep it concise but compelling
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
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
                <Icon name="send" size={20} color="#FFFFFF" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  jobIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobDetails: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  companyName: {
    fontSize: 14,
    color: '#00A389',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Add padding to avoid tab bar overlap
  },
  formContainer: {
    padding: 20,
    paddingBottom: 120, // Extra padding to ensure content is above submit button and tab bar
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  tipsContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  tipsText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 80, // Position above tab bar (tab bar is usually 60-80px high)
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  submitButton: {
    backgroundColor: '#00A389',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';
import { postJob, updateJob, getEmployerCompanyName } from '../../../lib/services/employer-services';
import { useToast } from '../../../lib/ToastContext';
import { withEmployerProtection } from '../../../lib/employer-protection';

interface JobFormData {
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
}

function PostJobScreen() {
  const router = useRouter();
  const { editJobId, editJobData } = useLocalSearchParams();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    company: '',
    location: '',
    type: 'Full-time',
    experience: 'Entry Level',
    salary: '',
    description: '',
    requirements: '',
    benefits: '',
  });

  // Load company name and edit data when component mounts
  useEffect(() => {
    loadInitialData();
  }, [editJobId, editJobData]);

  const loadInitialData = async () => {
    try {
      // Check if we're in edit mode
      if (editJobId && editJobData && typeof editJobData === 'string') {
        console.log('🔧 Edit mode detected for job:', editJobId);
        setIsEditMode(true);
        
        const jobData = JSON.parse(editJobData);
        setFormData({
          title: jobData.title || '',
          company: jobData.company || '',
          location: jobData.location || '',
          type: jobData.type || 'Full-time',
          experience: jobData.experience || 'Entry Level',
          salary: jobData.salary || '',
          description: jobData.description || '',
          requirements: typeof jobData.requirements === 'string' ? jobData.requirements : jobData.requirements?.join(', ') || '',
          benefits: typeof jobData.benefits === 'string' ? jobData.benefits : jobData.benefits?.join(', ') || '',
        });
      } else {
        // Load company name for new job posting
        const companyName = await getEmployerCompanyName();
        setFormData(prev => ({
          ...prev,
          company: companyName
        }));
      }
    } catch (error) {
      console.log('Could not load initial data:', error);
      showError('Failed to load job data');
    }
  };

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
  const experienceLevels = ['Entry Level', '1-3 years', '3-5 years', '5+ years', 'Senior'];

  const handleInputChange = (field: keyof JobFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['title', 'company', 'description']; // Simplified - just these 3 fields
    for (const field of required) {
      if (!formData[field as keyof JobFormData]) {
        Alert.alert('Validation Error', `${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        return false;
      }
    }
    return true;
  };

  const handlePostJob = async () => {
    console.log(`🔵 ${isEditMode ? 'Update' : 'Post'} job button clicked`);
    console.log('📝 Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log(`✅ Form validation passed, starting job ${isEditMode ? 'update' : 'posting'}...`);
    setLoading(true);
    
    try {
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location || 'Not specified',
        type: formData.type,
        experience: formData.experience,
        salary: formData.salary || 'Competitive',
        description: formData.description,
        requirements: formData.requirements || 'No specific requirements',
        benefits: formData.benefits || 'Standard benefits',
      };

      if (isEditMode && editJobId) {
        // Update existing job
        console.log('🔄 Calling updateJob service...');
        await updateJob(editJobId as string, jobData);
        
        console.log('✅ Job updated successfully');
        showSuccess('🎉 Job updated successfully!', 4000);
        
        // Navigate back to manage jobs
        setTimeout(() => {
          router.push('/(tabs)/employer/manage-jobs');
        }, 1500);
      } else {
        // Create new job
        console.log('🔄 Calling postJob service...');
        const jobId = await postJob(jobData);
        
        console.log('✅ Job posted successfully with ID:', jobId);
        showSuccess('🎉 Job posted successfully! It will now appear in the job seeker feed.', 4000);
        
        // Reset form for new job
        setFormData({
          title: '',
          company: formData.company, // Keep company name
          location: '',
          type: 'Full-time',
          experience: 'Entry Level',
          salary: '',
          description: '',
          requirements: '',
          benefits: '',
        });
        
        // Navigate to manage jobs after a short delay
        setTimeout(() => {
          router.push('/(tabs)/employer/manage-jobs');
        }, 1500);
      }
      
    } catch (error) {
      console.error('❌ Error posting job:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to post job. Please try again.';
      console.error('Error details:', errorMessage);
      showError(`Failed to post job: ${errorMessage}`);
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
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>{isEditMode ? 'Edit Job' : 'Post a Job'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {/* Job Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(value) => handleInputChange('title', value)}
                placeholder="e.g. Software Engineer"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Company */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company *</Text>
              <TextInput
                style={styles.input}
                value={formData.company}
                onChangeText={(value) => handleInputChange('company', value)}
                placeholder="e.g. Tech Corp"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="e.g. New York, NY"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Job Type */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {jobTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.chip,
                        formData.type === type && styles.chipSelected
                      ]}
                      onPress={() => handleInputChange('type', type)}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.type === type && styles.chipTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Experience Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Experience Level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipContainer}>
                  {experienceLevels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.chip,
                        formData.experience === level && styles.chipSelected
                      ]}
                      onPress={() => handleInputChange('experience', level)}
                    >
                      <Text style={[
                        styles.chipText,
                        formData.experience === level && styles.chipTextSelected
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Salary */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Salary Range</Text>
              <TextInput
                style={styles.input}
                value={formData.salary}
                onChangeText={(value) => handleInputChange('salary', value)}
                placeholder="e.g. $50,000 - $80,000"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Job Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Requirements */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Requirements</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.requirements}
                onChangeText={(value) => handleInputChange('requirements', value)}
                placeholder="List the required skills, qualifications, and experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Benefits */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Benefits</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.benefits}
                onChangeText={(value) => handleInputChange('benefits', value)}
                placeholder="Health insurance, 401k, flexible hours, etc..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Post Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.postButton, loading && styles.postButtonDisabled]}
            onPress={handlePostJob}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Icon name={isEditMode ? "edit" : "work"} size={20} color="#FFFFFF" />
                <Text style={styles.postButtonText}>{isEditMode ? 'Update Job' : 'Post Job'}</Text>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  chipSelected: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 100, // Account for tab bar height + extra space
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  postButton: {
    backgroundColor: '#00A389',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  debugButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});

export default withEmployerProtection(PostJobScreen);

import { useLocalSearchParams, useRouter } from 'expo-router';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../../lib/auth-context';
import { withEmployerProtection } from '../../../lib/employer-protection';
import { getEmployerCompanyName, postJob, updateJob } from '../../../lib/services/employer-services';
import { useToast } from '../../../lib/ToastContext';

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

  // Swipe gesture handler for right swipe to navigate back to manage-jobs
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
          console.log('Post-job swipe detected:', gestureState.dx);
          if (gestureState.dx > 100) {
            console.log('Navigating to manage-jobs from post-job');
            router.push('/(tabs)/employer/manage-jobs');
          }
        },
      }),
    [router]
  );

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
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modern Header */}
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSubtitle}>
                {isEditMode ? 'Update Position' : 'New Opportunity'}
              </Text>
              <Text style={styles.headerTitle}>
                {isEditMode ? 'Edit Job' : 'Post a Job'}
              </Text>
            </View>
            <Icon name={isEditMode ? "edit" : "work"} size={32} color="#00A389" />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.formContainer}>
            {/* Job Title */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="title" size={20} color="#00A389" />
                <Text style={styles.label}>Job Title *</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.title}
                  onChangeText={(value) => handleInputChange('title', value)}
                  placeholder="e.g. Senior Software Engineer"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Company */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="business" size={20} color="#3B82F6" />
                <Text style={styles.label}>Company *</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.company}
                  onChangeText={(value) => handleInputChange('company', value)}
                  placeholder="e.g. Tech Innovations Inc."
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="location-on" size={20} color="#EF4444" />
                <Text style={styles.label}>Location *</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                  placeholder="e.g. New York, NY or Remote"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Job Type */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="work" size={20} color="#8B5CF6" />
                <Text style={styles.label}>Job Type</Text>
              </View>
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
              <View style={styles.labelRow}>
                <Icon name="trending-up" size={20} color="#F59E0B" />
                <Text style={styles.label}>Experience Level</Text>
              </View>
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
              <View style={styles.labelRow}>
                <Icon name="payments" size={20} color="#10B981" />
                <Text style={styles.label}>Salary Range</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  value={formData.salary}
                  onChangeText={(value) => handleInputChange('salary', value)}
                  placeholder="e.g. $80,000 - $120,000 or Competitive"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="description" size={20} color="#06B6D4" />
                <Text style={styles.label}>Job Description *</Text>
              </View>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Requirements */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="checklist" size={20} color="#F97316" />
                <Text style={styles.label}>Requirements</Text>
              </View>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.requirements}
                  onChangeText={(value) => handleInputChange('requirements', value)}
                  placeholder="List the required skills, qualifications, and experience (comma-separated)"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Benefits */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Icon name="card-giftcard" size={20} color="#EC4899" />
                <Text style={styles.label}>Benefits</Text>
              </View>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.benefits}
                  onChangeText={(value) => handleInputChange('benefits', value)}
                  placeholder="Health insurance, 401k, flexible hours, remote work, etc..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
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
                <Icon name={isEditMode ? "check-circle" : "send"} size={22} color="#FFFFFF" />
                <Text style={styles.postButtonText}>
                  {isEditMode ? 'Update Job' : 'Post Job'}
                </Text>
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
    backgroundColor: '#F8FAFC',
  },
  keyboardContainer: {
    flex: 1,
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  formContainer: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 28,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1E293B',
    fontWeight: '500',
  },
  textAreaWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  chipSelected: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 120,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  postButton: {
    backgroundColor: '#00A389',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  debugButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
});

export default withEmployerProtection(PostJobScreen);
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/ToastContext';

// Types
interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  experience: string;
  salary: string;
  description: string;
  requirements: string;
  benefits: string;
  status?: 'active' | 'paused' | 'closed';
  employerId?: string;
  postedAt?: string;
  updatedAt?: string;
}

export default function JobDetailsScreen() {
  const router = useRouter();
  const { jobId, jobData } = useLocalSearchParams();
  const { currentUser, isEmployee, isEmployer } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  // Check if current user is the owner of this job
  const isJobOwner = job && currentUser && job.employerId === currentUser.uid;

  useEffect(() => {
    if (jobData && typeof jobData === 'string') {
      try {
        const parsedJob = JSON.parse(jobData) as JobDetails;
        setJob(parsedJob);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing job data:', error);
        setLoading(false);
      }
    } else {
      // If no job data passed, we could fetch by jobId here
      setLoading(false);
    }
  }, [jobData]);

  const handleEdit = () => {
    if (job && isJobOwner) {
      router.push({
        pathname: '/(tabs)/employer/post-job',
        params: {
          editJobId: job.id,
          editJobData: JSON.stringify(job),
        },
      });
    }
  };

  const handleApply = () => {
    if (!currentUser) {
      Alert.alert(
        'Login Required',
        'Please login to apply for jobs',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => router.push('/(tabs)/auth/login') 
          }
        ]
      );
      return;
    }

    if (!isEmployee) {
      showError('Only job seekers can apply for jobs');
      return;
    }

    // Navigate to application form
    router.push({
      pathname: '/(tabs)/apply-job',
      params: {
        jobId: job?.id,
        jobTitle: job?.title,
        company: job?.company,
      }
    });
  };

  const handleShare = async () => {
    try {
      const shareContent = {
        message: `Check out this job: ${job?.title} at ${job?.company}\\n\\nLocation: ${job?.location}\\nType: ${job?.type}\\nExperience: ${job?.experience}`,
        url: '', // Could add deep link here
        title: `${job?.title} - ${job?.company}`,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing job:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recently';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Loading job details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!job) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="error-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>Job not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/find-jobs')}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => router.push('/(tabs)/find-jobs')}
        >
          <Icon name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        {isJobOwner ? (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleEdit}
          >
            <Icon name="edit" size={24} color="#00A389" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Icon name="share" size={24} color="#374151" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Job Header */}
        <View style={styles.jobHeader}>
          <View style={styles.companyLogo}>
            <Text style={styles.companyInitial}>
              {job.company.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.jobHeaderInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>{job.company}</Text>
            <View style={styles.jobMeta}>
              <View style={styles.metaItem}>
                <Icon name="location-on" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{job.location}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="work" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{job.type}</Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="schedule" size={16} color="#6B7280" />
                <Text style={styles.metaText}>Posted {formatDate(job.postedAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Job Details */}
        <View style={styles.content}>
          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.infoCard}>
              <Icon name="trending-up" size={20} color="#00A389" />
              <Text style={styles.infoLabel}>Experience</Text>
              <Text style={styles.infoValue}>{job.experience}</Text>
            </View>
            <View style={styles.infoCard}>
              <Icon name="attach-money" size={20} color="#00A389" />
              <Text style={styles.infoLabel}>Salary</Text>
              <Text style={styles.infoValue}>{job.salary || 'Competitive'}</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description</Text>
            <Text style={styles.sectionContent}>{job.description}</Text>
          </View>

          {/* Requirements */}
          {job.requirements && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Requirements</Text>
              <Text style={styles.sectionContent}>{job.requirements}</Text>
            </View>
          )}

          {/* Benefits */}
          {job.benefits && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Benefits</Text>
              <Text style={styles.sectionContent}>{job.benefits}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply Button - Only show for job seekers and not for job owners */}
      {!isJobOwner && (
        <View style={styles.applyContainer}>
          <TouchableOpacity
            style={[styles.applyButton, applying && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Icon name="send" size={20} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply Now</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#00A389',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100, // Add padding to avoid tab bar overlap
  },
  jobHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyInitial: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  jobHeaderInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#00A389',
    fontWeight: '600',
    marginBottom: 8,
  },
  jobMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  content: {
    padding: 20,
    paddingBottom: 120, // Extra padding to ensure content is above apply button and tab bar
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  applyContainer: {
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
  applyButton: {
    backgroundColor: '#00A389',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  PanResponder,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Swipe gesture handler for right swipe to navigate back
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
          console.log('Swipe detected:', gestureState.dx, 'isEmployee:', isEmployee, 'isEmployer:', isEmployer);
          if (gestureState.dx > 100) {
            if (isEmployer) {
              console.log('Navigating to manage-jobs');
              router.push('/(tabs)/employer/manage-jobs');
            } else if (isEmployee) {
              console.log('Navigating to find-jobs');
              router.push('/(tabs)/find-jobs');
            }
          }
        },
      }),
    [isEmployee, isEmployer, router]
  );

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

    // Navigate to application form with jobData for back navigation
    router.push({
      pathname: '/(tabs)/apply-job',
      params: {
        jobId: job?.id,
        jobTitle: job?.title,
        company: job?.company,
        jobData: JSON.stringify(job), // Pass the full job data for back navigation
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
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      {/* Modern Header with Curved Bottom */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (isEmployer) {
                router.push('/(tabs)/employer/manage-jobs');
              } else {
                router.push('/(tabs)/find-jobs');
              }
            }}
          >
            <Icon name="arrow-back" size={24} color="#00A389" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Position Details</Text>
            <Text style={styles.headerTitle}>Job Information</Text>
          </View>
          {isJobOwner ? (
            <TouchableOpacity 
              style={styles.headerIconButton}
              onPress={handleEdit}
            >
              <Icon name="edit" size={22} color="#00A389" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.headerIconButton}
              onPress={handleShare}
            >
              <Icon name="share" size={22} color="#00A389" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Company Header Card with Gradient */}
          <View style={styles.companyCard}>
            <View style={styles.companyLogoContainer}>
              <View style={styles.companyLogo}>
                <Text style={styles.companyInitial}>
                  {job.company.charAt(0).toUpperCase()}
                </Text>
              </View>
              {job.status === 'active' && (
                <View style={styles.activeBadge}>
                  <Icon name="check-circle" size={12} color="#FFFFFF" />
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>{job.company}</Text>
            
            {/* Meta Info Pills */}
            <View style={styles.metaPills}>
              <View style={styles.metaPill}>
                <Icon name="location-on" size={14} color="#00A389" />
                <Text style={styles.metaPillText}>{job.location}</Text>
              </View>
              <View style={styles.metaPill}>
                <Icon name="work" size={14} color="#3B82F6" />
                <Text style={styles.metaPillText}>{job.type}</Text>
              </View>
              <View style={styles.metaPill}>
                <Icon name="schedule" size={14} color="#F59E0B" />
                <Text style={styles.metaPillText}>{formatDate(job.postedAt)}</Text>
              </View>
            </View>
          </View>

          {/* Quick Info Cards with Icons */}
          <View style={styles.quickInfoSection}>
            <View style={styles.quickInfoCard}>
              <View style={styles.quickInfoIconContainer}>
                <Icon name="trending-up" size={24} color="#00A389" />
              </View>
              <View style={styles.quickInfoContent}>
                <Text style={styles.quickInfoLabel}>Experience Level</Text>
                <Text style={styles.quickInfoValue}>{job.experience}</Text>
              </View>
            </View>
            
            <View style={styles.quickInfoCard}>
              <View style={styles.quickInfoIconContainer}>
                <Icon name="attach-money" size={24} color="#10B981" />
              </View>
              <View style={styles.quickInfoContent}>
                <Text style={styles.quickInfoLabel}>Salary Range</Text>
                <Text style={styles.quickInfoValue}>{job.salary || 'Competitive'}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="description" size={22} color="#00A389" />
              <Text style={styles.sectionTitle}>Job Description</Text>
            </View>
            <View style={styles.sectionCard}>
              <Text style={styles.sectionContent}>{job.description}</Text>
            </View>
          </View>

          {/* Requirements Section */}
          {job.requirements && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="checklist" size={22} color="#3B82F6" />
                <Text style={styles.sectionTitle}>Requirements</Text>
              </View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionContent}>{job.requirements}</Text>
              </View>
            </View>
          )}

          {/* Benefits Section */}
          {job.benefits && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Icon name="card-giftcard" size={22} color="#10B981" />
                <Text style={styles.sectionTitle}>Benefits & Perks</Text>
              </View>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionContent}>{job.benefits}</Text>
              </View>
            </View>
          )}

          {/* Extra padding for apply button and tab bar */}
          <View style={{ height: 180 }} />
        </View>
      </ScrollView>

      {/* Modern Apply Button - Only show for job seekers */}
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
                <Icon name="send" size={22} color="#FFFFFF" />
                <Text style={styles.applyButtonText}>Apply for this Position</Text>
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
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  headerIconButton: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  companyLogoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  companyInitial: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  jobTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    color: '#00A389',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  metaPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
  },
  metaPillText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  quickInfoSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickInfoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickInfoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickInfoContent: {
    flex: 1,
  },
  quickInfoLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  quickInfoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    color: '#374151',
  },
  applyContainer: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  applyButton: {
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
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
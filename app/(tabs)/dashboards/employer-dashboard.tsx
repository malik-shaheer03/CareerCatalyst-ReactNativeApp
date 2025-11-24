import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useNotificationService } from '@/lib/notification-service';
import { getEmployerAnalytics, getEmployerJobs, getEmployerApplications } from '@/lib/services/employer-services';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

interface StatCard {
  label: string;
  value: number;
  icon: keyof typeof Icon.glyphMap;
  color: string;
  loading?: boolean;
}

interface RecentJob {
  id: string;
  title: string;
  applicationsCount: number;
  postedDate: Date;
  status: string;
}

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { currentUser, userProfile, signOut } = useAuth();
  const { notifications } = useNotificationService();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Real-time stats
  const [totalJobs, setTotalJobs] = useState(0);
  const [activeJobs, setActiveJobs] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [recentJobs, setRecentJobs] = useState<RecentJob[]>([]);

  // Load dashboard data with real-time Firestore queries
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!currentUser) return;

      // Fetch all employer jobs
      const jobs = await getEmployerJobs();
      setTotalJobs(jobs.length);
      
      // Count active jobs
      const activeJobsCount = jobs.filter(job => job.status === 'active').length;
      setActiveJobs(activeJobsCount);

      // Fetch applications for all employer jobs
      const applications = await getEmployerApplications();
      setTotalApplications(applications.length);

      // Get recent jobs with application counts
      const jobsWithCounts = await Promise.all(
        jobs.slice(0, 5).map(async (job) => {
          const jobApplications = applications.filter(app => app.jobId === job.id);
          return {
            id: job.id!,
            title: job.title,
            applicationsCount: jobApplications.length,
            postedDate: job.postedAt ? new Date(job.postedAt) : new Date(),
            status: job.status || 'active'
          };
        })
      );
      
      setRecentJobs(jobsWithCounts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      notifications.customError('Load Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData().finally(() => setRefreshing(false));
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      notifications.logoutSuccess();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Sign out error:', error);
      notifications.customError('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  const stats: StatCard[] = [
    { label: 'Total Jobs', value: totalJobs, icon: 'briefcase-variant', color: '#00A389', loading },
    { label: 'Active Jobs', value: activeJobs, icon: 'briefcase-check', color: '#10B981', loading },
    { label: 'Applications', value: totalApplications, icon: 'account-multiple', color: '#3B82F6', loading },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#00A389', '#00D4A1']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.nameText}>
              {userProfile?.companyName || currentUser?.email?.split('@')[0] || 'Employer'}
            </Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Icon name="logout" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#00A389']}
            tintColor="#00A389"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00A389" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                  <View key={index} style={styles.statCard}>
                    <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                      <Icon name={stat.icon} size={28} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statValue}>{stat.value}</Text>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                  </View>
                ))}
              </View>
            </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile/edit-employer-profile')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#00A389' }]}>
                <Icon name="account-edit" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile/view-profile')}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: '#3B82F6' }]}>
                <Icon name="account" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <View style={styles.jobsContainer}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
            <View style={styles.jobsList}>
              {recentJobs.map((job) => (
                <TouchableOpacity 
                  key={job.id} 
                  style={styles.jobCard}
                  onPress={() => router.push('/(tabs)/employer/manage-jobs')}
                >
                  <View style={styles.jobHeader}>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.title}</Text>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: job.status === 'active' ? '#10B981' : '#F59E0B' }
                    ]}>
                      <Text style={styles.statusText}>
                        {job.status === 'active' ? 'Active' : 'Paused'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.jobStats}>
                    <View style={styles.jobStat}>
                      <Icon name="account-multiple" size={16} color="#6B7280" />
                      <Text style={styles.jobStatText}>
                        {job.applicationsCount} {job.applicationsCount === 1 ? 'application' : 'applications'}
                      </Text>
                    </View>
                    <View style={styles.jobStat}>
                      <Icon name="calendar" size={16} color="#6B7280" />
                      <Text style={styles.jobStatText}>
                        {getTimeAgo(job.postedDate)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  signOutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: (width - 52) / 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  jobsContainer: {
    marginBottom: 24,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  jobStats: {
    flexDirection: 'row',
    gap: 16,
  },
  jobStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  jobStatText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
});


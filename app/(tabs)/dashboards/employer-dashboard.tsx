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
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useNotificationService } from '@/lib/notification-service';

const { width, height } = Dimensions.get('window');

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface ActiveJob {
  title: string;
  applications: number;
  views: number;
  status: 'Active' | 'Paused';
}

interface RecentActivity {
  action: string;
  job: string;
  time: string;
}

export default function EmployerDashboardScreen() {
  const router = useRouter();
  const { currentUser, signOut } = useAuth();
  const { notifications } = useNotificationService();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<StatCard[]>([
    { label: 'Active Jobs', value: '12', icon: 'briefcase', color: '#4CAF50' },
    { label: 'Total Applications', value: '248', icon: 'file-document', color: '#2196F3' },
    { label: 'Profile Views', value: '1,234', icon: 'eye', color: '#FF9800' },
    { label: 'Interviews Scheduled', value: '18', icon: 'calendar', color: '#9C27B0' },
  ]);

  const activeJobs: ActiveJob[] = [
    { title: 'Senior React Developer', applications: 45, views: 234, status: 'Active' },
    { title: 'UI/UX Designer', applications: 32, views: 189, status: 'Active' },
    { title: 'Backend Developer', applications: 28, views: 156, status: 'Paused' },
    { title: 'Product Manager', applications: 67, views: 345, status: 'Active' },
  ];

  const recentActivities: RecentActivity[] = [
    { action: 'New application received', job: 'Senior React Developer', time: '2 hours ago' },
    { action: 'Job posted successfully', job: 'UI/UX Designer', time: '1 day ago' },
    { action: 'Interview scheduled', job: 'Backend Developer', time: '2 days ago' },
    { action: 'Candidate shortlisted', job: 'Product Manager', time: '3 days ago' },
  ];

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#00A389', '#00C9A7']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{currentUser?.email || 'Employer'}</Text>
            <Text style={styles.subtitleText}>Manage your hiring process</Text>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Icon name="logout" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <View style={styles.statContent}>
                  <Icon name={stat.icon} size={24} color={stat.color} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>


        {/* Profile Management */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Profile Management</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile/edit-employer-profile')}
            >
              <Icon name="account-edit" size={32} color="#00A389" />
              <Text style={styles.actionText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/(tabs)/profile/view-profile')}
            >
              <Icon name="account" size={32} color="#2196F3" />
              <Text style={styles.actionText}>View Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Job Postings */}
        <View style={styles.jobsContainer}>
          <Text style={styles.sectionTitle}>Active Job Postings</Text>
          <View style={styles.jobsList}>
            {activeJobs.map((job, index) => (
              <View key={index} style={styles.jobCard}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: job.status === 'Active' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    <Text style={styles.statusText}>{job.status}</Text>
                  </View>
                </View>
                <View style={styles.jobStats}>
                  <View style={styles.jobStat}>
                    <Icon name="file-document" size={16} color="#666" />
                    <Text style={styles.jobStatText}>{job.applications} applications</Text>
                  </View>
                  <View style={styles.jobStat}>
                    <Icon name="eye" size={16} color="#666" />
                    <Text style={styles.jobStatText}>{job.views} views</Text>
                  </View>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { width: `${Math.min((job.applications / 100) * 100, 100)}%` }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <Icon 
                  name={
                    activity.action.includes('application') ? 'account-plus' :
                    activity.action.includes('posted') ? 'briefcase' :
                    activity.action.includes('interview') ? 'calendar-check' :
                    'account-check'
                  } 
                  size={20} 
                  color={
                    activity.action.includes('application') ? '#4CAF50' :
                    activity.action.includes('posted') ? '#2196F3' :
                    activity.action.includes('interview') ? '#FF9800' :
                    '#9C27B0'
                  } 
                />
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.action}</Text>
                  <Text style={styles.activitySubtitle}>{activity.job}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Hiring Tips</Text>
          <View style={styles.tipCard}>
            <Icon name="lightbulb" size={24} color="#FFC107" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Improve Your Job Postings</Text>
              <Text style={styles.tipText}>
                Use clear, specific job descriptions and include salary ranges to attract better candidates.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
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
    fontSize: 16,
    color: '#E8F5E8',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: '#E8F5E8',
  },
  signOutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginTop: -20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: (width - 60) / 2,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: (width - 60) / 2,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 8,
    textAlign: 'center',
  },
  jobsContainer: {
    marginBottom: 20,
  },
  jobsList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  jobStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  jobStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobStatText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00A389',
    borderRadius: 2,
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  activitySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});


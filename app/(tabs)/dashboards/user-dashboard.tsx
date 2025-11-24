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
import { doc, getDoc, collection, onSnapshot, Unsubscribe, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

interface StatCard {
  label: string;
  value: string;
  icon: string;
  color: string;
  loading?: boolean;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

interface RecentActivity {
  id: string;
  title: string;
  time: string;
  icon: string;
  color: string;
  type: 'application' | 'interview';
}

export default function UserDashboardScreen() {
  const router = useRouter();
  const { currentUser, signOut } = useAuth();
  const { notifications } = useNotificationService();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  
  // Real-time stats
  const [jobsAppliedCount, setJobsAppliedCount] = useState<number>(0);
  const [interviewsGivenCount, setInterviewsGivenCount] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Fetch user's name from profile with real-time updates
  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupRealtimeListener = () => {
      if (!currentUser) return;

      // Listen to the main user document for displayName changes
      const userDocRef = doc(db, 'employees', currentUser.uid);
      unsubscribe = onSnapshot(
        userDocRef,
        (userDoc) => {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.displayName) {
              setUserName(userData.displayName);
              return;
            }
          }
          
          // If no displayName in main doc, listen to profile subdocument
          const profileRef = doc(collection(db, 'employees', currentUser.uid, 'employee data'), 'profile');
          onSnapshot(
            profileRef,
            (profileDoc) => {
              if (profileDoc.exists()) {
                const profileData = profileDoc.data();
                if (profileData.personalInfo?.fullName) {
                  setUserName(profileData.personalInfo.fullName);
                  return;
                }
              }
              
              // Fallback to email if no name is found
              setUserName(currentUser.email?.split('@')[0] || 'User');
            },
            (error) => {
              console.error('Error in profile listener:', error);
              setUserName(currentUser.email?.split('@')[0] || 'User');
            }
          );
        },
        (error) => {
          console.error('Error in user listener:', error);
          setUserName(currentUser.email?.split('@')[0] || 'User');
        }
      );
    };

    setupRealtimeListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser]);

  // Fetch real-time data for jobs applied and interviews
  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch job applications count
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('userId', '==', currentUser.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        setJobsAppliedCount(applicationsSnapshot.size);

        // Build recent activities from applications
        const activities: RecentActivity[] = [];
        applicationsSnapshot.forEach((doc) => {
          const data = doc.data();
          const appliedDate = data.appliedAt?.toDate() || new Date();
          activities.push({
            id: doc.id,
            title: `Applied to ${data.jobTitle || 'a position'}`,
            time: getTimeAgo(appliedDate),
            icon: 'briefcase',
            color: '#2196F3',
            type: 'application'
          });
        });

        // Fetch interview attempts (MCQ + Mock Interviews)
        // Check for interview_sessions or interview_attempts collection
        const interviewQuery = query(
          collection(db, 'interview_sessions'),
          where('userId', '==', currentUser.uid)
        );
        const interviewSnapshot = await getDocs(interviewQuery);
        setInterviewsGivenCount(interviewSnapshot.size);

        // Add interview activities
        interviewSnapshot.forEach((doc) => {
          const data = doc.data();
          const interviewDate = data.completedAt?.toDate() || data.createdAt?.toDate() || new Date();
          activities.push({
            id: doc.id,
            title: `Completed ${data.type === 'mcq' ? 'MCQ Quiz' : 'Mock Interview'}`,
            time: getTimeAgo(interviewDate),
            icon: data.type === 'mcq' ? 'clipboard-check' : 'microphone',
            color: '#FF9800',
            type: 'interview'
          });
        });

        // Sort activities by most recent
        activities.sort((a, b) => {
          const timeA = parseTimeAgo(a.time);
          const timeB = parseTimeAgo(b.time);
          return timeA - timeB;
        });

        setRecentActivities(activities.slice(0, 5)); // Show only 5 most recent

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffMs / 604800000);

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  };

  // Helper to parse time ago string for sorting
  const parseTimeAgo = (timeStr: string): number => {
    const match = timeStr.match(/(\d+)\s+(min|hour|day|week)/);
    if (!match) return 0;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch(unit) {
      case 'min': return value;
      case 'hour': return value * 60;
      case 'day': return value * 1440;
      case 'week': return value * 10080;
      default: return 0;
    }
  };

  // Real-time stats data
  const statsData: StatCard[] = [
    {
      label: 'Jobs Applied',
      value: loading ? '-' : jobsAppliedCount.toString(),
      icon: 'briefcase',
      color: '#2196F3',
      loading
    },
    {
      label: 'Interviews Given',
      value: loading ? '-' : interviewsGivenCount.toString(),
      icon: 'microphone',
      color: '#FF9800',
      loading
    }
  ];

  const quickActions: QuickAction[] = [
    {
      title: 'Edit Profile',
      description: 'Update your profile information',
      icon: 'account-edit',
      color: '#00A389',
      route: '/(tabs)/profile/edit-profile'
    },
    {
      title: 'View Profile',
      description: 'View your complete profile',
      icon: 'account',
      color: '#2196F3',
      route: '/(tabs)/profile/view-profile'
    }
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    
    if (!currentUser) {
      setRefreshing(false);
      return;
    }

    try {
      // Refetch user name
      const userDocRef = doc(db, 'employees', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.displayName) {
          setUserName(userData.displayName);
        }
      }

      // Refetch job applications
      const applicationsQuery = query(
        collection(db, 'applications'),
        where('userId', '==', currentUser.uid)
      );
      const applicationsSnapshot = await getDocs(applicationsQuery);
      setJobsAppliedCount(applicationsSnapshot.size);

      // Refetch interviews
      const interviewQuery = query(
        collection(db, 'interview_sessions'),
        where('userId', '==', currentUser.uid)
      );
      const interviewSnapshot = await getDocs(interviewQuery);
      setInterviewsGivenCount(interviewSnapshot.size);

    } catch (error) {
      console.error('Error refreshing dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      notifications.logoutSuccess();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      notifications.customError('Logout Failed', 'Failed to logout. Please try again.');
    }
  };

  const handleQuickAction = (route: string) => {
    router.push(route as any);
  };

  return (
    <LinearGradient
      colors={['#004D40', '#00A389', '#26A69A']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Welcome back!</Text>
                <Text style={styles.userName}>{userName || 'User'}</Text>
              </View>
              <TouchableOpacity
                style={styles.signOutButton}
                onPress={handleSignOut}
              >
                <Icon name="logout" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.headerSubtitle}>Track your career progress</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Your Activity</Text>
            <View style={styles.statsGrid}>
              {statsData.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                      <Icon name={stat.icon as any} size={24} color="#FFFFFF" />
                    </View>
                  </View>
                  {stat.loading ? (
                    <ActivityIndicator size="large" color={stat.color} style={{ marginVertical: 8 }} />
                  ) : (
                    <Text style={styles.statValue}>{stat.value}</Text>
                  )}
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Profile Management */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Profile Management</Text>
            <View style={styles.actionsGrid}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => handleQuickAction(action.route)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                    <Icon name={action.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          {recentActivities.length > 0 && (
            <View style={styles.activityContainer}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.activityCard}>
                {recentActivities.map((activity) => (
                  <View key={activity.id} style={styles.activityItem}>
                    <View style={styles.activityIcon}>
                      <Icon name={activity.icon as any} size={20} color={activity.color} />
                    </View>
                    <View style={styles.activityContent}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                  </View>
                ))}
                
                {recentActivities.length === 0 && !loading && (
                  <View style={styles.emptyState}>
                    <Icon name="inbox" size={48} color="#D1D5DB" />
                    <Text style={styles.emptyStateText}>No recent activity</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Increased to account for tab bar height
  },
  header: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signOutButton: {
    padding: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#004D40',
    marginBottom: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    lineHeight: 16,
  },
  actionsContainer: {
    marginBottom: 30,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 6,
  },
  actionDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityIcon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#004D40',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  tipCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipText: {
    fontSize: 15,
    color: '#004D40',
    marginLeft: 16,
    flex: 1,
    lineHeight: 22,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '500',
  },
});



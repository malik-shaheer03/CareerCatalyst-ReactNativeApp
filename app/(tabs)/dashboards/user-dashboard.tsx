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
import { doc, getDoc, collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

interface StatCard {
  label: string;
  value: string;
  change: string;
  icon: string;
  color: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
}

export default function UserDashboardScreen() {
  const router = useRouter();
  const { currentUser, signOut } = useAuth();
  const { notifications } = useNotificationService();
  const [refreshing, setRefreshing] = useState(false);
  const [userName, setUserName] = useState<string>('');

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

  // Sample data - in real app, this would come from API/database
  const statsData: StatCard[] = [
    {
      label: 'Profile Views',
      value: '1,234',
      change: '+12%',
      icon: 'eye',
      color: '#00A389'
    },
    {
      label: 'Jobs Applied',
      value: '45',
      change: '+8%',
      icon: 'briefcase',
      color: '#2196F3'
    },
    {
      label: 'Interviews',
      value: '6',
      change: '+15%',
      icon: 'account-tie',
      color: '#FF9800'
    },
    {
      label: 'Profile Complete',
      value: '95%',
      change: '+5%',
      icon: 'check-circle',
      color: '#4CAF50'
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
    
    // Refetch user name
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'employees', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.displayName) {
            setUserName(userData.displayName);
          }
        }
      } catch (error) {
        console.error('Error refreshing user name:', error);
      }
    }
    
    // Simulate API call
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
            <Text style={styles.sectionTitle}>Your Progress</Text>
            <View style={styles.statsGrid}>
              {statsData.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                      <Icon name={stat.icon} size={20} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statChange}>{stat.change}</Text>
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
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
                    <Icon name={action.icon} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View style={styles.activityContainer}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon name="eye" size={20} color="#00A389" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Profile viewed by TechCorp Inc.</Text>
                  <Text style={styles.activityTime}>2 hours ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon name="briefcase" size={20} color="#2196F3" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Applied to Senior Developer at Google</Text>
                  <Text style={styles.activityTime}>1 day ago</Text>
                </View>
              </View>
              
              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon name="calendar-check" size={20} color="#FF9800" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Interview scheduled with Microsoft</Text>
                  <Text style={styles.activityTime}>3 days ago</Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Icon name="account-edit" size={20} color="#9C27B0" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Profile updated successfully</Text>
                  <Text style={styles.activityTime}>1 week ago</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Insights */}
          <View style={styles.tipsContainer}>
            <Text style={styles.sectionTitle}>Quick Insights</Text>
            <View style={styles.tipCard}>
              <Icon name="trending-up" size={24} color="#00A389" />
              <Text style={styles.tipText}>
                Your profile completion is at 95%. Complete your skills section to reach 100% and increase visibility by 40%.
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Icon name="target" size={24} color="#FF9800" />
              <Text style={styles.tipText}>
                You've applied to 45 jobs this month. Consider targeting roles that match your top skills for better success rates.
              </Text>
            </View>
          </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statChange: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#004D40',
    marginBottom: 6,
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
});


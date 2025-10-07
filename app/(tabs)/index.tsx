import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { currentUser, userType } = useAuth();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };



  const recentJobs = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'TechCorp',
      location: 'Remote',
      salary: '$8,000/month',
      posted: '2 hours ago'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'StartupXYZ',
      location: 'San Francisco',
      salary: '$12,000/month',
      posted: '4 hours ago'
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'New York',
      salary: '$7,500/month',
      posted: '6 hours ago'
    }
  ];

  const handleQuickAction = (route: string) => {
    if (currentUser) {
      router.push(route as any);
    } else {
      router.push('/(tabs)/auth/login');
    }
  };

  const getCompanyIcon = (company: string) => {
    const iconMap = {
      TechCorp: 'briefcase',
      StartupXYZ: 'rocket-launch',
      DesignStudio: 'palette',
    };
    return iconMap[company] || 'briefcase';
  };

  const getCompanyColor = (company: string) => {
    const colorMap = {
      TechCorp: '#00A389',
      StartupXYZ: '#FF9800',
      DesignStudio: '#9C27B0',
    };
    return colorMap[company] || '#004D40';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#004D40', '#00695C', '#00796B']}
        style={styles.gradientContainer}
      >
        {/* Header */}
        <Header showProfileButton={!!currentUser} />

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Icon name="home" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>
              {currentUser ? `Welcome back!` : `Find Your Dream Job`}
            </Text>
            <Text style={styles.heroSubtitle}>
              {currentUser 
                ? `Ready to take the next step in your career?` 
                : `Discover opportunities that match your skills and ambitions`
              }
            </Text>
            {!currentUser && (
              <View style={styles.heroButtons}>
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={() => router.push('/(tabs)/auth/signup')}
                >
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => router.push('/(tabs)/auth/login')}
                >
                  <Text style={styles.secondaryButtonText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Recent Jobs Section */}
            <View style={styles.jobsSection}>
              <View style={styles.sectionHeader}>
                <Icon name="briefcase" size={24} color="#00A389" />
                <Text style={styles.sectionTitle}>Recent Jobs</Text>
              </View>
              
              <View style={styles.jobsList}>
                {recentJobs.map((job) => (
                  <TouchableOpacity key={job.id} style={styles.jobCard}>
                    <View style={styles.jobHeader}>
                      <View style={[styles.companyLogo, { backgroundColor: getCompanyColor(job.company) }]}>
                        <Icon name={getCompanyIcon(job.company)} size={24} color="#fff" />
                      </View>
                      <View style={styles.jobInfo}>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.jobCompany}>{job.company}</Text>
                        <View style={styles.jobMeta}>
                          <Icon name="map-marker" size={12} color="#6B7280" />
                          <Text style={styles.jobLocation}>{job.location}</Text>
                          <View style={styles.jobTypeTag}>
                            <Text style={styles.jobTypeTagText}>Full-time</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.salaryContainer}>
                        <Text style={styles.salaryText}>{job.salary.split('/')[0]}</Text>
                        <Text style={styles.salaryPeriod}>/{job.salary.split('/')[1]}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.jobFooter}>
                      <Text style={styles.jobPosted}>{job.posted}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.saveButton}>
                          <Icon name="heart-outline" size={20} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton}>
                          <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Show More Button */}
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => handleQuickAction('/(tabs)/find-jobs')}
              >
                <Text style={styles.showMoreButtonText}>Show More Jobs</Text>
                <Icon name="chevron-right" size={20} color="#00A389" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  jobsSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#004D40',
    marginLeft: 8,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00A389',
    backgroundColor: 'transparent',
    marginTop: 20,
  },
  showMoreButtonText: {
    color: '#00A389',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  jobsList: {
    gap: 16,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#004D40',
    marginBottom: 8,
    lineHeight: 26,
  },
  jobCompany: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '600',
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  jobLocation: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 14,
    fontWeight: '500',
  },
  jobTypeTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00A389',
  },
  jobTypeTagText: {
    fontSize: 12,
    color: '#00A389',
    fontWeight: '700',
  },
  salaryContainer: {
    alignItems: 'flex-end',
  },
  salaryText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00A389',
  },
  salaryPeriod: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  jobPosted: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    padding: 8,
    marginRight: 12,
  },
  applyButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
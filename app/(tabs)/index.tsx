import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  RefreshControl,
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'expo-router';

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
    <LinearGradient
      colors={['#004D40', '#00695C', '#00796B']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
              <Text style={styles.logoText}>CareerCatalyst</Text>
            </View>
            {currentUser && (
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/(tabs)/profile')}
              >
                <Icon name="account-circle" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* Hero Section */}
          <View style={styles.heroSection}>
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



          {/* Recent Jobs */}
          <View style={styles.recentJobsSection}>
            <Text style={styles.sectionTitle}>Recent Jobs</Text>
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
            <View style={styles.showMoreContainer}>
              <TouchableOpacity 
                style={styles.showMoreButton}
                onPress={() => router.push('/(tabs)/find-jobs')}
              >
                <Text style={styles.showMoreButtonText}>Show More Jobs</Text>
                <Icon name="chevron-down" size={20} color="#004D40" />
              </TouchableOpacity>
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
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 120,
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    height: 32,
    width: 32,
    marginRight: 0,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 20,
    marginLeft: 8,
  },
  profileButton: {
    padding: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
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
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  recentJobsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  showMoreContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  showMoreButtonText: {
    color: '#004D40',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
  },
  jobsList: {
    gap: 16,
  },
  jobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
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
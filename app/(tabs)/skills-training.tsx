import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Linking,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'expo-router';
import { getEmployeeSkills, getEmployeeJobTitle } from '../../lib/services/firestore-services';
import { getRecommendedTraining, TrainingRecommendation } from '../../lib/services/training-recommendations-api';

export default function SkillsTrainingScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [trainingData, setTrainingData] = useState<TrainingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!currentUser) {
      setError("Please log in to access training recommendations.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const [skills, job] = await Promise.all([
        getEmployeeSkills(currentUser.uid),
        getEmployeeJobTitle(currentUser.uid),
      ]);
      
      setUserSkills(skills);
      setJobTitle(job);
      
      if (skills && skills.length > 0 && job) {
        const recommendations = await getRecommendedTraining(skills, job);
        setTrainingData(recommendations);
      } else {
        setError("No skills or job title found in your profile. Please complete your profile setup first.");
      }
    } catch (err) {
      console.error("Error fetching training recommendations:", err);
      setError("Failed to recommend skills and training. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleBackToCareerPath = () => {
    router.push('/(tabs)/career-path');
  };

  const handleCourseLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Cannot open URL:", url);
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#004D40', '#00695C', '#00796B']}
          style={styles.gradientContainer}
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
              <Text style={styles.logoText}>CareerCatalyst</Text>
            </View>
          </View>
          
          <View style={styles.loginPrompt}>
            <Icon name="account-circle" size={80} color="#FFFFFF" />
            <Text style={styles.loginTitle}>Login Required</Text>
            <Text style={styles.loginSubtitle}>
              Please log in to access personalized training recommendations
            </Text>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/(tabs)/auth/login')}
            >
              <Text style={styles.loginButtonText}>Go to Login</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#004D40', '#00695C', '#00796B']}
        style={styles.gradientContainer}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>CareerCatalyst</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Icon name="school" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Skills & Training</Text>
            <Text style={styles.heroSubtitle}>
              Personalized learning recommendations based on your profile
            </Text>
          </View>

          {/* User Info Card */}
          {(jobTitle || userSkills.length > 0) && (
            <View style={styles.userInfoCard}>
              <View style={styles.userInfoHeader}>
                <Icon name="account-circle" size={24} color="#00A389" />
                <Text style={styles.userInfoTitle}>Your Profile</Text>
              </View>
              {jobTitle && (
                <View style={styles.jobTitleContainer}>
                  <Text style={styles.jobTitleLabel}>Current Role</Text>
                  <Text style={styles.jobTitleValue}>{jobTitle}</Text>
                </View>
              )}
              {userSkills.length > 0 && (
                <View style={styles.skillsContainer}>
                  <Text style={styles.skillsLabel}>Skills</Text>
                  <View style={styles.skillsList}>
                    {userSkills.map((skill, idx) => (
                      <View key={idx} style={styles.skillTag}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Loading and Error State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A389" />
                <Text style={styles.loadingText}>Finding the best training for you...</Text>
                <Text style={styles.loadingSubtext}>Analyzing your skills and career goals</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Unable to load recommendations</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                  <Icon name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.trainingContainer}>
                <View style={styles.trainingHeader}>
                  <Icon name="book-open-variant" size={24} color="#00A389" />
                  <Text style={styles.trainingTitle}>Recommended Training</Text>
                </View>
                {trainingData && trainingData.length > 0 ? (
                  trainingData.map((path) => (
                    <View key={path.id} style={styles.trainingCard}>
                      <View style={styles.trainingCardHeader}>
                        <View style={styles.trainingNumber}>
                          <Text style={styles.trainingNumberText}>{path.id}</Text>
                        </View>
                        <Text style={styles.trainingPathTitle}>{path.title}</Text>
                      </View>
                      <View style={styles.coursesContainer}>
                        {path.courses && path.courses.map((course, index) => (
                          <View key={index} style={styles.courseCard}>
                            <View style={styles.courseHeader}>
                              <View style={styles.platformBadge}>
                                <Text style={styles.platformText}>{course.platform}</Text>
                              </View>
                              <TouchableOpacity 
                                style={styles.courseLinkButton}
                                onPress={() => handleCourseLink(course.link)}
                              >
                                <Icon name="open-in-new" size={16} color="#00A389" />
                              </TouchableOpacity>
                            </View>
                            <Text style={styles.courseName}>{course.name}</Text>
                            <Text style={styles.courseDescription}>{course.description}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noTrainingContainer}>
                    <Icon name="book-off" size={48} color="#9CA3AF" />
                    <Text style={styles.noTrainingText}>No training recommendations found</Text>
                    <Text style={styles.noTrainingSubtext}>Try updating your skills or job title in your profile</Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToCareerPath}
              >
                <Icon name="arrow-left" size={20} color="#FFFFFF" />
                <Text style={styles.backButtonText}>Back to Career Paths</Text>
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
    backgroundColor: '#004D40',
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, // Add padding to prevent content cutoff
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 32,
    width: 32,
    marginRight: 8,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 20,
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },
  // User Info Card
  userInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  userInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  jobTitleContainer: {
    marginBottom: 16,
  },
  jobTitleLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  jobTitleValue: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '600',
  },
  skillsContainer: {
    marginTop: 8,
  },
  skillsLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00A389',
  },
  skillText: {
    color: '#004D40',
    fontSize: 14,
    fontWeight: '600',
  },
  // Main Card
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  // Loading States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    color: '#004D40',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  // Error States
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    color: '#DC2626',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#00A389',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Training Content
  trainingContainer: {
    marginBottom: 24,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  trainingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  trainingCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trainingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  trainingNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trainingNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  trainingPathTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  coursesContainer: {
    marginLeft: 44,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  platformText: {
    color: '#00A389',
    fontSize: 12,
    fontWeight: '600',
  },
  courseLinkButton: {
    padding: 4,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  noTrainingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noTrainingText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  noTrainingSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  // Action Button
  actionContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  backButton: {
    backgroundColor: '#00A389',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  // Login Prompt
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  loginButton: {
    backgroundColor: '#00897b',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

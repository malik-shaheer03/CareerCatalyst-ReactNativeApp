import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'expo-router';
import { getEmployeeSkills } from '../../lib/services/firestore-services';
import { getCareerPathsFromSkills, CareerPath } from '../../lib/services/career-path-api';

export default function CareerPathScreen() {
  const { currentUser } = useAuth();
  const router = useRouter();
  
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!currentUser) {
      setError("Please log in to access career path predictions.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const skills = await getEmployeeSkills(currentUser.uid);
      setUserSkills(skills);
      
      if (skills && skills.length > 0) {
        const paths = await getCareerPathsFromSkills(skills);
        setCareerPaths(paths);
      } else {
        setError("No skills found in your profile. Please complete your profile setup first.");
      }
    } catch (err) {
      console.error("Error fetching career paths:", err);
      setError("Failed to generate career paths. Please try again later.");
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

  const handleRecommendSkills = () => {
    router.push('/(tabs)/skills-training');
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
              Please log in to access AI-powered career path predictions
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
              <Icon name="trending-up" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Career Path Predictor</Text>
            <Text style={styles.heroSubtitle}>
              Discover your ideal career path with AI-powered insights
            </Text>
          </View>

          {/* Skills Section */}
          {userSkills.length > 0 && (
            <View style={styles.skillsCard}>
              <View style={styles.skillsHeader}>
                <Icon name="brain" size={24} color="#00A389" />
                <Text style={styles.skillsTitle}>Your Skills</Text>
              </View>
              <View style={styles.skillsList}>
                {userSkills.map((skill, idx) => (
                  <View key={idx} style={styles.skillTag}>
                    <Text style={styles.skillText}>{skill}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            {/* Loading and Error State */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00A389" />
                <Text style={styles.loadingText}>Generating tailored career paths...</Text>
                <Text style={styles.loadingSubtext}>This may take a few moments</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
                  <Icon name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.pathsContainer}>
                <View style={styles.pathsHeader}>
                  <Icon name="map-marker-path" size={24} color="#00A389" />
                  <Text style={styles.pathsTitle}>Recommended Career Paths</Text>
                </View>
                {careerPaths && careerPaths.length > 0 ? (
                  careerPaths.map((path) => (
                    <View key={path.id} style={styles.pathCard}>
                      <View style={styles.pathNumber}>
                        <Text style={styles.pathNumberText}>{path.id}</Text>
                      </View>
                      <View style={styles.pathContent}>
                        <Text style={styles.pathTitle}>{path.title}</Text>
                        <Text style={styles.pathDescription}>{path.description}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View style={styles.noPathsContainer}>
                    <Icon name="search-off" size={48} color="#9CA3AF" />
                    <Text style={styles.noPathsText}>No career paths found for your skills.</Text>
                    <Text style={styles.noPathsSubtext}>Try updating your skills in your profile</Text>
                  </View>
                )}
              </View>
            )}

            {/* Action Button */}
            <View style={styles.actionContainer}>
              <TouchableOpacity
                style={styles.recommendButton}
                onPress={handleRecommendSkills}
              >
                <Icon name="school" size={20} color="#FFFFFF" />
                <Text style={styles.recommendButtonText}>Get Training Recommendations</Text>
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
  // Skills Card
  skillsCard: {
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
  skillsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
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
  // Career Paths
  pathsContainer: {
    marginBottom: 24,
  },
  pathsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pathsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  pathCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  pathNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pathNumberText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  pathContent: {
    flex: 1,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
    marginBottom: 4,
  },
  pathDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  noPathsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noPathsText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  noPathsSubtext: {
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
  recommendButton: {
    backgroundColor: '#00A389',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  recommendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
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

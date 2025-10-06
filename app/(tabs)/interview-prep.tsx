import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Header from '@/components/Header';

export default function InterviewPrepScreen() {
  const router = useRouter();

  const features = [
    {
      title: "AI-Generated MCQs",
      description: "Practice with intelligent multiple-choice questions tailored to your target job role and difficulty level.",
      icon: "help-circle-outline" as const,
      action: () => router.push('/(tabs)/mcq-setup'),
      buttonText: "Start MCQ Practice",
      gradient: ['#00695c', '#004d40'] as const,
    },
    {
      title: "Live Mock Interview",
      description: "Experience realistic interview scenarios with AI-powered feedback and assessment.",
      icon: "video" as const,
      action: () => router.push('/(tabs)/interview-setup'),
      buttonText: "Start Mock Interview",
      gradient: ['#00796b', '#00695c'] as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#004D40', '#00695C', '#00796B']}
        style={styles.gradientContainer}
      >
        <Header showProfileButton={true} />

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Icon name="school" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Interview Preparation</Text>
            <Text style={styles.heroSubtitle}>
              Choose your preferred practice method and get AI-powered feedback
            </Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.mainCard}>
            <View style={styles.featuresContainer}>
              <View style={styles.featuresHeader}>
                <Icon name="target" size={24} color="#00A389" />
                <Text style={styles.featuresTitle}>Practice Methods</Text>
              </View>
              
              {features.map((feature, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.featureCard}
                  onPress={feature.action}
                  activeOpacity={0.8}
                >
                  <View style={styles.featureIconContainer}>
                    <Icon name={feature.icon} size={24} color="#00A389" />
                  </View>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <View style={styles.featureArrow}>
                    <Icon name="chevron-right" size={24} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tips Section */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <Icon name="lightbulb-outline" size={24} color="#00A389" />
                <Text style={styles.tipsTitle}>Success Tips</Text>
              </View>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Icon name="check-circle" size={16} color="#00A389" />
                  <Text style={styles.tipText}>Practice regularly to build confidence</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="check-circle" size={16} color="#00A389" />
                  <Text style={styles.tipText}>Review your performance after each session</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="check-circle" size={16} color="#00A389" />
                  <Text style={styles.tipText}>Focus on areas that need improvement</Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="check-circle" size={16} color="#00A389" />
                  <Text style={styles.tipText}>Prepare specific examples from your experience</Text>
                </View>
              </View>
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
    paddingBottom: 120,
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
    paddingHorizontal: 20,
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
  // Features Section
  featuresContainer: {
    marginBottom: 24,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  featureArrow: {
    marginLeft: 12,
  },
  // Tips Section
  tipsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
    marginLeft: 8,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 12,
    lineHeight: 20,
  },
});

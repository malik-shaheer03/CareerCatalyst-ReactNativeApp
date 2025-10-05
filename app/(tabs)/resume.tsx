import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ResumeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>CareerCatalyst</Text>
          </View>
        </View>

        {/* Coming Soon Content */}
        <View style={styles.content}>
          <LinearGradient
            colors={['#004D40', '#00A389', '#26A69A']}
            style={styles.gradientCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.iconContainer}>
              <Icon name="file-document" size={64} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Resume Builder</Text>
            <Text style={styles.subtitle}>Coming Soon</Text>
            <Text style={styles.description}>
              Build professional resumes with our AI-powered resume builder. 
              Create stunning resumes that get you noticed by employers.
            </Text>
            
            <View style={styles.featuresContainer}>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.featureText}>AI-Powered Templates</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.featureText}>ATS Optimization</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.featureText}>Multiple Formats</Text>
              </View>
              <View style={styles.featureItem}>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
                <Text style={styles.featureText}>Real-time Preview</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.notifyButton}>
              <Text style={styles.notifyButtonText}>Notify Me When Ready</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#004D40',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#004D40',
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 40,
    width: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  gradientCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 30,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  notifyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  notifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

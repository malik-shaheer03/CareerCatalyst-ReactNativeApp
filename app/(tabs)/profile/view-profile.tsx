import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useNotificationService } from '@/lib/notification-service';
import { doc, getDoc, collection, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Certification {
  name: string;
  organization: string;
  issueDate: string;
  expiryDate: string;
  credentialID: string;
}

interface JobPreferences {
  desiredJobTitle: string;
  jobType: string;
  workEnvironment: string;
  salaryMin: string;
  salaryMax: string;
  availability: string;
}

interface ProfileData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  jobPreferences: JobPreferences;
  skills: string[];
}

export default function ViewProfileScreen() {
  const router = useRouter();
  const { currentUser, userType } = useAuth();
  const { notifications } = useNotificationService();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupRealtimeListener = () => {
      if (!currentUser) return;

      const collectionName = userType === 'employer' ? 'employers' : 'employees';
      const profileRef = doc(collection(db, collectionName, currentUser.uid, `${userType === 'employer' ? 'employer' : 'employee'} data`), 'profile');
      
      // Set up real-time listener
      unsubscribe = onSnapshot(
        profileRef,
        (docSnap) => {
          setLoading(false);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfileData(data as ProfileData);
          } else {
            setProfileData(null);
          }
        },
        (error) => {
          console.error('Error in real-time listener:', error);
          setLoading(false);
          notifications.customError('Error', 'Failed to load profile data');
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
  }, [currentUser, userType, notifications]);


  const handleEditProfile = () => {
    if (userType === 'employer') {
      router.push('/(tabs)/profile/edit-employer-profile');
    } else {
      router.push('/(tabs)/profile/edit-profile');
    }
  };

  const handleBackToDashboard = () => {
    if (userType === 'employer') {
      router.replace('/(tabs)/dashboards/employer-dashboard');
    } else {
      router.replace('/(tabs)/dashboards/user-dashboard');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#004D40', '#00A389']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#004D40', '#00A389']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.emptyContainer}>
          <Icon name="account-circle" size={80} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Profile Found</Text>
          <Text style={styles.emptySubtitle}>Complete your profile to get started</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>Create Profile</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#004D40', '#00A389']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackToDashboard} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <Icon name="pencil" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{profileData.personalInfo?.fullName || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Job Title</Text>
            <Text style={styles.value}>{profileData.personalInfo?.jobTitle || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profileData.personalInfo?.email || currentUser?.email || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{profileData.personalInfo?.phone || 'Not provided'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Location</Text>
            <Text style={styles.value}>{profileData.personalInfo?.location || 'Not provided'}</Text>
          </View>
          {profileData.personalInfo?.summary && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Professional Summary</Text>
              <Text style={[styles.value, styles.summaryText]}>{profileData.personalInfo.summary}</Text>
            </View>
          )}
        </View>

        {/* Skills */}
        {profileData.skills && profileData.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {profileData.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {profileData.education && profileData.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {profileData.education.map((edu, index) => (
              <View key={index} style={styles.educationCard}>
                <Text style={styles.educationTitle}>{edu.degree} in {edu.field}</Text>
                <Text style={styles.educationInstitution}>{edu.institution}</Text>
                <Text style={styles.educationPeriod}>
                  {edu.startDate} - {edu.endDate}
                </Text>
                {edu.description && (
                  <Text style={styles.educationDescription}>{edu.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {profileData.experience && profileData.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Work Experience</Text>
            {profileData.experience.map((exp, index) => (
              <View key={index} style={styles.experienceCard}>
                <Text style={styles.experienceTitle}>{exp.position}</Text>
                <Text style={styles.experienceCompany}>{exp.company}</Text>
                <Text style={styles.experienceLocation}>{exp.location}</Text>
                <Text style={styles.experiencePeriod}>
                  {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                </Text>
                {exp.description && (
                  <Text style={styles.experienceDescription}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {profileData.certifications && profileData.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications & Licenses</Text>
            {profileData.certifications.map((cert, index) => (
              <View key={index} style={styles.certificationCard}>
                <Text style={styles.certificationTitle}>{cert.name}</Text>
                <Text style={styles.certificationOrganization}>{cert.organization}</Text>
                <Text style={styles.certificationPeriod}>
                  Issued: {cert.issueDate}
                  {cert.expiryDate && ` • Expires: ${cert.expiryDate}`}
                </Text>
                {cert.credentialID && (
                  <Text style={styles.certificationID}>ID: {cert.credentialID}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Job Preferences */}
        {profileData.jobPreferences && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Preferences</Text>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Desired Job Title</Text>
              <Text style={styles.value}>{profileData.jobPreferences.desiredJobTitle || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Job Type</Text>
              <Text style={styles.value}>{profileData.jobPreferences.jobType || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Work Environment</Text>
              <Text style={styles.value}>{profileData.jobPreferences.workEnvironment || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Salary Range</Text>
              <Text style={styles.value}>
                {profileData.jobPreferences.salaryMin && profileData.jobPreferences.salaryMax 
                  ? `${profileData.jobPreferences.salaryMin} - ${profileData.jobPreferences.salaryMax}`
                  : 'Not specified'
                }
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Availability</Text>
              <Text style={styles.value}>{profileData.jobPreferences.availability || 'Not specified'}</Text>
            </View>
          </View>
        )}

        <View style={styles.bottomSpacing} />
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#1F2937',
  },
  summaryText: {
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#00A389',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  educationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00A389',
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  educationInstitution: {
    fontSize: 14,
    color: '#00A389',
    fontWeight: '500',
    marginBottom: 4,
  },
  educationPeriod: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  educationDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  experienceCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  experienceCompany: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
    marginBottom: 4,
  },
  experienceLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  experiencePeriod: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  certificationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  certificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  certificationOrganization: {
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
    marginBottom: 4,
  },
  certificationPeriod: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  certificationID: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 100,
  },
});

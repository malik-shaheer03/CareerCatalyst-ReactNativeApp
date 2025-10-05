import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useNotificationService } from '@/lib/notification-service';
import { doc, setDoc, getDoc, collection, serverTimestamp, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EducationSection, ExperienceSection, CertificationSection } from '@/components/ProfileSections';

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

interface FormData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
  jobPreferences: JobPreferences;
  skills: string[];
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { notifications } = useNotificationService();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
          education: [{
            institution: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            description: ''
          }],
    experience: [{
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }],
    certifications: [{
      name: '',
      organization: '',
      issueDate: '',
      expiryDate: '',
      credentialID: ''
    }],
    jobPreferences: {
      desiredJobTitle: '',
      jobType: '',
      workEnvironment: '',
      salaryMin: '',
      salaryMax: '',
      availability: ''
    },
    skills: []
  });

  const [currentSkill, setCurrentSkill] = useState('');

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupRealtimeListener = () => {
      if (!currentUser) return;

      const profileRef = doc(collection(db, 'employees', currentUser.uid, 'employee data'), 'profile');
      
      // Set up real-time listener
      unsubscribe = onSnapshot(
        profileRef,
        (docSnap) => {
          setLoading(false);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              fullName: data.personalInfo?.fullName || '',
              jobTitle: data.personalInfo?.jobTitle || '',
              email: data.personalInfo?.email || currentUser.email || '',
              phone: data.personalInfo?.phone || '',
              location: data.personalInfo?.location || '',
              summary: data.personalInfo?.summary || '',
              education: data.education || [{
                institution: '',
                degree: '',
                field: '',
                startDate: '',
                endDate: '',
                description: ''
              }],
              experience: data.experience || [{
                company: '',
                position: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
              }],
              certifications: data.certifications || [{
                name: '',
                organization: '',
                issueDate: '',
                expiryDate: '',
                credentialID: ''
              }],
              jobPreferences: data.jobPreferences || {
                desiredJobTitle: '',
                jobType: '',
                workEnvironment: '',
                salaryMin: '',
                salaryMax: '',
                availability: ''
              },
              skills: data.skills || []
            });
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
  }, [currentUser, notifications]);


  const updateForm = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parentField: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [field]: value
      }
    }));
  };

  const updateArrayField = (arrayField: keyof FormData, index: number, field: string, value: any) => {
    setFormData(prev => {
      const newArray = [...(prev[arrayField] as any[])];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayField]: newArray };
    });
  };

  const addArrayItem = (arrayField: keyof FormData, defaultItem: any) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: [...(prev[arrayField] as any[]), defaultItem]
    }));
  };

  const removeArrayItem = (arrayField: keyof FormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [arrayField]: (prev[arrayField] as any[]).filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      updateForm('skills', [...formData.skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = formData.skills.filter((_, i) => i !== index);
    updateForm('skills', newSkills);
  };

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.jobTitle || !formData.email) {
      notifications.customError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const userProfile = {
        personalInfo: {
          fullName: formData.fullName,
          jobTitle: formData.jobTitle,
          email: formData.email,
          phone: formData.phone,
          location: formData.location,
          summary: formData.summary
        },
        education: formData.education.filter(edu => edu.institution && edu.degree),
        experience: formData.experience.filter(exp => exp.company && exp.position),
        certifications: formData.certifications.filter(cert => cert.name && cert.organization),
        jobPreferences: formData.jobPreferences,
        skills: formData.skills,
        metadata: {
          updatedAt: serverTimestamp(),
          profileComplete: true
        }
      };

      const basicUserInfo = {
        displayName: formData.fullName,
        email: formData.email,
        jobTitle: formData.jobTitle,
        profileComplete: true,
        lastUpdated: serverTimestamp()
      };

      // Update both documents
      const userDocRef = doc(db, 'employees', currentUser!.uid);
      await setDoc(userDocRef, basicUserInfo, { merge: true });
      
      const profileRef = doc(collection(db, 'employees', currentUser!.uid, 'employee data'), 'profile');
      await setDoc(profileRef, userProfile, { merge: true });

      notifications.profileUpdated();
      router.replace('/(tabs)/dashboards/user-dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      notifications.profileUpdateError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#004D40', '#00A389']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboards/user-dashboard')} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#004D40', '#00A389']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboards/user-dashboard')} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <TouchableOpacity onPress={handleSubmit} style={styles.saveButton} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView 
        style={styles.content} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(text) => updateForm('fullName', text)}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.jobTitle}
                onChangeText={(text) => updateForm('jobTitle', text)}
                placeholder="e.g., Software Engineer"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => updateForm('email', text)}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(text) => updateForm('phone', text)}
                placeholder="Enter your phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => updateForm('location', text)}
                placeholder="City, Country"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Professional Summary</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.summary}
                onChangeText={(text) => updateForm('summary', text)}
                placeholder="Brief overview of your professional background..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Skills */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsContainer}>
              {formData.skills.map((skill, index) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                  <TouchableOpacity onPress={() => removeSkill(index)}>
                    <Icon name="close" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            <View style={styles.addSkillContainer}>
              <TextInput
                style={[styles.input, styles.skillInput]}
                value={currentSkill}
                onChangeText={setCurrentSkill}
                placeholder="Add a skill"
                placeholderTextColor="#9CA3AF"
                onSubmitEditing={addSkill}
              />
              <TouchableOpacity onPress={addSkill} style={styles.addSkillButton}>
                <Icon name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Education Section */}
          <EducationSection
            education={formData.education}
            updateArrayField={updateArrayField}
            addEducation={() => addArrayItem('education', {
              institution: '',
              degree: '',
              field: '',
              startDate: '',
              endDate: '',
              description: ''
            })}
            removeEducation={(index) => removeArrayItem('education', index)}
          />

          {/* Experience Section */}
          <ExperienceSection
            experience={formData.experience}
            updateArrayField={updateArrayField}
            addExperience={() => addArrayItem('experience', {
              company: '',
              position: '',
              location: '',
              startDate: '',
              endDate: '',
              current: false,
              description: ''
            })}
            removeExperience={(index) => removeArrayItem('experience', index)}
          />

          {/* Certifications Section */}
          <CertificationSection
            certifications={formData.certifications}
            updateArrayField={updateArrayField}
            addCertification={() => addArrayItem('certifications', {
              name: '',
              organization: '',
              issueDate: '',
              expiryDate: '',
              credentialID: ''
            })}
            removeCertification={(index) => removeArrayItem('certifications', index)}
          />

          {/* Job Preferences */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Preferences</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Desired Job Title</Text>
              <TextInput
                style={styles.input}
                value={formData.jobPreferences.desiredJobTitle}
                onChangeText={(text) => updateNestedField('jobPreferences', 'desiredJobTitle', text)}
                placeholder="e.g., Senior Developer"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Job Type</Text>
              <TextInput
                style={styles.input}
                value={formData.jobPreferences.jobType}
                onChangeText={(text) => updateNestedField('jobPreferences', 'jobType', text)}
                placeholder="e.g., Full-time, Part-time"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Work Environment</Text>
              <TextInput
                style={styles.input}
                value={formData.jobPreferences.workEnvironment}
                onChangeText={(text) => updateNestedField('jobPreferences', 'workEnvironment', text)}
                placeholder="e.g., Remote, Hybrid, On-site"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Minimum Salary</Text>
              <TextInput
                style={styles.input}
                value={formData.jobPreferences.salaryMin}
                onChangeText={(text) => updateNestedField('jobPreferences', 'salaryMin', text)}
                placeholder="e.g., $80,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Maximum Salary</Text>
              <TextInput
                style={styles.input}
                value={formData.jobPreferences.salaryMax}
                onChangeText={(text) => updateNestedField('jobPreferences', 'salaryMax', text)}
                placeholder="e.g., $100,000"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Availability</Text>
              <TextInput
                style={styles.input}
                value={formData.jobPreferences.availability}
                onChangeText={(text) => updateNestedField('jobPreferences', 'availability', text)}
                placeholder="e.g., Immediately, 2 weeks notice"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  saveButtonText: {
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
  content: {
    flex: 1,
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
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginRight: 6,
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillInput: {
    flex: 1,
    marginRight: 12,
  },
  addSkillButton: {
    backgroundColor: '#00A389',
    padding: 12,
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});

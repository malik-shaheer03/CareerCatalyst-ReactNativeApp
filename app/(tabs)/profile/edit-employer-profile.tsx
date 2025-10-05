import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
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

interface FormData {
  companyName: string;
  companyWebsite: string;
  companyLocation: string;
  companyDescription: string;
  contactEmail: string;
  contactPhone: string;
  industry: string;
  companySize: string;
  foundedYear: string;
}

export default function EditEmployerProfileScreen() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { notifications } = useNotificationService();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyWebsite: '',
    companyLocation: '',
    companyDescription: '',
    contactEmail: '',
    contactPhone: '',
    industry: '',
    companySize: '',
    foundedYear: ''
  });

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    const setupRealtimeListener = () => {
      if (!currentUser) return;

      const profileRef = doc(collection(db, 'employers', currentUser.uid, 'employer data'), 'profile');
      
      // Set up real-time listener
      unsubscribe = onSnapshot(
        profileRef,
        (docSnap) => {
          setLoading(false);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              companyName: data.companyInfo?.companyName || '',
              companyWebsite: data.companyInfo?.companyWebsite || '',
              companyLocation: data.companyInfo?.companyLocation || '',
              companyDescription: data.companyInfo?.companyDescription || '',
              contactEmail: data.companyInfo?.contactEmail || currentUser.email || '',
              contactPhone: data.companyInfo?.contactPhone || '',
              industry: data.companyInfo?.industry || '',
              companySize: data.companyInfo?.companySize || '',
              foundedYear: data.companyInfo?.foundedYear || ''
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

  const updateForm = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.contactEmail) {
      notifications.customError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const companyProfile = {
        companyInfo: {
          companyName: formData.companyName,
          companyWebsite: formData.companyWebsite,
          companyLocation: formData.companyLocation,
          companyDescription: formData.companyDescription,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          industry: formData.industry,
          companySize: formData.companySize,
          foundedYear: formData.foundedYear
        },
        metadata: {
          updatedAt: serverTimestamp(),
          profileComplete: true
        }
      };

      const basicCompanyInfo = {
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        companyLocation: formData.companyLocation,
        contactEmail: formData.contactEmail,
        profileComplete: true,
        lastUpdated: serverTimestamp()
      };

      // Update both documents
      const companyDocRef = doc(db, 'employers', currentUser!.uid);
      await setDoc(companyDocRef, basicCompanyInfo, { merge: true });
      
      const profileRef = doc(collection(db, 'employers', currentUser!.uid, 'employer data'), 'profile');
      await setDoc(profileRef, companyProfile, { merge: true });

      notifications.profileUpdated();
      router.replace('/(tabs)/dashboards/employer-dashboard');
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
            <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboards/employer-dashboard')} style={styles.backButton}>
              <Icon name="arrow-left" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Company Profile</Text>
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
          <TouchableOpacity onPress={() => router.replace('/(tabs)/dashboards/employer-dashboard')} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Company Profile</Text>
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
          {/* Company Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.companyName}
                onChangeText={(text) => updateForm('companyName', text)}
                placeholder="Enter your company name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Website</Text>
              <TextInput
                style={styles.input}
                value={formData.companyWebsite}
                onChangeText={(text) => updateForm('companyWebsite', text)}
                placeholder="https://www.company.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Location</Text>
              <TextInput
                style={styles.input}
                value={formData.companyLocation}
                onChangeText={(text) => updateForm('companyLocation', text)}
                placeholder="City, Country"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Industry</Text>
              <TextInput
                style={styles.input}
                value={formData.industry}
                onChangeText={(text) => updateForm('industry', text)}
                placeholder="e.g., Technology, Finance, Healthcare"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Size</Text>
              <TextInput
                style={styles.input}
                value={formData.companySize}
                onChangeText={(text) => updateForm('companySize', text)}
                placeholder="e.g., 1-10, 11-50, 51-200, 201-500, 500+"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Founded Year</Text>
              <TextInput
                style={styles.input}
                value={formData.foundedYear}
                onChangeText={(text) => updateForm('foundedYear', text)}
                placeholder="e.g., 2020"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.companyDescription}
                onChangeText={(text) => updateForm('companyDescription', text)}
                placeholder="Brief description of your company, mission, and values..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.contactEmail}
                onChangeText={(text) => updateForm('contactEmail', text)}
                placeholder="contact@company.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.contactPhone}
                onChangeText={(text) => updateForm('contactPhone', text)}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
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
  bottomSpacing: {
    height: 100,
  },
});

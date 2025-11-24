import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from './auth-context';
import { debugEmployerProfile, createTestEmployerProfile } from './debug-profile';

interface WithEmployerProtectionProps {
  children: React.ReactNode;
}

export function withEmployerProtection<P extends {}>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  const ProtectedComponent: React.FC<P> = (props: P) => {
    const { currentUser, isEmployer, userType, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Don't redirect while still loading
      if (loading) return;
      
      // Redirect if not authenticated
      if (!currentUser) {
        console.log('No authenticated user, redirecting to login');
        router.replace('/(tabs)/auth/login');
        return;
      }
      
      // Redirect if user type is determined and they're not an employer
      if (userType && !isEmployer) {
        console.log('User is not an employer, redirecting to employee dashboard');
        router.replace('/(tabs)');
        return;
      }
    }, [currentUser, isEmployer, userType, loading, router]);

    // Show loading while determining user type
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    // Show loading if user is authenticated but user type not yet determined
    if (currentUser && !userType) {
      const handleDebugProfile = async () => {
        try {
          const result = await debugEmployerProfile();
          if (result) {
            Alert.alert('Profile Fixed!', `Found and fixed ${result} profile. Please restart the app.`);
          } else {
            Alert.alert('No Profile Found', 'Would you like to create a test employer profile?', [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Create Employer Profile', 
                onPress: async () => {
                  await createTestEmployerProfile();
                  Alert.alert('Profile Created!', 'Test employer profile created. Please restart the app.');
                }
              }
            ]);
          }
        } catch (error) {
          console.error('Debug error:', error);
          Alert.alert('Error', 'Failed to debug profile');
        }
      };

      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A389" />
          <Text style={styles.loadingText}>Verifying access...</Text>
          <Text style={styles.debugText}>
            If this persists, there might be a profile issue.
          </Text>
          <TouchableOpacity 
            style={styles.debugButton}
            onPress={handleDebugProfile}
          >
            <Text style={styles.debugButtonText}>Fix Profile Issue</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Don't render if not authenticated or not an employer
    if (!currentUser || !isEmployer) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Access Denied</Text>
          <Text style={styles.errorSubtext}>
            This area is only accessible to employers
          </Text>
        </View>
      );
    }

    // Render the protected component
    return <Component {...props} />;
  };

  ProtectedComponent.displayName = `withEmployerProtection(${Component.displayName || Component.name})`;
  
  return ProtectedComponent;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  debugText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  debugButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
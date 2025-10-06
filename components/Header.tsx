import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  showProfileButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  title?: string;
  rightElement?: React.ReactNode;
}

export default function Header({ 
  showProfileButton = false, 
  showBackButton = false, 
  onBackPress,
  title,
  rightElement 
}: HeaderProps) {
  const router = useRouter();
  const { currentUser, userProfile, userType } = useAuth();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/white-logo-noBG.png')} 
          style={styles.logoImage} 
        />
        <Text style={styles.logoText}>
          {title || 'CareerCatalyst'}
        </Text>
      </View>
      
      <View style={styles.rightContainer}>
        {showBackButton && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Icon name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {showProfileButton && currentUser && userProfile && (
          <TouchableOpacity 
            style={styles.profileContainer}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.profileImageContainer}>
              {userProfile.photoURL ? (
                <Image 
                  source={{ uri: userProfile.photoURL }} 
                  style={styles.profileImage}
                />
              ) : (
                <Icon name="account-circle" size={40} color="#FFFFFF" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {userProfile.displayName || 
                 `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() ||
                 userProfile.email?.split('@')[0] || 
                 'User'}
              </Text>
              <Text style={styles.profileRole}>
                {userProfile.userType === 'employer' ? 'Employer' : 'Job Seeker'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        
        {rightElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    marginLeft: -15,
    top: 5,
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: -15, // No space between logo and text
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  profileImageContainer: {
    marginRight: 8,
  },
  profileImage: {
    width: 25,
    height: 25,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    alignItems: 'flex-start',
  },
  profileName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
    maxWidth: 120,
  },
  profileRole: {
    color: 'white',
    fontWeight: '400',
    fontSize: 10,
    opacity: 0.8,
  },
});

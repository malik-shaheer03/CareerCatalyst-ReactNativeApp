import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userType, loading } = useAuth();
  
  // Check if we're on auth, dashboard, or profile screens
  const isProfileRelated = pathname.includes('/auth/') || 
                          pathname.includes('/dashboards/') || 
                          pathname.includes('/profile/');

  // Check if we're on career-related screens (career-path or skills-training)
  const isCareerRelated = pathname.includes('/career-path') || 
                         pathname.includes('/skills-training');

  // Check if we're on interview-related screens (interview-prep, interview-setup, interview-bot, mcq-setup, mcq-quiz)
  const isInterviewRelated = pathname.includes('/interview-prep') || 
                            pathname.includes('/interview-setup') || 
                            pathname.includes('/interview-bot') || 
                            pathname.includes('/mcq-setup') || 
                            pathname.includes('/mcq-quiz');

  // Check if we're on resume-related screens (resume-builder, resume-dashboard)
  const isResumeRelated = pathname.includes('/resume-builder') || 
                         pathname.includes('/resume-dashboard');

  const handleProfilePress = () => {
    if (!loading) {
      if (currentUser) {
        // User is logged in, redirect to appropriate dashboard
        if (userType === 'employer') {
          router.replace('/(tabs)/dashboards/employer-dashboard');
        } else {
          router.replace('/(tabs)/dashboards/user-dashboard');
        }
      } else {
        // User is not logged in, redirect to login
        router.replace('/(tabs)/auth/login');
      }
    }
  };

  const handleAuthenticatedTabPress = (tabName: 'find-jobs' | 'resume' | 'interview' | 'career-path') => {
    if (!loading) {
      if (currentUser) {
        // User is logged in, allow navigation to the tab
        if (tabName === 'interview') {
          router.push('/(tabs)/interview-prep');
        } else if (tabName === 'resume') {
          router.push('/(tabs)/resume-dashboard');
        } else {
          router.push(`/(tabs)/${tabName}` as any);
        }
      } else {
        // User is not logged in, redirect to login
        router.replace('/(tabs)/auth/login');
      }
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: Platform.OS === 'ios' ? 90 : 85,
          paddingBottom: Platform.OS === 'ios' ? 25 : 20,
          paddingTop: 12,
          paddingHorizontal: 12,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={85}
            tint="light"
            style={styles.tabBarBackground}
          />
        ),
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
          letterSpacing: 0.1,
          fontFamily: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
          color: '#374151',
        },
        tabBarActiveTintColor: '#00A389',
        tabBarInactiveTintColor: '#4B5563',
        tabBarLabel: ({ focused, children }) => (
          <Text style={[
            styles.tabBarLabel,
            focused && styles.activeTabBarLabel
          ]}>
            {children}
          </Text>
        ),
        tabBarLabelPosition: 'below-icon',
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              {focused && (
                <View style={styles.activeBackground} />
              )}
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                        <Icon
                          name="home"
                          size={20}
                          color={focused ? '#FFFFFF' : color}
                        />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="find-jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabItemContainer}>
              {focused && (
                <View style={styles.activeBackground} />
              )}
              <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
                <Icon
                  name="briefcase"
                  size={20}
                  color={focused ? '#FFFFFF' : color}
                />
              </View>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => handleAuthenticatedTabPress('find-jobs')}
              style={props.style}
              disabled={props.disabled || false}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityHint={props.accessibilityHint}
              testID={props.testID}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: 'Resume',
          tabBarIcon: ({ color, focused }) => {
            const isActive = focused || isResumeRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isActive && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <Icon
                    name="file-document"
                    size={20}
                    color={isActive ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            const isActive = focused || isResumeRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => handleAuthenticatedTabPress('resume')}
              style={props.style}
              disabled={props.disabled || false}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityHint={props.accessibilityHint}
              testID={props.testID}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
        <Tabs.Screen
        name="interview"
        options={{
          title: 'Interview',
          tabBarIcon: ({ color, focused }) => {
            const isActive = focused || isInterviewRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isActive && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <Icon
                    name="microphone"
                    size={20}
                    color={isActive ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            // Show as active if focused OR if we're on interview-related screens
            const isActive = focused || isInterviewRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => handleAuthenticatedTabPress('interview')}
              style={props.style}
              disabled={props.disabled || false}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityHint={props.accessibilityHint}
              testID={props.testID}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="career-path"
        options={{
          title: 'Career',
          tabBarIcon: ({ color, focused }) => {
            // Show as active if focused OR if we're on career-related screens
            const isActive = focused || isCareerRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isActive && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <Icon
                    name="trending-up"
                    size={20}
                    color={isActive ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            // Show as active if focused OR if we're on career-related screens
            const isActive = focused || isCareerRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={() => handleAuthenticatedTabPress('career-path')}
              style={props.style}
              disabled={props.disabled || false}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityHint={props.accessibilityHint}
              testID={props.testID}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => {
            // Show as active if focused OR if we're on profile-related screens
            const isActive = focused || isProfileRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isActive && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                        <Icon
                          name="account"
                          size={20}
                          color={isActive ? '#FFFFFF' : color}
                        />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            // Show as active if focused OR if we're on profile-related screens
            const isActive = focused || isProfileRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
          tabBarButton: (props) => (
            <TouchableOpacity
              onPress={handleProfilePress}
              style={props.style}
              disabled={props.disabled || false}
              accessibilityLabel={props.accessibilityLabel}
              accessibilityRole={props.accessibilityRole}
              accessibilityState={props.accessibilityState}
              accessibilityHint={props.accessibilityHint}
              testID={props.testID}
            >
              {props.children}
            </TouchableOpacity>
          ),
        }}
      />
      {/* Auth Screens */}
      <Tabs.Screen
        name="auth"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Dashboard Screens */}
      <Tabs.Screen
        name="dashboards"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Profile Setup */}
      <Tabs.Screen
        name="profile-setup"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Profile Edit and View Screens */}
      <Tabs.Screen
        name="profile/edit-profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/edit-employer-profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="profile/view-profile"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="skills-training"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Interview Module Screens */}
      <Tabs.Screen
        name="interview-prep"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="interview-setup"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="interview-bot"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="mcq-setup"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="mcq-quiz"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      {/* Resume Builder Screens */}
      <Tabs.Screen
        name="resume-builder"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="resume-dashboard"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackground: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: -8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconContainer: {
    width: 60,
    height: 50,
    borderRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeIconContainer: {
    backgroundColor: '#00A389',
    borderColor: 'transparent',
    width: 60,
    height: 50,
    borderRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#00A389',
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    transform: [{ scale: 1.0 }],
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
    fontFamily: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
    color: '#4B5563',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  activeTabBarLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tabItemContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    marginBottom: -15, // Extend further to bottom of tab bar
  },
  activeBackground: {
    position: 'absolute',
    top: 8, // Space from top of tab bar
    left: 0,
    right: 0,
    bottom: -15, // Extend completely to very bottom edge
    backgroundColor: '#00A389',
    borderRadius: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0, // No radius at bottom
    borderBottomRightRadius: 0, // No radius at bottom
    ...Platform.select({
      ios: {
        shadowColor: '#00A389',
        shadowOffset: {
          width: 0,
          height: 6,
        },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});

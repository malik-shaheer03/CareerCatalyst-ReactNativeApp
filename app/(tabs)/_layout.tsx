import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, userType, loading } = useAuth();
  
  // Debug logging
  console.log('TabLayout - userType:', userType, 'loading:', loading);
  
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

  // Check if we're on job scraper (should highlight find-jobs tab)
  const isJobScraperRelated = pathname.includes('/job-scraper');

  // Check if we're on find-jobs or job scraper (both should highlight find-jobs)
  const isFindJobsRelated = pathname.includes('/find-jobs') || isJobScraperRelated || pathname.includes('/apply-job') || pathname.includes('/job-details');

  // Check if we're on employer-related screens
  const isEmployerJobsRelated = pathname.includes('/employer/post-job') || pathname.includes('/employer/manage-jobs');
  const isEmployerAppsRelated = pathname.includes('/employer/applications') || pathname.includes('/employer/candidate-details');
  const isEmployerAnalyticsRelated = pathname.includes('/employer/analytics');

  // Determine if we should show employer tabs
  // Only show employer tabs when user is logged in AND is an employer
  const isEmployer = !loading && currentUser && userType === 'employer';
  const isEmployee = !loading && currentUser && userType === 'employee'; 
  const isLoggedIn = !loading && !!currentUser;
  
  console.log('TabLayout - loading:', loading, 'isEmployer:', isEmployer, 'isEmployee:', isEmployee, 'isLoggedIn:', isLoggedIn, 'userType:', userType, 'currentUser:', !!currentUser);

  // Redirect to login if trying to access protected screens without being logged in
  React.useEffect(() => {
    if (!loading && !currentUser) {
      // User is not logged in
      const isOnAuthScreen = pathname.includes('/auth/');
      const isOnProfileSetup = pathname.includes('/profile-setup');
      const isOnHomeScreen = pathname === '/' || pathname === '/index';
      
      // If user is not on auth, profile setup, or home screen, redirect to login
      if (!isOnAuthScreen && !isOnProfileSetup && !isOnHomeScreen) {
        console.log('Redirecting unauthenticated user to login from:', pathname);
        router.replace('/(tabs)/auth/login');
      }
    }
  }, [loading, currentUser, pathname, router]);

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
          textAlign: 'center',
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
          href: isLoggedIn ? null : undefined, // Hide when logged in
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
      {/* EMPLOYER TABS */}
      <Tabs.Screen
        name="employer/post-job"
        options={{
          title: 'Post Job',
          href: isEmployer ? undefined : null, // Hide if not employer
          tabBarIcon: ({ color, focused }) => {
            const isCustomFocused = focused || pathname.includes('/employer/post-job');
            return (
              <View style={styles.tabItemContainer}>
                {isCustomFocused && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isCustomFocused && styles.activeIconContainer]}>
                  <Icon
                    name="plus-circle"
                    size={20}
                    color={isCustomFocused ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            const isActive = focused || pathname.includes('/employer/post-job');
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
        }}
      />
      
      <Tabs.Screen
        name="employer/manage-jobs"
        options={{
          title: 'Manage Jobs',
          href: isEmployer ? undefined : null, // Hide if not employer
          tabBarIcon: ({ color, focused }) => {
            const isCustomFocused = focused || pathname.includes('/employer/manage-jobs');
            return (
              <View style={styles.tabItemContainer}>
                {isCustomFocused && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isCustomFocused && styles.activeIconContainer]}>
                  <Icon
                    name="briefcase-edit"
                    size={20}
                    color={isCustomFocused ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            const isActive = focused || pathname.includes('/employer/manage-jobs');
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
        }}
      />

      <Tabs.Screen
        name="employer/applications"
        options={{
          title: 'Applications',
          href: isEmployer ? undefined : null, // Hide if not employer
          tabBarIcon: ({ color, focused }) => {
            const isCustomFocused = focused || isEmployerAppsRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isCustomFocused && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isCustomFocused && styles.activeIconContainer]}>
                  <Icon
                    name="account-group"
                    size={20}
                    color={isCustomFocused ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            const isActive = focused || isEmployerAppsRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
        }}
      />

      <Tabs.Screen
        name="employer/analytics"
        options={{
          title: 'Analytics',
          href: isEmployer ? undefined : null, // Hide if not employer
          tabBarIcon: ({ color, focused }) => {
            const isCustomFocused = focused || isEmployerAnalyticsRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isCustomFocused && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isCustomFocused && styles.activeIconContainer]}>
                  <Icon
                    name="chart-bar"
                    size={20}
                    color={isCustomFocused ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            const isActive = focused || isEmployerAnalyticsRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
        }}
      />

      {/* EMPLOYEE TABS */}
      <Tabs.Screen
        name="find-jobs"
        options={{
          title: 'Jobs',
          href: isEmployee ? undefined : null, // Only show for logged-in employees
          tabBarIcon: ({ color, focused }) => {
            // Custom focus logic: highlight if on find-jobs OR job-scraper
            const isCustomFocused = focused || isFindJobsRelated;
            return (
              <View style={styles.tabItemContainer}>
                {isCustomFocused && (
                  <View style={styles.activeBackground} />
                )}
                <View style={[styles.iconContainer, isCustomFocused && styles.activeIconContainer]}>
                  <Icon
                    name="briefcase"
                    size={20}
                    color={isCustomFocused ? '#FFFFFF' : color}
                  />
                </View>
              </View>
            );
          },
          tabBarLabel: ({ focused, children }) => {
            const isActive = focused || isFindJobsRelated;
            return (
              <Text style={[
                styles.tabBarLabel,
                isActive && styles.activeTabBarLabel
              ]}>
                {children}
              </Text>
            );
          },
        }}
      />
      <Tabs.Screen
        name="resume"
        options={{
          title: 'Resume',
          href: isEmployee ? undefined : null, // Only show for logged-in employees
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
        }}
      />
      <Tabs.Screen
        name="interview-prep"
        options={{
          title: 'Interview',
          href: isEmployee ? undefined : null, // Only show for logged-in employees
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
        }}
      />
      <Tabs.Screen
        name="career-path"
        options={{
          title: 'Career',
          href: isEmployee ? undefined : null, // Only show for logged-in employees
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
        }}
      />

      {/* Common Profile Tab for logged-in users only */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          href: isLoggedIn ? undefined : null, // Only show when logged in
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
        name="interview"
        options={{
          href: null, // Hide from tab bar - Coming Soon screen
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
      
      {/* Job Scraper Screen - Hidden from tab bar, accessed via find-jobs */}
      <Tabs.Screen
        name="job-scraper"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      {/* Job Details Screen - Hidden from tab bar, accessed via find-jobs */}
      <Tabs.Screen
        name="job-details"
        options={{
          href: null, // Hide from tab bar
        }}
      />

      {/* Apply Job Screen - Hidden from tab bar, accessed via find-jobs */}
      <Tabs.Screen
        name="apply-job"
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
    textAlign: 'center', // Center align the text
  },
  activeTabBarLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center', // Center align the text
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

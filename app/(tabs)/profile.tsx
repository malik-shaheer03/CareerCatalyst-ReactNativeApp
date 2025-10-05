import React, { useEffect, useRef } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { useCallback } from 'react';

export default function ProfileTab() {
  const { currentUser, userType, loading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Handle focus effect to redirect immediately
  useFocusEffect(
    useCallback(() => {
      // Reset redirect flag when tab is focused
      hasRedirected.current = false;
      
      if (!loading && !hasRedirected.current) {
        hasRedirected.current = true;
        
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
    }, [currentUser, userType, loading, router])
  );

  // Return null to prevent any UI from showing
  return null;
}

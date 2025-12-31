import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Resume Index Screen - Redirects to Dashboard
const ResumeIndexScreen: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to resume dashboard
    router.replace('/(tabs)/resume-dashboard');
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#004D40" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default ResumeIndexScreen;
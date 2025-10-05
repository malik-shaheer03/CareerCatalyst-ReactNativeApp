import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function SimpleTest() {
  const router = useRouter();

  const testNavigation = () => {
    console.log('🧪 Testing navigation...');
    try {
      router.push('/test-page');
      Alert.alert('Success', 'Navigation test successful!');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      Alert.alert('Error', `Navigation failed: ${error.message}`);
    }
  };

  const testUserDashboard = () => {
    console.log('🧪 Testing user dashboard navigation...');
    try {
      router.push('/user-dashboard');
      Alert.alert('Success', 'User dashboard navigation test successful!');
    } catch (error) {
      console.error('❌ User dashboard error:', error);
      Alert.alert('Error', `User dashboard navigation failed: ${error.message}`);
    }
  };

  const testEmployerDashboard = () => {
    console.log('🧪 Testing employer dashboard navigation...');
    try {
      router.push('/(tabs)');
      Alert.alert('Success', 'Employer dashboard navigation test successful!');
    } catch (error) {
      console.error('❌ Employer dashboard error:', error);
      Alert.alert('Error', `Employer dashboard navigation failed: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Navigation Test</Text>
      
      <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6B6B' }]} onPress={testNavigation}>
        <Text style={styles.buttonText}>Test Basic Navigation</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#4CAF50' }]} onPress={testUserDashboard}>
        <Text style={styles.buttonText}>Test User Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#9C27B0' }]} onPress={testEmployerDashboard}>
        <Text style={styles.buttonText}>Test Employer Dashboard</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, { backgroundColor: '#2196F3' }]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    marginVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});


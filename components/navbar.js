import { useRouter, usePathname } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';

const menuItems = [
  { text: 'Home', route: '/(tabs)' },
  { text: 'Find Jobs', route: '/(tabs)/find-jobs' },
  { text: 'Explore', route: '/(tabs)/explore' },
  { text: 'Resume Builder', route: '/resume' },
  { text: 'Mock-Interview Preparation', route: '/interview-prep' },
  { text: 'Career Path Predictor', route: '/career-path' },
  { text: 'Login', route: '/auth/login' },
  { text: 'Sign Up', route: '/auth/signup' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const slideAnim = useState(new Animated.Value(320))[0]; // Start off-screen (320px to the right)

  useEffect(() => {
    if (drawerOpen) {
      // Slide in from right to left
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    // Remove the else block - closing animation is now handled manually
  }, [drawerOpen]);

  const isActive = (routeName) => {
    // Handle root route
    if (routeName === '/(tabs)' && pathname === '/') return true;
    // Handle exact matches
    if (pathname === routeName) return true;
    // Handle nested routes (e.g., /(tabs)/find-jobs matches /find-jobs)
    if (routeName.includes('/(tabs)/') && pathname === routeName.replace('/(tabs)', '')) return true;
    return false;
  };

  const handleNav = (routeName) => {
    // Start closing animation first, then navigate after animation completes
    Animated.timing(slideAnim, {
      toValue: 320,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDrawerOpen(false);
      router.push(routeName);
    });
  };

  const closeDrawer = () => {
    // Animate close, then set state
    Animated.timing(slideAnim, {
      toValue: 320,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setDrawerOpen(false);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#004D40" barStyle="light-content" />
      <View style={styles.navbar}>
        {/* Logo */}
        <TouchableOpacity style={styles.logoContainer} onPress={() => handleNav('/(tabs)')}>
          <Image source={require('../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
          <Text style={styles.logoText}>CareerCatalyst</Text>
        </TouchableOpacity>

        {/* Hamburger Menu */}
        <TouchableOpacity style={styles.hamburger} onPress={() => setDrawerOpen(true)}>
          <Icon name="menu" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Side Drawer Modal */}
        <Modal
          visible={drawerOpen}
          animationType="none"
          transparent={true}
          onRequestClose={closeDrawer}
        >
          <Pressable style={styles.drawerOverlay} onPress={closeDrawer}>
            <Animated.View style={[
              styles.drawer,
              {
                transform: [{
                  translateX: slideAnim
                }]
              }
            ]}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                  <Icon name="close" size={24} color="#004D40" />
                </TouchableOpacity>
                <Text style={styles.drawerHeaderText}>Menu</Text>
              </View>
              
              <ScrollView style={styles.drawerContent}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.text}
                    style={[
                      styles.drawerItem,
                      isActive(item.route) && styles.drawerItemActive,
                    ]}
                    onPress={() => handleNav(item.route)}
                  >
                    <Text style={[
                      styles.drawerItemText,
                      isActive(item.route) && styles.drawerItemTextActive
                    ]}>
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#004D40',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#004D40',
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'space-between',
    minHeight: 60,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoImage: {
    height: 40,
    width: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  hamburger: {
    padding: 8,
    borderRadius: 8,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  drawer: {
    backgroundColor: '#fff',
    width: '85%',
    maxWidth: 320,
    alignSelf: 'flex-end',
    height: '100%',
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 4,
  },
  drawerHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004D40',
    flex: 1,
    textAlign: 'center',
    marginRight: 32,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 8,
  },
  drawerItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  drawerItemActive: {
    backgroundColor: '#e0f2f1',
    borderLeftWidth: 4,
    borderLeftColor: '#00A389',
  },
  drawerItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  drawerItemTextActive: {
    color: '#004D40',
    fontWeight: 'bold',
  },
});
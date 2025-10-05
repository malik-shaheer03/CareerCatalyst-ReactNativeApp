import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const servicesLinks = [
  { text: 'Find Jobs', url: '#', icon: 'work' },
  { text: 'Post Jobs', url: '#', icon: 'post-add' },
  { text: 'Resume Builder', url: '#', icon: 'description' },
  { text: 'Career Path Predictor', url: '#', icon: 'trending-up' },
  { text: 'Recruitment Chatbot', url: '#', icon: 'chat' },
  { text: 'Skill Training', url: '#', icon: 'school' },
];

const aboutLinks = [
  { text: 'Our Team', url: '#', icon: 'group' },
  { text: 'FAQ', url: '#', icon: 'help' },
  { text: 'Privacy & Policy', url: '#', icon: 'privacy-tip' },
  { text: 'Terms & Conditions', url: '#', icon: 'gavel' },
];



export default function Footer() {
  return (
    <View style={styles.footerContainer}>
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Brand Section */}
                <View style={styles.brandSection}>
          <Text style={styles.brandName}>CareerCatalyst</Text>
          <Text style={styles.brandTagline}>Smart Paths, Strong Careers</Text>
          <Text style={styles.brandDescription}>
            Empowering careers through intelligent job matching, skill development, and personalized guidance.
          </Text>
        </View>

        {/* Links Sections */}
        <View style={styles.linksContainer}>
          <View style={styles.linkSection}>
            <Text style={styles.sectionTitle}>Services</Text>
            {servicesLinks.map(link => (
              <TouchableOpacity 
                key={link.text} 
                style={styles.linkItem}
                onPress={() => Linking.openURL(link.url)}
              >
                <Icon name={link.icon} size={16} color="#666" style={styles.linkIcon} />
                <Text style={styles.linkText}>{link.text}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.linkSection}>
            <Text style={styles.sectionTitle}>About</Text>
            {aboutLinks.map(link => (
              <TouchableOpacity 
                key={link.text} 
                style={styles.linkItem}
                onPress={() => Linking.openURL(link.url)}
              >
                <Icon name={link.icon} size={16} color="#666" style={styles.linkIcon} />
                <Text style={styles.linkText}>{link.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>


      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        <Text style={styles.copyright}>© 2025 CareerCatalyst. All Rights Reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#f8f9fa',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginTop: 40,
  },
  contentContainer: {
    marginBottom: 30,
  },
  brandSection: {
    marginBottom: 32,
    alignItems: 'center',
    paddingBottom: 24,
  },
  brandName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    fontSize: 16,
    color: '#00A389',
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  brandDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 280,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  linkSection: {
    flex: 1,
    marginHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 16,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 20,
  },
  bottomSection: {
    alignItems: 'center',
    paddingTop: 16,
  },
  copyright: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginBottom: 4,
  },
});

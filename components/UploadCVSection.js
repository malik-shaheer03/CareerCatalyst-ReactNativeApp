import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function UploadCVSection() {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const isTablet = width < 960;

  return (
    <View style={styles.sectionContainer}>
      <View style={[styles.contentWrapper, isTablet && styles.contentWrapperTablet]}>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>
          Get your Dream Job,{"\n"}Just by Uploading your CV
        </Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Icon name="file-upload" size={24} color="#0a4a3a" style={{ marginRight: 8 }} />
          <Text style={styles.uploadButtonText}>Upload Resume</Text>
        </TouchableOpacity>
      </View>
      {/* Person image for desktop/tablet */}
      {!isMobile && (
        <View style={styles.desktopImageContainer}>
          <Image
            source={require('../assets/images/resume-icon.png')}
            style={styles.desktopImage}
            resizeMode="contain"
          />
        </View>
      )}
      {/* Mobile version of the image */}
      {isMobile && (
        <View style={styles.mobileImageContainer}>
          <Image
            source={require('../assets/images/person-image2.png')}
            style={styles.mobileImage}
            resizeMode="contain"
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#0a4a3a',
    borderRadius: 12,
    marginVertical: 24,
    padding: 32,
    position: 'relative',
    overflow: 'visible',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contentWrapper: {
    flex: 1,
    maxWidth: '60%',
    zIndex: 2,
  },
  contentWrapperTablet: {
    maxWidth: '100%',
  },
  title: {
    color: 'white',
    fontWeight: '700',
    fontSize: 32,
    marginBottom: 24,
    lineHeight: 38,
  },
  titleMobile: {
    fontSize: 24,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  uploadButtonText: {
    color: '#0a4a3a',
    fontWeight: '500',
    fontSize: 16,
    textTransform: 'none',
  },
  desktopImageContainer: {
    position: 'absolute',
    right: 20,
    top: -100,
    width: 200,
    height: 400,
    display: 'flex',
    zIndex: 1,
  },
  desktopImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    right: 0,
    bottom: -20,
  },
  mobileImageContainer: {
    width: '100%',
    height: 250,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mobileImage: {
    height: '100%',
    width: 200,
    left: '50%',
    position: 'absolute',
    transform: [{ translateX: -100 }],
  },
});
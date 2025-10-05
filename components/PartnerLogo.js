import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, useWindowDimensions, Linking, Animated } from 'react-native';

const logos = [
  {
    name: "Upwork",
    src: require('../assets/images/upwork-logo.svg'),
    url: "https://www.upwork.com",
  },
  {
    name: "99designs",
    src: require('../assets/images/99designs-logo.svg'),
    url: "https://99designs.com",
  },
  {
    name: "Craigslist",
    src: require('../assets/images/craigslist-logo.svg'),
    url: "https://www.craigslist.org",
  },
  {
    name: "LinkedIn",
    src: require('../assets/images/linkedin-logo.svg'),
    url: "https://www.linkedin.com",
  },
  {
    name: "Indeed",
    src: require('../assets/images/indeed-logo.svg'),
    url: "https://www.indeed.com",
  },
];

export default function PartnerLogos() {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  return (
    <View style={styles.logoContainer}>
      <View style={styles.logoWrapper}>
        {logos.map((logo, idx) => (
          <TouchableOpacity
            key={logo.name}
            style={styles.animatedBox}
            onPress={() => Linking.openURL(logo.url)}
            activeOpacity={0.85}
          >
            <AnimatedLogo source={logo.src} isIndeed={logo.name === "Indeed"} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function AnimatedLogo({ source, isIndeed }) {
  // For pulse animation, you can use Animated API or skip for static logo
  return (
    <Image
      source={source}
      style={[
        styles.logoImage,
        isIndeed ? { height: 60 } : { height: 40 }
      ]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: '#fff',
    paddingVertical: 40,
    alignItems: 'center',
  },
  logoWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 1200,
    width: '98%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 36,
  },
  animatedBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 14,
    marginVertical: 8,
  },
  logoImage: {
    opacity: 0.7,
    filter: 'grayscale(100%)',
    transition: 'all 0.4s',
    paddingHorizontal: 12,
    paddingVertical: 0,
    width: 120,
    height: 40,
  },
});
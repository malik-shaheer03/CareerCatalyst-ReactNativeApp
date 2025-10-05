import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const steps = [
  {
    id: 1,
    title: "Complete Profile",
    description: "Build your professional profile to attract recruiters",
    icon: "person",
    color: "#FF6B6B",
  },
  {
    id: 2,
    title: "Upload Resume",
    description: "Add your CV for recruiters to review your experience",
    icon: "description",
    color: "#4ECDC4",
  },
  {
    id: 3,
    title: "Find Jobs",
    description: "Search for opportunities that match your skills",
    icon: "search",
    color: "#45B7D1",
  },
  {
    id: 4,
    title: "Apply & Connect",
    description: "Apply to your dream job and connect with employers",
    icon: "send",
    color: "#96CEB4",
  },
];

export default function StepsSection() {
  const renderStep = ({ item, index }) => (
    <View style={styles.stepCard}>
      <View style={styles.stepHeader}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{item.id}</Text>
        </View>
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{item.title}</Text>
        <Text style={styles.stepDescription}>{item.description}</Text>
      </View>
      {index < steps.length - 1 && <View style={styles.connector} />}
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <Text style={styles.sectionSubtitle}>
          Follow these simple steps to land your dream job
        </Text>
      </View>
      
      <FlatList
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#004D40',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    backgroundColor: '#004D40',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  connector: {
    position: 'absolute',
    bottom: -8,
    left: 43,
    width: 2,
    height: 16,
    backgroundColor: '#e0e0e0',
  },
});
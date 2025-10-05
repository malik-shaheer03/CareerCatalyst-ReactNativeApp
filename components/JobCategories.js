import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const categories = [
  {
    title: "Marketing & Communication",
    count: "200+ Jobs",
    icon: require('../assets/images/marketing-icon.png'),
    color: '#FF6B6B',
  },
  {
    title: "Design & Development",
    count: "200+ Jobs",
    icon: require('../assets/images/design-icon.png'),
    color: '#4ECDC4',
  },
  {
    title: "Human Research",
    count: "200+ Jobs",
    icon: require('../assets/images/human-research-icon.png'),
    color: '#45B7D1',
  },
  {
    title: "Finance Management",
    count: "200+ Jobs",
    icon: require('../assets/images/finance-icon.png'),
    color: '#96CEB4',
  },
  {
    title: "Security",
    count: "200+ Jobs",
    icon: require('../assets/images/security-icon.png'),
    color: '#FECA57',
  },
  {
    title: "Business & Consulting",
    count: "200+ Jobs",
    icon: require('../assets/images/business-icon.png'),
    color: '#FF9FF3',
  },
  {
    title: "Customer Support",
    count: "200+ Jobs",
    icon: require('../assets/images/customer-support-icon.png'),
    color: '#54A0FF',
  },
  {
    title: "Project Management",
    count: "200+ Jobs",
    icon: require('../assets/images/project-icon.png'),
    color: '#5F27CD',
  },
];

export default function JobCategories() {
  const renderCategory = ({ item }) => (
    <TouchableOpacity style={[styles.categoryCard, { borderLeftColor: item.color }]}>
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Image source={item.icon} style={styles.iconImage} resizeMode="contain" />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.categoryTitle}>{item.title}</Text>
        <Text style={styles.jobCount}>{item.count}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Job Categories</Text>
        <Text style={styles.sectionSubtitle}>
          Explore opportunities across different industries
        </Text>
      </View>
      
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.title}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

// Remove the formatTitle function as it's no longer needed

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#004D40',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 16,
  },
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconImage: {
    height: 24,
    width: 24,
  },
  contentContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  jobCount: {
    color: '#666',
    fontSize: 12,
  },
  separator: {
    height: 12,
  },
});
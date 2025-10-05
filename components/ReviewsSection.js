import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const reviews = [
  {
    id: 1,
    name: "Justin Blake",
    position: "Visual Designer",
    company: "Facebook",
    testimonial: "Found my dream job in just 2 weeks. The platform is intuitive and easy to use.",
    rating: 5,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    position: "Frontend Developer",
    company: "Google",
    testimonial: "CareerCatalyst transformed my job search. I landed my dream position within a month!",
    rating: 5,
  },
  {
    id: 3,
    name: "Michael Chen",
    position: "Product Manager",
    company: "Amazon",
    testimonial: "The AI-powered matching connected me with opportunities I wouldn't have found otherwise.",
    rating: 5,
  },
  {
    id: 4,
    name: "Emily Rodriguez",
    position: "UX Researcher",
    company: "Microsoft",
    testimonial: "The career coaching services were game-changing. Highly recommended!",
    rating: 5,
  },
];

export default function ReviewsSection() {
  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.avatarContainer}>
          <Icon name="person" size={32} color="#004D40" />
        </View>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{item.name}</Text>
          <Text style={styles.reviewerPosition}>{item.position}</Text>
          <Text style={styles.reviewerCompany}>{item.company}</Text>
        </View>
        <View style={styles.ratingContainer}>
          {[...Array(item.rating)].map((_, index) => (
            <Icon key={index} name="star" size={16} color="#FFD700" />
          ))}
        </View>
      </View>
      <Text style={styles.testimonial}>"{item.testimonial}"</Text>
    </View>
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Success Stories</Text>
        <Text style={styles.sectionSubtitle}>
          See what our users say about their job search experience
        </Text>
      </View>
      
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
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
  separator: {
    height: 16,
  },
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00A389',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8f5e8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  reviewerPosition: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  reviewerCompany: {
    fontSize: 12,
    color: '#004D40',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  testimonial: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
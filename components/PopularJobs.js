import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const jobsData = [
  {
    title: "Visual Designer",
    company: "Facebook",
    location: "Remote",
    type: "Full-Time",
    applicants: "10 Applied",
    capacity: "30 Capacity",
    salary: "$2000/month",
    logo: "facebook",
    color: "#1877F2",
  },
  {
    title: "Product Designer",
    company: "Google",
    location: "Remote",
    type: "Full-Time",
    applicants: "15 Applied",
    capacity: "25 Capacity",
    salary: "$2500/month",
    logo: "google",
    color: "#4285F4",
  },
  {
    title: "UI/UX Designer",
    company: "Twitter",
    location: "Remote",
    type: "Full-Time",
    applicants: "8 Applied",
    capacity: "20 Capacity",
    salary: "$1800/month",
    logo: "twitter",
    color: "#1DA1F2",
  },
  {
    title: "Frontend Developer",
    company: "Microsoft",
    location: "Remote",
    type: "Full-Time",
    applicants: "20 Applied",
    capacity: "40 Capacity",
    salary: "$2200/month",
    logo: "microsoft",
    color: "#00A4EF",
  },
  {
    title: "Backend Developer",
    company: "Amazon",
    location: "Remote",
    type: "Full-Time",
    applicants: "12 Applied",
    capacity: "35 Capacity",
    salary: "$2300/month",
    logo: "amazon",
    color: "#FF9900",
  },
  {
    title: "Full Stack Developer",
    company: "Apple",
    location: "Remote",
    type: "Full-Time",
    applicants: "25 Applied",
    capacity: "30 Capacity",
    salary: "$2800/month",
    logo: "apple",
    color: "#A2AAAD",
  },
  {
    title: "E-commerce Specialist",
    company: "Shopify",
    location: "Remote",
    type: "Full-Time",
    applicants: "18 Applied",
    capacity: "25 Capacity",
    salary: "$2400/month",
    logo: "shopping",
    color: "#7AB55C",
  },
  {
    title: "Data Analyst",
    company: "Netflix",
    location: "Remote",
    type: "Full-Time",
    applicants: "22 Applied",
    capacity: "30 Capacity",
    salary: "$2600/month",
    logo: "netflix",
    color: "#E50914",
  },
  {
    title: "Photographer",
    company: "Instagram",
    location: "Remote",
    type: "Part-Time",
    applicants: "15 Applied",
    capacity: "20 Capacity",
    salary: "$1900/month",
    logo: "instagram",
    color: "#C13584",
  },
];

const companyIconMap = {
  facebook: "facebook",
  google: "google",
  twitter: "twitter",
  microsoft: "microsoft",
  amazon: "amazon",
  apple: "apple",
  shopping: "cart",
  netflix: "netflix",
  instagram: "instagram",
};

export default function PopularJobs() {
  const [expanded, setExpanded] = useState(false);
  
  const displayJobs = expanded ? jobsData : jobsData.slice(0, 3);

  const renderJobCard = ({ item }) => (
    <JobCard job={item} />
  );

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.sectionTitle}>Popular Jobs</Text>
      </View>
      
      <Text style={styles.sectionSubtitle}>
        Featured opportunities from top companies
      </Text>

      <FlatList
        data={displayJobs}
        renderItem={renderJobCard}
        keyExtractor={(item, index) => `${item.company}-${item.title}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {!expanded && (
        <TouchableOpacity style={styles.showMoreButton} onPress={() => setExpanded(true)}>
          <Text style={styles.showMoreText}>Show More Jobs</Text>
          <Icon name="chevron-down" size={20} color="#004D40" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function JobCard({ job }) {
  const [hovered, setHovered] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.jobCard, hovered && styles.jobCardHovered]}
      activeOpacity={0.95}
      onPress={() => {}}
      onPressIn={() => setHovered(true)}
      onPressOut={() => setHovered(false)}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.companyLogo, { backgroundColor: job.color }]}>
          <Icon
            name={companyIconMap[job.logo] || "briefcase"}
            size={24}
            color="#fff"
          />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{job.company}</Text>
          <Text style={styles.locationText}>{job.location}</Text>
        </View>
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryText}>{job.salary.split("/")[0]}</Text>
          <Text style={styles.salaryPeriod}>/{job.salary.split("/")[1]}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <View style={styles.jobDetails}>
          <View style={styles.typeTag}>
            <Text style={styles.typeText}>{job.type}</Text>
          </View>
          <Text style={styles.applicantsText}>{job.applicants}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingVertical: 32,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#004D40',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  flatListContainer: {
    paddingBottom: 16,
  },
  separator: {
    height: 16,
  },
  jobCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  companyName: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  salaryContainer: {
    alignItems: 'flex-end',
  },
  salaryText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004D40',
  },
  salaryPeriod: {
    fontSize: 12,
    color: '#666',
  },
  cardBody: {
    marginBottom: 16,
  },
  jobTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  jobDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeTag: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#004D40',
    fontWeight: '500',
  },
  applicantsText: {
    fontSize: 12,
    color: '#666',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    backgroundColor: '#004D40',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  contactButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
  },
  showMoreText: {
    color: '#004D40',
    fontWeight: '600',
    fontSize: 14,
    marginRight: 4,
  },
});
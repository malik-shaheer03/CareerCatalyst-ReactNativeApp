import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Modal,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const jobData = [
  {
    id: '1',
    title: 'Visual Designer',
    company: 'Facebook',
    location: 'Remote',
    salary: '$2000/month',
    type: 'Full-time',
    posted: '2 days ago',
    applicants: 10,
    capacity: 30,
    saved: false,
    level: 'Senior',
    category: 'Design & Development',
  },
  {
    id: '2',
    title: 'Product Designer',
    company: 'Google',
    location: 'Remote',
    salary: '$2500/month',
    type: 'Full-time',
    posted: '1 week ago',
    applicants: 15,
    capacity: 25,
    saved: false,
    level: 'Senior',
    category: 'Design & Development',
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'Twitter',
    location: 'Remote',
    salary: '$1800/month',
    type: 'Full-time',
    posted: '3 days ago',
    applicants: 8,
    capacity: 20,
    saved: true,
    level: 'Mid',
    category: 'Design & Development',
  },
  {
    id: '4',
    title: 'Software Engineer',
    company: 'Microsoft',
    location: 'Remote',
    salary: '$3200/month',
    type: 'Full-time',
    posted: '1 day ago',
    applicants: 12,
    capacity: 15,
    saved: false,
    level: 'Senior',
    category: 'Design & Development',
  },
  {
    id: '5',
    title: 'Backend Developer',
    company: 'Amazon',
    location: 'Remote',
    salary: '$2800/month',
    type: 'Full-time',
    posted: '5 days ago',
    applicants: 18,
    capacity: 22,
    saved: false,
    level: 'Mid',
    category: 'Design & Development',
  },
  {
    id: '6',
    title: 'Project Manager',
    company: 'Asana',
    location: 'Remote',
    salary: '$3000/month',
    type: 'Full-time',
    posted: '1 week ago',
    applicants: 20,
    capacity: 25,
    saved: false,
    level: 'Senior',
    category: 'Project Management',
  },
  {
    id: '7',
    title: 'Financial Analyst',
    company: 'JP Morgan',
    location: 'Remote',
    salary: '$3600/month',
    type: 'Full-time',
    posted: '4 days ago',
    applicants: 19,
    capacity: 30,
    saved: false,
    level: 'Mid',
    category: 'Finance',
  },
  {
    id: '8',
    title: 'Marketing Intern',
    company: 'Spotify',
    location: 'Remote',
    salary: '$1500/month',
    type: 'Internship',
    posted: '2 days ago',
    applicants: 25,
    capacity: 40,
    saved: false,
    level: 'Entry',
    category: 'Marketing & Communication',
  },
  {
    id: '9',
    title: 'Content Creator',
    company: 'Netflix',
    location: 'Remote',
    salary: '$2600/month',
    type: 'Full-time',
    posted: '6 days ago',
    applicants: 22,
    capacity: 30,
    saved: false,
    level: 'Mid',
    category: 'Marketing & Communication',
  },
];

const filterCategories = [
  { key: 'type', label: 'Job Type', options: ['Full-time', 'Part-time', 'Internship', 'Contract'] },
  { key: 'category', label: 'Categories', options: ['Design & Development', 'Marketing & Communication', 'Finance', 'Project Management', 'Human Research'] },
  { key: 'level', label: 'Experience Level', options: ['Entry', 'Mid', 'Senior'] },
];

const quickFilters = ['Remote', 'Full-time', 'Senior Level', 'High Salary'];
const sortOptions = ['Most Recent', 'Highest Salary', 'Most Relevant'];

const popularLocations = [
  'Islamabad, Pakistan',
  'Lahore, Pakistan', 
  'Karachi, Pakistan',
  'New York, USA',
  'London, UK',
  'Toronto, Canada',
  'Sydney, Australia',
  'Remote',
];

export default function FindJobsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Getting location...');
  const [filteredJobs, setFilteredJobs] = useState(jobData);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('Most Recent');
  const [salaryRange, setSalaryRange] = useState([0, 4000]);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(true);

  // Auto-detect location on component mount
  useEffect(() => {
    const detectLocation = () => {
      setTimeout(() => {
        setLocation('Islamabad, Pakistan'); // Simulated current location
        setIsGettingLocation(false);
      }, 2000);
    };
    detectLocation();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [searchQuery, location, selectedJobTypes, selectedCategories, selectedLevels, sortBy, salaryRange]);

  const filterJobs = () => {
    let filtered = [...jobData];

    // Search filter - more comprehensive
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        job =>
          job.title.toLowerCase().includes(searchLower) ||
          job.company.toLowerCase().includes(searchLower) ||
          job.location.toLowerCase().includes(searchLower) ||
          job.category.toLowerCase().includes(searchLower) ||
          job.type.toLowerCase().includes(searchLower)
      );
    }

    // Location filter - only filter if user explicitly selects "Remote"
    if (location && location !== 'Getting location...' && location === 'Remote') {
      filtered = filtered.filter(job => {
        return job.location.toLowerCase().includes('remote');
      });
    }
    // For all other locations (including "Islamabad, Pakistan"), show all jobs

    // Job type filter
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter(job => selectedJobTypes.includes(job.type));
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(job => selectedCategories.includes(job.category));
    }

    // Experience level filter
    if (selectedLevels.length > 0) {
      filtered = filtered.filter(job => selectedLevels.includes(job.level));
    }

    // Salary range filter
    filtered = filtered.filter(job => {
      const salaryValue = parseInt(job.salary.replace(/[^0-9]/g, ''));
      return salaryValue >= salaryRange[0] && salaryValue <= salaryRange[1];
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Highest Salary':
          const salaryA = parseInt(a.salary.replace(/[^0-9]/g, ''));
          const salaryB = parseInt(b.salary.replace(/[^0-9]/g, ''));
          return salaryB - salaryA;
        case 'Most Relevant':
          return b.applicants - a.applicants;
        default: // Most Recent
          return new Date().getTime() - new Date().getTime(); // Simplified for demo
      }
    });

    setFilteredJobs(filtered);
  };

  const handleJobTypeChange = (type) => {
    if (selectedJobTypes.includes(type)) {
      setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
    } else {
      setSelectedJobTypes([...selectedJobTypes, type]);
    }
  };

  const handleCategoryChange = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleLevelChange = (level) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  const toggleFilter = (filterKey, value) => {
    if (filterKey === 'type') handleJobTypeChange(value);
    if (filterKey === 'category') handleCategoryChange(value);
    if (filterKey === 'level') handleLevelChange(value);
  };

  const clearAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSearchQuery('');
    // Don't clear location - keep it as is
    setSalaryRange([0, 4000]);
    setSortBy('Most Recent');
  };

  // Location handling functions
  const handleLocationClick = () => {
    setIsLocationDialogOpen(true);
  };

  const handleLocationDialogClose = () => {
    setIsLocationDialogOpen(false);
  };

  const handleLocationSelect = (selectedLocation: string) => {
    setLocation(selectedLocation);
    setIsLocationDialogOpen(false);
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    // Simulate getting current location
    setTimeout(() => {
      setLocation('Islamabad, Pakistan');
      setIsGettingLocation(false);
      setIsLocationDialogOpen(false);
    }, 2000);
  };

  const handleFindMoreJobs = () => {
    setExpanded(true);
  };

  const handleCollapse = () => {
    setExpanded(false);
  };

  // Get initial and additional jobs with modern animation
  const initialJobs = filteredJobs.slice(0, 6);
  const additionalJobs = filteredJobs.slice(6);
  const displayJobs = expanded ? filteredJobs : initialJobs;

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getCompanyIcon = (company) => {
    const iconMap = {
      Facebook: 'facebook',
      Google: 'google',
      Twitter: 'twitter',
      Microsoft: 'microsoft',
      Amazon: 'shopping',
      Asana: 'chart-timeline-variant',
      'JP Morgan': 'bank',
      Spotify: 'spotify',
      Netflix: 'netflix',
    };
    return iconMap[company] || 'briefcase';
  };

  const getCompanyColor = (company) => {
    const colorMap = {
      Facebook: '#1877F2',
      Google: '#4285F4',
      Twitter: '#1DA1F2',
      Microsoft: '#00BCF2',
      Amazon: '#FF9900',
      Asana: '#F06A6A',
      'JP Morgan': '#2E3F8F',
      Spotify: '#1DB954',
      Netflix: '#E50914',
    };
    return colorMap[company] || '#004D40';
  };

  const renderFilterCategory = ({ item }) => (
    <View style={styles.filterCategory}>
      <Text style={styles.filterCategoryTitle}>{item.label}</Text>
      <View style={styles.filterOptions}>
        {item.options.map(option => {
          let isSelected = false;
          if (item.key === 'type') isSelected = selectedJobTypes.includes(option);
          if (item.key === 'category') isSelected = selectedCategories.includes(option);
          if (item.key === 'level') isSelected = selectedLevels.includes(option);
          
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.filterOption,
                isSelected && styles.filterOptionActive,
              ]}
              onPress={() => toggleFilter(item.key, option)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  isSelected && styles.filterOptionTextActive,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderJobCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.jobCard} activeOpacity={0.7}>
      <View style={styles.jobHeader}>
        <View style={[styles.companyLogo, { backgroundColor: getCompanyColor(item.company) }]}>
          <Icon name={getCompanyIcon(item.company)} size={24} color="#fff" />
        </View>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.companyName}>{item.company}</Text>
          <View style={styles.jobMeta}>
            <Icon name="map-marker" size={12} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
            <View style={styles.jobTypeTag}>
              <Text style={styles.jobTypeTagText}>{item.type}</Text>
            </View>
          </View>
        </View>
        <View style={styles.salaryContainer}>
          <Text style={styles.salaryText}>{item.salary.split('/')[0]}</Text>
          <Text style={styles.salaryPeriod}>/{item.salary.split('/')[1]}</Text>
        </View>
      </View>
      
      <View style={styles.jobFooter}>
        <Text style={styles.applicantsText}>
          {item.applicants} Applied of {item.capacity} Capacity
        </Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.saveButton}>
            <Icon
              name={item.saved ? 'heart' : 'heart-outline'}
              size={20}
              color={item.saved ? '#E91E63' : '#666'}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#004D40', '#00695C', '#00796B']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
        >
        {/* Header with Logo */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={require('../../assets/images/white-logo-noBG.png')} style={styles.logoImage} />
            <Text style={styles.logoText}>CareerCatalyst</Text>
          </View>
        </View>
        {/* Search Section */}
        <View style={styles.searchSection}>
          {/* Job Title Search */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search jobs, companies..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          {/* Location Search - Below Search Field */}
          <TouchableOpacity style={styles.locationContainer} onPress={handleLocationClick}>
            {isGettingLocation ? (
              <ActivityIndicator size="small" color="#004D40" style={styles.locationIcon} />
            ) : (
              <Icon name="map-marker" size={20} color="#00A389" style={styles.locationIcon} />
            )}
            <Text style={[styles.locationText, isGettingLocation && styles.locationPlaceholder]}>
              {location}
            </Text>
          </TouchableOpacity>

          {/* Popular Search Text */}
          <Text style={styles.popularText}>• Popular Search: UI, Software Engineer</Text>
        </View>


      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredJobs.length} jobs found
        </Text>
        <TouchableOpacity 
          style={styles.filterToggleInline}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Icon name="tune" size={20} color="#004D40" />
          <Text style={styles.filterButtonText}>Filter</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayJobs}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.jobListContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="briefcase-search" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No jobs found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your search criteria or filters</Text>
            <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
              <Text style={styles.clearFiltersButtonText}>Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Find More Jobs / Collapse Button */}
      {filteredJobs.length > 6 && (
        <View style={styles.actionButtonsContainer}>
          {!expanded ? (
            <TouchableOpacity style={styles.findMoreButton} onPress={handleFindMoreJobs}>
              <Text style={styles.findMoreButtonText}>Find More Jobs</Text>
              <Icon name="chevron-down" size={20} color="#004D40" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.collapseButton} onPress={handleCollapse}>
              <Text style={styles.collapseButtonText}>Collapse</Text>
              <Icon name="chevron-up" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      )}
        </ScrollView>
      </SafeAreaView>

      {/* Location Modal */}
      <Modal
        visible={isLocationDialogOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={handleLocationDialogClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationDialog}>
            <Text style={styles.locationDialogTitle}>Select Location</Text>
            
            <TouchableOpacity style={styles.currentLocationButton} onPress={getCurrentLocation}>
              <Icon name="crosshairs-gps" size={20} color="#004D40" />
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Popular Locations</Text>
            <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
              {popularLocations.map((loc, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.locationListItem,
                    location === loc && styles.locationListItemSelected,
                  ]}
                  onPress={() => handleLocationSelect(loc)}
                >
                  <Text
                    style={[
                      styles.locationListText,
                      location === loc && styles.locationListTextSelected,
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.cancelButton} onPress={handleLocationDialogClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilters(false)}
      >
        <TouchableOpacity 
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilters(false)}
        >
          <BlurView intensity={20} tint="dark" style={styles.filterBlurOverlay}>
            <TouchableOpacity 
              style={styles.filterModalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>Filters</Text>
                <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
                <FlatList
                  data={filterCategories}
                  renderItem={renderFilterCategory}
                  keyExtractor={(item) => item.key}
                  scrollEnabled={false}
                />
              </ScrollView>
            </TouchableOpacity>
          </BlurView>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 0,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    height: 40,
    width: 40,
    marginRight: 10,
    resizeMode: 'contain',
  },
  logoText: {
    color: 'white',
    fontWeight: '800',
    fontSize: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#004D40',
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 15,
    color: '#004D40',
    flex: 1,
    fontWeight: '500',
  },
  locationPlaceholder: {
    color: '#999',
    fontStyle: 'italic',
  },
  popularText: {
    color: '#6B7280',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  filterToggle: {
    marginLeft: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  // Location Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDialog: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    width: '90%',
    maxWidth: 360,
    padding: 28,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationDialogTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
    color: '#004D40',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00A389',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentLocationText: {
    color: '#004D40',
    fontWeight: '700',
    fontSize: 17,
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 16,
  },
  locationList: {
    maxHeight: 220,
    marginBottom: 24,
  },
  locationListItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  locationListItemSelected: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
  },
  locationListText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '600',
  },
  locationListTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#00A389',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  // Filter Modal Styles
  filterModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBlurOverlay: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModalContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#004D40',
  },
  filterHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 16,
  },
  clearButtonText: {
    color: '#00A389',
    fontSize: 15,
    fontWeight: '700',
  },
  filterContent: {
    padding: 24,
    paddingBottom: 32,
  },
  filterCategory: {
    marginBottom: 20,
  },
  filterCategoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    marginBottom: 8,
    marginRight: 8,
  },
  filterOptionActive: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 20,
  },
  resultsCount: {
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterToggleInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#E8F5E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 100,
    justifyContent: 'center',
  },
  filterButtonText: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '700',
    marginLeft: 8,
  },
  jobListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120, // Increased padding for bottom tabs
    paddingTop: 10,
  },
  separator: {
    height: 16,
  },
  jobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  companyLogo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#004D40',
    marginBottom: 8,
    lineHeight: 26,
  },
  companyName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 10,
    fontWeight: '600',
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 14,
    fontWeight: '500',
  },
  jobTypeTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00A389',
  },
  jobTypeTagText: {
    fontSize: 12,
    color: '#00A389',
    fontWeight: '700',
  },
  salaryContainer: {
    alignItems: 'flex-end',
  },
  salaryText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#00A389',
  },
  salaryPeriod: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  applicantsText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButton: {
    padding: 8,
    marginRight: 12,
  },
  applyButton: {
    backgroundColor: '#00A389',
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: '#004D40',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  findMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  findMoreButtonText: {
    color: '#004D40',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 32,
    backgroundColor: '#00A389',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  collapseButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginRight: 10,
  },
});
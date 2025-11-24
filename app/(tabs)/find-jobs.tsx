import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import Header from '@/components/Header';
import JobCard from '@/components/find-jobs/JobCard';
import { getAllJobsForJobSeekers, type JobSeeker } from '@/lib/services/job-seeker-services';

const filterCategories = [
  { key: 'type', label: 'Job Type', options: ['Full-time', 'Part-time', 'Internship', 'Contract'] },
  { key: 'category', label: 'Categories', options: ['Design & Development', 'Marketing & Communication', 'Finance', 'Project Management', 'Human Research'] },
  { key: 'level', label: 'Experience Level', options: ['Entry', 'Mid', 'Senior'] },
];

const quickFilters = ['Remote', 'Full-time', 'Senior Level', 'High Salary'];
const sortOptions = ['Most Recent', 'Highest Salary', 'Most Relevant'];

// Mock job data that displays by default
const mockJobs: JobSeeker[] = [
  {
    id: '1',
    title: 'Senior React Developer',
    company: 'Google',
    location: 'Remote',
    type: 'Full-time',
    category: 'Design & Development',
    level: 'Senior',
    salary: '$2500/month',
    applicants: '22',
    capacity: '30',
    description: 'We are seeking a skilled React Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using React.js and related technologies.',
    requirements: ['3+ years React experience', 'JavaScript proficiency', 'Node.js knowledge'],
    benefits: ['Health insurance', 'Flexible hours', 'Remote work'],
    postedDate: new Date(),
    companyIcon: 'google',
    companyColor: '#4285F4',
    employerId: 'google-hr',
  },
  {
    id: '2',
    title: 'UI/UX Designer',
    company: 'Facebook',
    location: 'Menlo Park, CA',
    type: 'Full-time',
    category: 'Design & Development',
    level: 'Mid',
    salary: '$2200/month',
    applicants: '18',
    capacity: '25',
    description: 'Join our design team to create intuitive and engaging user experiences. You will work closely with product managers and developers to bring designs to life.',
    requirements: ['UI/UX design experience', 'Figma proficiency', 'Portfolio required'],
    benefits: ['Health benefits', 'Stock options', 'Free meals'],
    postedDate: new Date(),
    companyIcon: 'facebook',
    companyColor: '#1877F2',
    employerId: 'fb-design',
  },
  {
    id: '3',
    title: 'Frontend Developer',
    company: 'Microsoft',
    location: 'Redmond, WA',
    type: 'Contract',
    category: 'Design & Development',
    level: 'Entry',
    salary: '$1800/month',
    applicants: '14',
    capacity: '20',
    description: 'Entry-level position for a Frontend Developer to work on exciting web projects. Great opportunity to learn and grow with mentorship from senior developers.',
    requirements: ['HTML/CSS/JS basics', 'React knowledge', 'Eagerness to learn'],
    benefits: ['Training provided', 'Career development', 'Mentorship program'],
    postedDate: new Date(),
    companyIcon: 'microsoft',
    companyColor: '#00BCF2',
    employerId: 'ms-frontend',
  },
  {
    id: '4',
    title: 'Product Manager',
    company: 'Apple',
    location: 'Cupertino, CA',
    type: 'Full-time',
    category: 'Project Management',
    level: 'Senior',
    salary: '$3200/month',
    applicants: '30',
    capacity: '40',
    description: 'Lead product strategy and development for our innovative consumer products. Work with cross-functional teams to deliver world-class user experiences.',
    requirements: ['5+ years PM experience', 'Technical background', 'Leadership skills'],
    benefits: ['Competitive salary', 'Stock options', 'Product discounts'],
    postedDate: new Date(),
    companyIcon: 'apple',
    companyColor: '#A2AAAD',
    employerId: 'apple-pm',
  },
  {
    id: '5',
    title: 'Data Scientist',
    company: 'Netflix',
    location: 'Los Gatos, CA',
    type: 'Full-time',
    category: 'Design & Development',
    level: 'Mid',
    salary: '$2800/month',
    applicants: '25',
    capacity: '35',
    description: 'Analyze user data to drive content recommendations and platform improvements. Work with large datasets and machine learning algorithms.',
    requirements: ['Python/R experience', 'Machine learning knowledge', 'Statistics background'],
    benefits: ['Free Netflix', 'Health insurance', 'Learning budget'],
    postedDate: new Date(),
    companyIcon: 'netflix',
    companyColor: '#E50914',
    employerId: 'netflix-data',
  },
  {
    id: '6',
    title: 'Marketing Specialist',
    company: 'Amazon',
    location: 'Seattle, WA',
    type: 'Part-time',
    category: 'Marketing & Communication',
    level: 'Entry',
    salary: '$1500/month',
    applicants: '12',
    capacity: '18',
    description: 'Support marketing campaigns and digital advertising efforts. Great opportunity for someone starting their marketing career.',
    requirements: ['Marketing basics', 'Social media knowledge', 'Communication skills'],
    benefits: ['Employee discounts', 'Flexible schedule', 'Training'],
    postedDate: new Date(),
    companyIcon: 'amazon',
    companyColor: '#FF9900',
    employerId: 'amazon-marketing',
  },
];

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

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Animated Job Card Component
const AnimatedJobCard = ({ item, index }: { item: any; index: number }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Stagger animation
      useNativeDriver: true,
    }).start();
  }, [cardAnim, index]);

  const getCompanyIcon = (company: string) => {
    const iconMap: { [key: string]: string } = {
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

  const getCompanyColor = (company: string) => {
    const colorMap: { [key: string]: string } = {
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

  return (
    <Animated.View
      style={{
        opacity: cardAnim,
        transform: [
          {
            translateY: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
          {
            scale: cardAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      }}
    >
      <JobCard job={item} />
    </Animated.View>
  );
};

export default function FindJobsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Getting location...');
  const [jobs, setJobs] = useState<JobSeeker[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobSeeker[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
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

  // Handle job details navigation
  const handleViewJobDetails = (job: JobSeeker) => {
    router.push({
      pathname: '/(tabs)/job-details',
      params: {
        jobId: job.id,
        jobData: JSON.stringify(job),
      },
    });
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const additionalJobsAnim = useRef(new Animated.Value(0)).current;

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

  // Initialize animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Initialize additional jobs animation to 0 (collapsed state)
    additionalJobsAnim.setValue(0);
  }, []);

  // Load real jobs from Firebase
  const loadJobs = async () => {
    try {
      console.log('🔄 Loading jobs from Firebase...');
      setLoadingJobs(true);
      
      const realJobs = await getAllJobsForJobSeekers();
      console.log(`📋 Loaded ${realJobs.length} real jobs`);
      
      setJobs(realJobs);
      
      // If no real jobs exist, show a message
      if (realJobs.length === 0) {
        console.log('ℹ️ No jobs found in Firebase');
      }
      
    } catch (error) {
      console.error('❌ Error loading jobs:', error);
      // Fallback to mock data if Firebase fails
      console.log('🔄 Falling back to mock data...');
      setJobs(mockJobs);
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  // Refresh function for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadJobs();
    setRefreshing(false);
  };

  // Function to navigate to scraper page
  const navigateToScraper = () => {
    router.push('/(tabs)/job-scraper');
  };

  // Filter jobs client-side (keep UI logic)
  useEffect(() => {
    let filtered = [...jobs];
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job: any) =>
          job.title?.toLowerCase().includes(searchLower) ||
          job.company?.toLowerCase().includes(searchLower) ||
          job.location?.toLowerCase().includes(searchLower) ||
          job.category?.toLowerCase().includes(searchLower) ||
          job.type?.toLowerCase().includes(searchLower)
      );
    }
    if (location && location !== 'Getting location...' && location === 'Remote') {
      filtered = filtered.filter((job: any) => job.location?.toLowerCase().includes('remote'));
    }
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter((job: any) => selectedJobTypes.includes(job.type));
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((job: any) => selectedCategories.includes(job.category));
    }
    if (selectedLevels.length > 0) {
      filtered = filtered.filter((job: any) => selectedLevels.includes(job.level));
    }
    filtered = filtered.filter((job: any) => {
      const salaryValue = parseInt(job.salary?.replace(/[^0-9]/g, '') || '0');
      return salaryValue >= salaryRange[0] && salaryValue <= salaryRange[1];
    });
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'Highest Salary':
          const salaryA = parseInt(a.salary?.replace(/[^0-9]/g, '') || '0');
          const salaryB = parseInt(b.salary?.replace(/[^0-9]/g, '') || '0');
          return salaryB - salaryA;
        case 'Most Relevant':
          return (b.applicants || 0) - (a.applicants || 0);
        default:
          return 0;
      }
    });
    setFilteredJobs(filtered);
  }, [jobs, searchQuery, location, selectedJobTypes, selectedCategories, selectedLevels, sortBy, salaryRange]);

  const handleJobTypeChange = (type: string) => {
    if (selectedJobTypes.includes(type)) {
      setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
    } else {
      setSelectedJobTypes([...selectedJobTypes, type]);
    }
  };

  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleLevelChange = (level: string) => {
    if (selectedLevels.includes(level)) {
      setSelectedLevels(selectedLevels.filter(l => l !== level));
    } else {
      setSelectedLevels([...selectedLevels, level]);
    }
  };

  const toggleFilter = (filterKey: string, value: string) => {
    if (filterKey === 'type') handleJobTypeChange(value);
    if (filterKey === 'category') handleCategoryChange(value);
    if (filterKey === 'level') handleLevelChange(value);
  };

  const clearAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSearchQuery('');
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
    setTimeout(() => {
      setLocation('Islamabad, Pakistan');
      setIsGettingLocation(false);
      setIsLocationDialogOpen(false);
    }, 2000);
  };

  // Animation functions
  const animateExpand = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: { 
        type: 'easeInEaseOut', 
        property: 'opacity',
        springDamping: 0.7,
      },
      update: { 
        type: 'easeInEaseOut',
        springDamping: 0.7,
      },
      delete: { 
        type: 'easeInEaseOut', 
        property: 'opacity',
        springDamping: 0.7,
      },
    });
    
    setExpanded(true);
    
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(additionalJobsAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 50);
  };

  const animateCollapse = () => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(additionalJobsAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      LayoutAnimation.configureNext({
        duration: 300,
        create: { 
          type: 'easeInEaseOut', 
          property: 'opacity',
          springDamping: 0.7,
        },
        update: { 
          type: 'easeInEaseOut',
          springDamping: 0.7,
        },
        delete: { 
          type: 'easeInEaseOut', 
          property: 'opacity',
          springDamping: 0.7,
        },
      });
      
      setExpanded(false);
    });
  };

  const handleFindMoreJobs = () => {
    animateExpand();
  };

  const handleCollapse = () => {
    animateCollapse();
  };

  // Get initial and additional jobs with modern animation
  const initialJobs = filteredJobs.slice(0, 6);
  const additionalJobs = filteredJobs.slice(6);
  const displayJobs = expanded ? filteredJobs : initialJobs;

  const renderFilterCategory = ({ item }: { item: any }) => (
    <View style={styles.filterCategory}>
      <Text style={styles.filterCategoryTitle}>{item.label}</Text>
      <View style={styles.filterOptions}>
        {item.options.map((option: string) => {
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#004D40', '#00695C', '#00796B']}
        style={styles.gradientContainer}
      >
        <Header showProfileButton={true} />

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />}
        >
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Icon name="briefcase-search" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Find Your Dream Job</Text>
            <Text style={styles.heroSubtitle}>
              Discover opportunities that match your skills and career goals
            </Text>
          </View>

          <View style={styles.mainCard}>
            <View style={styles.searchSection}>
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

              <Text style={styles.popularText}>• Popular Search: UI, Software Engineer</Text>
            </View>

            {/* Job Scrapper Button */}
            <View style={styles.scrapperSection}>
              <TouchableOpacity 
                style={styles.scrapperButton}
                onPress={navigateToScraper}
              >
                <Icon name="cloud-download" size={20} color="#fff" />
                <Text style={styles.scrapperButtonText}>
                  Scrape Real Jobs
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.resultsHeader}>
              <View style={styles.resultsHeaderLeft}>
                <Icon name="briefcase" size={20} color="#00A389" />
                <Text style={styles.resultsCount}>
                  {filteredJobs.length} jobs found
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.filterButton}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Icon name="tune" size={20} color="#00A389" />
                <Text style={styles.filterButtonText}>Filter</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.jobsContainer}>
              {loadingJobs ? (
                <ActivityIndicator size="large" color="#00796B" style={{ marginTop: 32 }} />
              ) : displayJobs.length > 0 ? (
                displayJobs.map((item, index) => {
                  const isAdditionalJob = index >= 6;
                  return (
                    <Animated.View 
                      key={item.id || index}
                      style={isAdditionalJob ? {
                        opacity: additionalJobsAnim,
                        transform: [{
                          translateY: additionalJobsAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          })
                        }]
                      } : {}}
                    >
                      <JobCard 
                        job={item} 
                        onApply={() => handleViewJobDetails(item)}
                      />
                      {index < displayJobs.length - 1 && <View style={styles.separator} />}
                    </Animated.View>
                  );
                })
              ) : (
                <Animated.View 
                  style={[styles.emptyContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}
                >
                  <Icon name="briefcase-search" size={64} color="#ccc" />
                  <Text style={styles.emptyTitle}>
                    {jobs.length === 0 ? 'No jobs available yet' : 'No jobs found'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {jobs.length === 0 
                      ? 'Be the first to discover new opportunities! Pull down to refresh or check the job scraper for external listings.'
                      : 'Try adjusting your search criteria or filters'
                    }
                  </Text>
                  {jobs.length === 0 ? (
                    <TouchableOpacity 
                      style={styles.clearFiltersButton} 
                      onPress={() => onRefresh()}
                    >
                      <Icon name="refresh" size={16} color="#00A389" />
                      <Text style={styles.clearFiltersButtonText}>Refresh</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
                      <Text style={styles.clearFiltersButtonText}>Clear All Filters</Text>
                    </TouchableOpacity>
                  )}
                </Animated.View>
              )}
            </View>

            {filteredJobs.length > 6 && (
              <View style={styles.actionButtonsContainer}>
                {!expanded ? (
                  <TouchableOpacity style={styles.findMoreButton} onPress={handleFindMoreJobs}>
                    <Text style={styles.findMoreButtonText}>Find More Jobs</Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: rotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '180deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <Icon name="chevron-down" size={20} color="#00A389" />
                    </Animated.View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={styles.collapseButton} onPress={handleCollapse}>
                    <Text style={styles.collapseButtonText}>Collapse</Text>
                    <Animated.View
                      style={{
                        transform: [
                          {
                            rotate: rotateAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['180deg', '0deg'],
                            }),
                          },
                        ],
                      }}
                    >
                      <Icon name="chevron-up" size={20} color="#FFFFFF" />
                    </Animated.View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  mainCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  searchSection: {
    marginBottom: 24,
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
  scrapperSection: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  scrapperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scrapperButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 16,
    color: '#004D40',
    fontWeight: '700',
    marginLeft: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E8F5E8',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#00A389',
    fontWeight: '600',
    marginLeft: 6,
  },
  jobsContainer: {
    marginBottom: 20,
  },
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
  separator: {
    height: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    paddingBottom: 40,
  },
  findMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00A389',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  findMoreButtonText: {
    color: '#00A389',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  collapseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 24,
    backgroundColor: '#00A389',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  collapseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
});
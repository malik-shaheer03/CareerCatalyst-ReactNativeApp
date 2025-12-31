import Header from '@/components/Header';
import JobCard from '@/components/find-jobs/JobCard';
import { fetchJobs, ScrapeParams } from '@/services/jobScrapperService';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

// API Configuration
const API_BASE_URL = 'http://192.168.1.7:8000';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Animated Job Card Component
const AnimatedJobCard = ({ item, index, onJobSelect }: { item: any; index: number; onJobSelect: (job: any) => void }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 100, // Stagger animation
      useNativeDriver: true,
    }).start();
  }, [cardAnim, index]);

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
      <JobCard job={item} onApply={() => onJobSelect(item)} />
    </Animated.View>
  );
};

export default function JobScraperScreen() {
  const [params, setParams] = useState<ScrapeParams>({
    site_name: ['indeed', 'linkedin'],
    search_term: '',
    location: '',
    job_types: [],
    work_location_types: [],
  });

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showJobTypesModal, setShowJobTypesModal] = useState(false);
  const [showWorkLocationModal, setShowWorkLocationModal] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const jobTypeOptions = [
    'Full-time',
    'Part-time', 
    'Contract',
    'Temporary',
    'Internship',
  ];

  const workLocationOptions = [
    'Remote',
    'On-site',
    'Hybrid',
  ];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const availableSites = [
    { id: 'indeed', name: 'Indeed', color: '#2557a7' },
    { id: 'linkedin', name: 'LinkedIn', color: '#0077b5' },
  ];

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
  }, []);

  // Get user's current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsDetectingLocation(true);
      // Hide location suggestions when detecting
      setShowLocationSuggestions(false);
      
      // Request permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission denied');
        setIsDetectingLocation(false);
        // Could add an alert here to inform user about permission
        return;
      }

      // Get current position with higher accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;

      // Reverse geocode to get city name
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        // Format the location nicely
        const city = address.city || address.subregion;
        const region = address.region;
        const country = address.country || address.isoCountryCode;
        
        let currentLocation = '';
        if (city && region && country) {
          currentLocation = `${city}, ${region}, ${country}`;
        } else if (city && country) {
          currentLocation = `${city}, ${country}`;
        } else if (region && country) {
          currentLocation = `${region}, ${country}`;
        } else {
          currentLocation = country || 'Unknown Location';
        }
        
        // Always set the detected location immediately
        setParams(prev => ({ ...prev, location: currentLocation }));
        console.log('Location detected and updated:', currentLocation);
      } else {
        console.log('Could not determine location from coordinates');
      }
      
      setIsDetectingLocation(false);
    } catch (error) {
      console.log('Error getting location:', error);
      setIsDetectingLocation(false);
      // Could add user feedback here
    }
  };

  const handleSiteToggle = (siteId: string) => {
    const currentSites = Array.isArray(params.site_name) ? params.site_name : [params.site_name];
    const newSites = currentSites.includes(siteId)
      ? currentSites.filter(site => site !== siteId)
      : [...currentSites, siteId];
    
    setParams(prev => ({ ...prev, site_name: newSites }));
  };

  const handleJobTypeToggle = (jobType: string) => {
    const currentTypes = params.job_types || [];
    const newTypes = currentTypes.includes(jobType)
      ? currentTypes.filter(type => type !== jobType)
      : [...currentTypes, jobType];
    
    setParams(prev => ({ ...prev, job_types: newTypes }));
  };

  const handleWorkLocationToggle = (workLocationType: string) => {
    const currentTypes = params.work_location_types || [];
    const newTypes = currentTypes.includes(workLocationType)
      ? currentTypes.filter(type => type !== workLocationType)
      : [...currentTypes, workLocationType];
    
    setParams(prev => ({ ...prev, work_location_types: newTypes }));
  };

  const handleLocationChange = (text: string) => {
    setParams(prev => ({ ...prev, location: text }));
    if (text.length > 1) {
      fetchLocationSuggestions(text);
      setShowLocationSuggestions(true);
    } else {
      setShowLocationSuggestions(false);
    }
  };

  const selectLocation = (location: string) => {
    setParams(prev => ({ ...prev, location }));
    setShowLocationSuggestions(false);
  };

  const handleScrapeJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Scraping jobs with params:', params);
      const rawJobsData = await fetchJobs(params);
      console.log('Raw jobs received:', rawJobsData);
      setJobs(rawJobsData);
      
      if (rawJobsData.length === 0) {
        setError('No jobs found with the current search criteria.');
      }
    } catch (err: any) {
      console.error('Error scraping jobs:', err);
      setError(`Failed to scrape jobs: ${err.message || 'Unknown error'}`);
      
      // Fallback to sample data for demo
      const fallbackJobs = [
        {
          id: '1',
          title: 'Senior React Developer',
          company: 'Google',
          location: 'Remote',
          salary: '$120,000/year',
          site: 'indeed',
          date_posted: '2 days ago',
          description: 'We are looking for a senior React developer with 5+ years of experience.',
          job_url: 'https://example.com/job/1',
          is_remote: true,
          job_type: 'Full-time',
          source: { name: 'Indeed', logo: 'briefcase', color: '#2557a7' }
        }
      ];
      setJobs(fallbackJobs);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/locations?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const suggestions = await response.json();
        setLocationSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setLocationSuggestions([]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    handleScrapeJobs().finally(() => setRefreshing(false));
  };

  const handleJobSelect = (job: any) => {
    setSelectedJob(job);
    setShowJobDetailsModal(true);
  };

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
          {/* Hero Section */}
          <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.heroIconContainer}>
              <Icon name="cloud-search" size={48} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Job Scraper</Text>
            <Text style={styles.heroSubtitle}>
              Scrape real-time jobs from LinkedIn and Indeed
            </Text>
          </Animated.View>

          {/* Main Card */}
          <View style={styles.mainCard}>
            {/* Search Parameters */}
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>Search Parameters</Text>
              
              {/* Job Title/Keywords */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Job Title / Keywords *</Text>
                <View style={styles.searchContainer}>
                  <Icon name="briefcase-search" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={params.search_term}
                    onChangeText={(text) => setParams(prev => ({ ...prev, search_term: text }))}
                    placeholder="Software Engineer, Data Scientist, Product Manager"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>

              {/* Location with Suggestions */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.searchContainer}>
                  <Icon name="map-marker" size={20} color="#666" style={styles.searchIcon} />
                  <TextInput
                    style={styles.textInput}
                    value={params.location}
                    onChangeText={handleLocationChange}
                    placeholder={
                      isDetectingLocation 
                        ? "Detecting your location..." 
                        : params.location 
                        ? params.location 
                        : "Your location will be detected automatically"
                    }
                    placeholderTextColor="#999"
                    onFocus={() => {
                      if (params.location && params.location.length > 1) {
                        fetchLocationSuggestions(params.location);
                        setShowLocationSuggestions(true);
                      }
                    }}
                  />
                  {isDetectingLocation && (
                    <ActivityIndicator 
                      size="small" 
                      color="#00A389" 
                      style={styles.locationLoader} 
                    />
                  )}
                </View>

                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <FlatList
                      data={locationSuggestions}
                      keyExtractor={(item, index) => index.toString()}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.suggestionItem}
                          onPress={() => selectLocation(item)}
                        >
                          <Icon name="map-marker" size={16} color="#666" />
                          <Text style={styles.suggestionText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.suggestionsList}
                      nestedScrollEnabled={true}
                    />
                  </View>
                )}
              </View>

              {/* Job Types */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Job Types</Text>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowJobTypesModal(true)}
                >
                  <Icon name="briefcase" size={20} color="#00A389" />
                  <Text style={styles.filterButtonText}>
                    {params.job_types?.length ? `${params.job_types.length} selected` : 'Select job types'}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#00A389" />
                </TouchableOpacity>
                {params.job_types && params.job_types.length > 0 && (
                  <View style={styles.selectedItemsContainer}>
                    {params.job_types.map((type, index) => (
                      <View key={index} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{type}</Text>
                        <TouchableOpacity
                          onPress={() => handleJobTypeToggle(type)}
                          style={styles.removeButton}
                        >
                          <Icon name="close" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Work Location Types */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Work Location</Text>
                <TouchableOpacity
                  style={styles.filterButton}
                  onPress={() => setShowWorkLocationModal(true)}
                >
                  <Icon name="map-marker" size={20} color="#00A389" />
                  <Text style={styles.filterButtonText}>
                    {params.work_location_types?.length ? `${params.work_location_types.length} selected` : 'Select work location'}
                  </Text>
                  <Icon name="chevron-down" size={20} color="#00A389" />
                </TouchableOpacity>
                {params.work_location_types && params.work_location_types.length > 0 && (
                  <View style={styles.selectedItemsContainer}>
                    {params.work_location_types.map((type, index) => (
                      <View key={index} style={styles.selectedItem}>
                        <Text style={styles.selectedItemText}>{type}</Text>
                        <TouchableOpacity
                          onPress={() => handleWorkLocationToggle(type)}
                          style={styles.removeButton}
                        >
                          <Icon name="close" size={16} color="#666" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Job Platforms */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Job Platforms</Text>
                <View style={styles.sitesContainer}>
                  {availableSites.map(site => {
                    const selectedSites = Array.isArray(params.site_name) ? params.site_name : [params.site_name];
                    const isSelected = selectedSites.includes(site.id);
                    return (
                      <TouchableOpacity
                        key={site.id}
                        style={[
                          styles.siteChip,
                          isSelected && { backgroundColor: site.color },
                        ]}
                        onPress={() => handleSiteToggle(site.id)}
                      >
                        <View style={styles.siteChipContent}>
                          <Icon 
                            name={site.id === 'linkedin' ? 'linkedin' : 'briefcase'} 
                            size={18} 
                            color={isSelected ? '#fff' : site.color} 
                          />
                          <Text style={[
                            styles.siteChipText,
                            isSelected && styles.siteChipTextSelected,
                          ]}>
                            {site.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Scrape Button */}
              <TouchableOpacity
                style={styles.scrapeButton}
                onPress={handleScrapeJobs}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#ccc', '#aaa'] : ['#00A389', '#004D40']}
                  style={styles.scrapeButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Icon name="cloud-download" size={20} color="#fff" />
                  )}
                  <Text style={styles.scrapeButtonText}>
                    {loading ? 'Scraping Jobs...' : 'Scrape Jobs'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Error Display */}
            {error && (
              <View style={styles.errorCard}>
                <Icon name="alert-circle" size={24} color="#f44336" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Results Section */}
            {jobs.length > 0 && (
              <View style={styles.resultsSection}>
                <View style={styles.resultsHeader}>
                  <View style={styles.resultsHeaderLeft}>
                    <Icon name="briefcase" size={20} color="#00A389" />
                    <Text style={styles.resultsCount}>
                      {jobs.length} jobs scraped
                    </Text>
                  </View>
                  <Text style={styles.resultsSubtitle}>
                    From {Array.isArray(params.site_name) ? params.site_name.join(', ') : params.site_name}
                  </Text>
                </View>

                <View style={styles.jobsContainer}>
                  {jobs.map((item, index) => (
                    <AnimatedJobCard 
                      key={item.id} 
                      item={item} 
                      index={index} 
                      onJobSelect={handleJobSelect}
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Job Types Modal */}
        <Modal
          visible={showJobTypesModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowJobTypesModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowJobTypesModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Job Types</Text>
              </View>
              
              <View style={styles.jobTypesGrid}>
                {jobTypeOptions.map((type) => {
                  const isSelected = params.job_types?.includes(type) || false;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.jobTypeOption,
                        isSelected && styles.jobTypeOptionSelected,
                      ]}
                      onPress={() => handleJobTypeToggle(type)}
                    >
                      <Text style={[
                        styles.jobTypeOptionText,
                        isSelected && styles.jobTypeOptionTextSelected,
                      ]}>
                        {type}
                      </Text>
                      {isSelected && (
                        <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setShowJobTypesModal(false)}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Work Location Types Modal */}
        <Modal
          visible={showWorkLocationModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowWorkLocationModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowWorkLocationModal(false)}
          >
            <TouchableOpacity 
              style={styles.modalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Work Location</Text>
              </View>
              
              <View style={styles.jobTypesGrid}>
                {workLocationOptions.map((type) => {
                  const isSelected = params.work_location_types?.includes(type) || false;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.jobTypeOption,
                        isSelected && styles.jobTypeOptionSelected,
                      ]}
                      onPress={() => handleWorkLocationToggle(type)}
                    >
                      <Text style={[
                        styles.jobTypeOptionText,
                        isSelected && styles.jobTypeOptionTextSelected,
                      ]}>
                        {type}
                      </Text>
                      {isSelected && (
                        <Icon name="check" size={16} color="#fff" style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
              
              <TouchableOpacity
                style={styles.modalDoneButton}
                onPress={() => setShowWorkLocationModal(false)}
              >
                <Text style={styles.modalDoneButtonText}>Done</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* Job Details Modal */}
        <Modal
          visible={showJobDetailsModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowJobDetailsModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowJobDetailsModal(false)}
          >
            <TouchableOpacity 
              style={styles.jobDetailsModalContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Job Details</Text>
              </View>
              
              {selectedJob && (
                <ScrollView 
                  style={styles.jobDetailsContent} 
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 0 }}
                >
                  {/* Job Header */}
                  <View style={styles.jobDetailsHeader}>
                    <View style={styles.companyLogoContainer}>
                      <View style={styles.companyLogo}>
                        <Text style={styles.companyLogoText}>
                          {selectedJob.company?.charAt(0)?.toUpperCase() || 'C'}
                        </Text>
                      </View>
                      <View style={styles.jobHeaderInfo}>
                        <Text style={styles.jobDetailsTitle}>{selectedJob.title}</Text>
                        <Text style={styles.jobDetailsCompany}>{selectedJob.company}</Text>
                        <View style={styles.jobDetailsMetaRow}>
                          <Icon name="map-marker" size={14} color="#666" />
                          <Text style={styles.jobDetailsMeta}>{selectedJob.location}</Text>
                          {selectedJob.job_type && (
                            <View style={styles.jobTypeChip}>
                              <Text style={styles.jobTypeChipText}>{selectedJob.job_type}</Text>
                            </View>
                          )}
                        </View>
                        {selectedJob.salary && (
                          <View style={styles.salaryContainer}>
                            <Text style={styles.jobDetailsSalary}>{selectedJob.salary}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Job Description */}
                  <View style={styles.sectionDivider} />
                  <View style={styles.jobDetailsSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Icon name="file-document-outline" size={20} color="#00796B" />
                      <Text style={styles.jobDetailsSectionTitle}>Job Description</Text>
                    </View>
                    <Text style={styles.jobDetailsSectionContent}>
                      {selectedJob.description || 'No description available'}
                    </Text>
                  </View>

                  {/* Required Skills */}
                  {selectedJob.skills && selectedJob.skills.length > 0 && (
                    <>
                      <View style={styles.sectionDivider} />
                      <View style={styles.jobDetailsSection}>
                        <View style={styles.sectionHeaderRow}>
                          <Icon name="brain" size={20} color="#00796B" />
                          <Text style={styles.jobDetailsSectionTitle}>Required Skills</Text>
                        </View>
                        <View style={styles.skillsContainer}>
                          {selectedJob.skills.map((skill: string, index: number) => (
                            <View key={index} style={styles.modernSkillTag}>
                              <Text style={styles.modernSkillTagText}>{skill}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </>
                  )}

                  {/* Job Source */}
                  <View style={styles.sectionDivider} />
                  <View style={styles.jobDetailsSection}>
                    <View style={styles.sectionHeaderRow}>
                      <Icon name="link" size={20} color="#00796B" />
                      <Text style={styles.jobDetailsSectionTitle}>Source</Text>
                    </View>
                    <View style={styles.modernSourceRow}>
                      <View style={styles.sourceIconContainer}>
                        <Icon 
                          name={selectedJob.site === 'linkedin' ? 'linkedin' : 'briefcase'} 
                          size={18} 
                          color="#fff"
                        />
                      </View>
                      <View style={styles.sourceInfo}>
                        <Text style={[styles.sourceText, { color: selectedJob.site === 'linkedin' ? '#0077b5' : '#2557a7' }]}>
                          {selectedJob.site === 'linkedin' ? 'LinkedIn' : 'Indeed'}
                        </Text>
                        <Text style={styles.datePosted}>Posted {selectedJob.date_posted}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Apply Button */}
                  {selectedJob.job_url && (
                    <View style={styles.applyButtonContainer}>
                      <TouchableOpacity 
                        style={styles.applyJobButton}
                        onPress={() => {
                          if (selectedJob.job_url) {
                            Linking.openURL(selectedJob.job_url).catch(err => 
                              console.error('Failed to open URL:', err)
                            );
                          }
                        }}
                      >
                        <Icon name="open-in-new" size={22} color="#fff" />
                        <Text style={styles.applyJobButtonText}>
                          Apply on {selectedJob.site === 'linkedin' ? 'LinkedIn' : 'Indeed'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#004D40',
  },
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    minHeight: 500,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004D40',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  locationLoader: {
    marginLeft: 8,
  },
  detectLocationButton: {
    padding: 8,
    marginLeft: 4,
  },
  locationStatusText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  textInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#374151',
  },
  sitesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  siteChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
  },
  siteChipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  siteChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  siteChipTextSelected: {
    color: '#fff',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: 16,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A389',
  },
  advancedOptions: {
    marginTop: 16,
  },
  scrapeButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrapeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  scrapeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  resultsSection: {
    paddingHorizontal: 20,
  },
  resultsHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultsCount: {
    fontSize: 18,
    color: '#004D40',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  jobsContainer: {
    gap: 16,
  },
  // Location Suggestions
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  // Filter Button
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterButtonText: {
    fontSize: 16,
    color: '#00A389',
    fontWeight: '500',
    flex: 1,
    marginLeft: 8,
  },
  // Selected Items
  selectedItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#00A389',
  },
  selectedItemText: {
    fontSize: 14,
    color: '#00A389',
    fontWeight: '500',
  },
  removeButton: {
    marginLeft: 6,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '90%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  modalHeader: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004D40',
  },
  jobTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  jobTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 100,
    justifyContent: 'center',
  },
  jobTypeOptionSelected: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
  },
  jobTypeOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  jobTypeOptionTextSelected: {
    color: '#FFFFFF',
  },
  checkIcon: {
    marginLeft: 6,
  },
  modalDoneButton: {
    backgroundColor: '#00A389',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalDoneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Job Details Modal Styles
  jobDetailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    maxHeight: '88%',
    width: '92%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  jobDetailsContent: {
    maxHeight: '70%',
  },
  jobDetailsHeader: {
    padding: 20,
    backgroundColor: '#F8FFFE',
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F2',
  },
  companyLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#00796B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  companyLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  jobHeaderInfo: {
    flex: 1,
  },
  jobDetailsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
    lineHeight: 28,
  },
  jobDetailsCompany: {
    fontSize: 16,
    color: '#00796B',
    marginBottom: 8,
    fontWeight: '600',
  },
  jobDetailsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobDetailsMeta: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  jobTypeChip: {
    backgroundColor: '#E0F7FA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 12,
  },
  jobTypeChipText: {
    fontSize: 12,
    color: '#00695C',
    fontWeight: '600',
  },
  salaryContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  jobDetailsSalary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  jobDetailsSection: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionDivider: {
    height: 8,
    backgroundColor: '#F8FFFE',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  jobDetailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  jobDetailsSectionContent: {
    fontSize: 14,
    color: '#4A4A4A',
    lineHeight: 22,
    marginTop: 4,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  modernSkillTag: {
    backgroundColor: '#F3E5F5',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  modernSkillTagText: {
    fontSize: 12,
    color: '#7B1FA2',
    fontWeight: '500',
  },
  modernSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  sourceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00796B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  datePosted: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
  applyJobButton: {
    backgroundColor: '#00796B',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#00796B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  applyButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  applyJobButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
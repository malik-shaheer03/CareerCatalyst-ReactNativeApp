import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const popularLocations = [
  "Islamabad, Pakistan",
  "Lahore, Pakistan",
  "Karachi, Pakistan",
  "New York, USA",
  "London, UK",
  "Toronto, Canada",
  "Sydney, Australia",
];

export default function HeroSection() {
  const [location, setLocation] = useState("Islamabad, Pakistan");
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const window = useWindowDimensions();
  const isMobile = window.width < 700;

  // Show dialog
  const handleLocationClick = () => setIsLocationDialogOpen(true);
  const handleLocationDialogClose = () => setIsLocationDialogOpen(false);
  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation);
    setIsLocationDialogOpen(false);
  };

  // Geolocation
  const getNearbyLocations = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
      );
      const data = await response.json();

      let mainLocation = "Unknown Location";
      if (data.address) {
        const city = data.address.city || data.address.town || data.address.village || data.address.county;
        const country = data.address.country;
        if (city && country) {
          mainLocation = `${city}, ${country}`;
        }
      }
      setLocation(mainLocation);

      const nearbyResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=cities+near&lat=${latitude}&lon=${longitude}&addressdetails=1&limit=5`
      );
      const nearbyData = await nearbyResponse.json();

      const locations = nearbyData
        .map((item) => {
          const city = item.address?.city || item.address?.town || item.address?.village || item.address?.county;
          const country = item.address?.country;
          if (city && country) {
            return `${city}, ${country}`;
          }
          return null;
        })
        .filter(Boolean)
        .filter((loc) => loc !== mainLocation);

      setNearbyLocations(locations);
    } catch (error) {
      setNearbyLocations([]);
    }
  };

  // Fetch user's location
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setNearbyLocations([]);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        getNearbyLocations(latitude, longitude).finally(() => setIsGettingLocation(false));
      },
      (error) => {
        setLocation("Location access denied");
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <View style={styles.heroContainer}>
      <Text style={styles.heading}>
        Find Your Dream Job Easy &{"\n"}Fast with CareerCatalyst
      </Text>
      <Text style={styles.subtitle}>
        Search and find your dream job is now easier than ever. You just browse and find job if you need it.
      </Text>

      <View style={[
        styles.searchContainer,
        isMobile ? styles.searchContainerMobile : styles.searchContainerDesktop,
      ]}>
        {/* 1. Search Input */}
        <View style={[
          styles.inputWrapper,
          isMobile ? styles.inputWrapperMobile : styles.inputWrapperDesktop
        ]}>
          <Icon name="search" size={22} color="#757575" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Job Title or Keyword"
            placeholderTextColor="#757575"
          />
        </View>

        {/* 2. Location Input */}
        <TouchableOpacity
          style={[
            styles.inputWrapper,
            isMobile ? styles.inputWrapperMobile : styles.inputWrapperDesktop
          ]}
          onPress={handleLocationClick}
          activeOpacity={0.7}
        >
          <Icon name="location-on" size={22} color="#757575" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={location}
            editable={false}
            selectTextOnFocus={false}
            placeholderTextColor="#757575"
          />
        </TouchableOpacity>

        {/* 3. Search Button */}
        <TouchableOpacity
          style={[
            styles.searchButton,
            isMobile ? styles.searchButtonMobile : styles.searchButtonDesktop
          ]}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.popularText}>• Popular Search: UI, Software Engineer</Text>

      {/* Location Dialog */}
      <Modal
        visible={isLocationDialogOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={handleLocationDialogClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Choose Location</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}
                disabled={isGettingLocation}
              >
                {isGettingLocation
                  ? <ActivityIndicator size="small" color="#004D40" style={{ marginRight: 8 }} />
                  : <Icon name="my-location" size={22} color="#004D40" style={{ marginRight: 8 }} />
                }
                <Text style={{ color: '#004D40', fontWeight: 'bold' }}>
                  {isGettingLocation ? "Getting your location..." : "Use my current location"}
                </Text>
              </TouchableOpacity>

              {nearbyLocations.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Nearby Locations</Text>
                  {nearbyLocations.map((loc) => (
                    <TouchableOpacity
                      key={loc}
                      style={styles.locationListItem}
                      onPress={() => handleLocationSelect(loc)}
                    >
                      <Text style={styles.locationListText}>{loc}</Text>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.divider} />
                </>
              )}

              <Text style={styles.sectionTitle}>Popular Locations</Text>
              {popularLocations.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={styles.locationListItem}
                  onPress={() => handleLocationSelect(loc)}
                >
                  <Text style={styles.locationListText}>{loc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.cancelButton} onPress={handleLocationDialogClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  heroContainer: {
    backgroundColor: "#004D40",
    paddingTop: 48,
    paddingBottom: 32,
    paddingHorizontal: 12,
    alignItems: "center",
    minHeight: 400,
  },
  heading: {
    color: "white",
    fontWeight: "bold",
    fontSize: 32,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "white",
    opacity: 0.9,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 340,
  },

  // Responsive search bar container
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  searchContainerDesktop: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 48,
    padding: 6,
    justifyContent: 'center',
    maxWidth: 950,
    alignSelf: 'center',
    // Makes sure the bar doesn't overflow
  },
  searchContainerMobile: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 8,
    justifyContent: 'center',
    width: '98%',
    alignSelf: 'center',
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 48,
    borderWidth: 0,
    paddingHorizontal: 8,
    marginBottom: 0,
    marginHorizontal: 2,
  },
  inputWrapperDesktop: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputWrapperMobile: {
    width: '100%',
    marginVertical: 5,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    height: 42,
    fontSize: 16,
    color: "#222",
    backgroundColor: "white",
    borderRadius: 48,
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  searchButton: {
    backgroundColor: "#004D40",
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDesktop: {
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginLeft: 4,
    alignSelf: 'center',
  },
  searchButtonMobile: {
    width: '100%',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 0,
    alignSelf: 'center',
  },
  searchButtonText: {
    color: "white",
    fontWeight: "500",
    fontSize: 16,
    textAlign: "center",
  },
  popularText: {
    color: "white",
    marginTop: 24,
    fontStyle: "italic",
    opacity: 0.8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.23)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: Dimensions.get('window').width * 0.85,
    padding: 24,
    elevation: 8,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
    color: '#004D40',
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2f1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#004D40',
  },
  locationListItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#f5f5f5',
    marginBottom: 6,
  },
  locationListText: {
    fontSize: 16,
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  cancelButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#004D40',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
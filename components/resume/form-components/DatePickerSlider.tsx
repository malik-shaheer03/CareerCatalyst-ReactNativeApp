import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Platform,
  Animated
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface DatePickerSliderProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  error?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

const DatePickerSlider: React.FC<DatePickerSliderProps> = ({
  value,
  onChange,
  placeholder = "Select Date",
  label,
  disabled = false,
  error,
  maximumDate = new Date(2035, 11, 31), // Allow years up to 2035
  minimumDate = new Date(1950, 0, 1)
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  });

  const [year, setYear] = useState(() => {
    const initialYear = selectedDate.getFullYear();
    return Math.max(Math.min(initialYear, 2100), 1900);
  });
  const [month, setMonth] = useState(() => {
    const initialMonth = selectedDate.getMonth();
    return Math.max(Math.min(initialMonth, 11), 0);
  });
  const [day, setDay] = useState(() => {
    const initialDay = selectedDate.getDate();
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    return Math.max(Math.min(initialDay, daysInMonth), 1);
  });

  const translateY = useRef(new Animated.Value(screenHeight)).current;

  // Generate years array
  const years = Array.from(
    { length: maximumDate.getFullYear() - minimumDate.getFullYear() + 1 },
    (_, i) => minimumDate.getFullYear() + i
  ).reverse();

  // Generate months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate days array based on selected year and month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Ensure month is always a number
  const monthNumber = typeof month === 'string' ? months.indexOf(month) : month;
  const daysInMonth = getDaysInMonth(year, monthNumber);
  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  );
  
  console.log('Days array generated:', { 
    year, 
    month, 
    daysInMonth, 
    daysLength: days.length, 
    selectedDay: day,
    daysArray: days.slice(0, 5) // Show first 5 days for debugging
  });

  useEffect(() => {
    if (isVisible) {
      // Ensure day is valid when modal opens
      const daysInSelectedMonth = getDaysInMonth(year, month);
      if (day > daysInSelectedMonth) {
        setDay(daysInSelectedMonth);
      }
      
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, year, month, day]);

  // Handle month changes - validate day when month changes
  useEffect(() => {
    const currentMonthNumber = typeof month === 'string' ? months.indexOf(month) : month;
    const daysInSelectedMonth = getDaysInMonth(year, currentMonthNumber);
    console.log('Month changed:', { year, month, monthNumber: currentMonthNumber, day, daysInSelectedMonth });
    
    // Only adjust day if it's invalid for the new month
    if (day > daysInSelectedMonth) {
      console.log('Adjusting day from', day, 'to', daysInSelectedMonth);
      setDay(daysInSelectedMonth);
    }
  }, [month, year]); // Removed day from dependencies

  // Handle year changes - validate day when year changes (for leap years)
  useEffect(() => {
    const currentMonthNumber = typeof month === 'string' ? months.indexOf(month) : month;
    const daysInSelectedMonth = getDaysInMonth(year, currentMonthNumber);
    console.log('Year changed:', { year, month, monthNumber: currentMonthNumber, day, daysInSelectedMonth });
    
    // Only adjust day if it's invalid for the new month
    if (day > daysInSelectedMonth) {
      console.log('Adjusting day from', day, 'to', daysInSelectedMonth);
      setDay(daysInSelectedMonth);
    }
  }, [year, month]); // Removed day from dependencies

  const handleConfirm = () => {
    // Validate the date values before creating the Date object
    const currentMonthNumber = typeof month === 'string' ? months.indexOf(month) : month;
    const daysInMonth = getDaysInMonth(year, currentMonthNumber);
    const validDay = Math.min(Math.max(day, 1), daysInMonth);
    const validMonth = Math.min(Math.max(currentMonthNumber, 0), 11);
    const validYear = Math.max(year, 1900);
    
    console.log('Creating date with values:', { 
      original: { year, month, day }, 
      validated: { validYear, validMonth, validDay } 
    });
    
    // Create date in local timezone to avoid timezone issues
    const newDate = new Date(validYear, validMonth, validDay, 12, 0, 0, 0);
    
    console.log('Created date:', {
      newDate: newDate.toString(),
      year: newDate.getFullYear(),
      month: newDate.getMonth(),
      day: newDate.getDate(),
      isoString: newDate.toISOString().split('T')[0]
    });
    
    // Check if the date is valid
    if (isNaN(newDate.getTime())) {
      console.error('Invalid date created:', { validYear, validMonth, validDay });
      // Fallback to current date
      const fallbackDate = new Date();
      setSelectedDate(fallbackDate);
      onChange(fallbackDate.toISOString().split('T')[0]);
    } else {
      setSelectedDate(newDate);
      onChange(newDate.toISOString().split('T')[0]);
    }
    
    setIsVisible(false);
  };

  const handleCancel = () => {
    setIsVisible(false);
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderModalContent = () => (
    <>
      {/* Header */}
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.modalButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Select Date</Text>
        <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
          <Text style={[styles.modalButton, styles.modalButtonConfirm]}>Done</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      <View style={styles.pickerContainer}>
        {renderPickerColumn(
          years,
          year,
          setYear,
          'Year',
          false
        )}
        {renderPickerColumn(
          months,
          month,
          setMonth,
          'Month',
          false
        )}
        {renderPickerColumn(
          days,
          day,
          setDay,
          'Day',
          true
        )}
      </View>
    </>
  );

  const renderPickerColumn = (
    data: (string | number)[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    unit: string,
    isLast: boolean = false
  ) => {
    const itemHeight = 60;
    const visibleItems = 4;
    const totalHeight = data.length * itemHeight;

    return (
      <View style={isLast ? styles.pickerColumnLast : styles.pickerColumn}>
        <Text style={styles.pickerColumnLabel}>{unit}</Text>
        <ScrollView
          style={styles.pickerScrollView}
          showsVerticalScrollIndicator={false}
          snapToInterval={itemHeight}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: itemHeight * 2,
          }}
        >
          {data.map((item, index) => {
            // Check if this item is selected
            let isSelected = false;
            if (unit === 'Month') {
              // For months, compare the month string with the selected month index
              isSelected = months[selectedValue] === item;
            } else {
              // For years and days, direct comparison
              isSelected = selectedValue === item;
            }
            
            return (
            <TouchableOpacity
              key={index}
              style={[
                styles.pickerItem,
                { height: itemHeight },
                isSelected && styles.pickerItemSelected
              ]}
              onPress={() => {
                let newValue: number;
                
                // Convert month string to number if needed
                if (unit === 'Month' && typeof item === 'string') {
                  newValue = months.indexOf(item);
                } else {
                  newValue = item as number;
                }
                
                console.log('Picker item selected:', { unit, newValue, currentValue: selectedValue, originalItem: item });
                
                // Validate the value before setting
                if (unit === 'Year' && (newValue < 1900 || newValue > 2100)) {
                  console.log('Invalid year, ignoring');
                  return;
                }
                if (unit === 'Month' && (newValue < 0 || newValue > 11)) {
                  console.log('Invalid month, ignoring');
                  return;
                }
                if (unit === 'Day' && (newValue < 1 || newValue > 31)) {
                  console.log('Invalid day, ignoring');
                  return;
                }
                
                onValueChange(newValue);
              }}
            >
              <Text style={[
                styles.pickerItemText,
                isSelected && styles.pickerItemTextSelected
              ]}>
                {item}
              </Text>
            </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
      >
        <Text style={[
          styles.inputText,
          !value && styles.inputPlaceholder,
          disabled && styles.inputTextDisabled
        ]}>
          {value ? formatDisplayDate(new Date(value)) : placeholder}
        </Text>
        <Icon 
          name="calendar" 
          size={20} 
          color={disabled ? '#ccc' : '#666'} 
        />
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={handleCancel}
          />
          
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ translateY }] }
            ]}
          >
            {/* Simple Clean Background */}
            <View style={styles.cleanModalBackground}>
              {renderModalContent()}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  inputContainerError: {
    borderColor: '#e74c3c',
  },
  inputContainerDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  inputPlaceholder: {
    color: '#999',
  },
  inputTextDisabled: {
    color: '#ccc',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.45,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  cleanModalBackground: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
  },
  modalButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  modalButtonConfirm: {
    color: '#004D40',
    fontWeight: '700',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 200,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    minWidth: 90,
  },
  pickerColumnLast: {
    flex: 1,
    marginHorizontal: 0,
    paddingHorizontal: 6,
    borderRightWidth: 0,
    minWidth: 90,
  },
  pickerColumnLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
    textAlign: 'center',
    marginBottom: 4,
    opacity: 0.8,
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 1,
    paddingVertical: 6,
    height: 60,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(0, 77, 64, 0.1)',
    borderRadius: 6,
    marginHorizontal: 1,
  },
  pickerItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    fontWeight: '700',
    color: '#004D40',
  },
});

export default DatePickerSlider;

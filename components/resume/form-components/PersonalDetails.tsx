import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { PersonalDetails as PersonalDetailsType } from '@/lib/resume';

// Types
export interface PersonalDetailsProps {
  personalDetails: PersonalDetailsType;
  onUpdate: (details: PersonalDetailsType) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

// Main Personal Details Component
const PersonalDetails: React.FC<PersonalDetailsProps> = ({
  personalDetails,
  onUpdate,
  onSave,
  isLoading = false,
  isSaving = false,
  disabled = false
}) => {
  const [formData, setFormData] = useState<PersonalDetailsType>(personalDetails);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Update form data when prop changes
  useEffect(() => {
    setFormData(personalDetails);
  }, [personalDetails]);

  // Validation - Only format validation, no required field validation
  const validateField = useCallback((field: keyof PersonalDetailsType, value: string) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'email':
        if (value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (value.trim() && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;
      default:
        // Clear any existing errors for other fields
        delete newErrors[field];
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [errors]);

  // Handle input change with optimized updates
  const handleInputChange = useCallback((field: keyof PersonalDetailsType, value: string) => {
    setFormData(prev => {
      const newFormData = { ...prev, [field]: value };
      // Update parent immediately but with throttling
      onUpdate(newFormData);
      return newFormData;
    });
    validateField(field, value);
  }, [validateField, onUpdate]);


  // Handle save
  const handleSave = useCallback(async () => {
    // Validate only format (email and phone format)
    let isValid = true;
    
    if (formData.email && !validateField('email', formData.email)) {
      isValid = false;
    }
    if (formData.phone && !validateField('phone', formData.phone)) {
      isValid = false;
    }
    
    if (!isValid) {
      Alert.alert('Validation Error', 'Please check the format of email and phone fields.');
      return;
    }
    
    try {
      await onSave();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save personal details. Please try again.');
    }
  }, [formData, validateField, onSave]);

  // Check if form is valid (only format validation)
  const isFormValid = Object.keys(errors).length === 0;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          {/* Name Fields */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.fieldLabel}>First Name *</Text>
              <TextInput
                style={[styles.textInput, errors.firstName && styles.textInputError]}
                value={formData.firstName || ''}
                onChangeText={(value) => handleInputChange('firstName', value)}
                placeholder="Enter first name"
                editable={!disabled}
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>
            
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <Text style={styles.fieldLabel}>Last Name *</Text>
              <TextInput
                style={[styles.textInput, errors.lastName && styles.textInputError]}
                value={formData.lastName || ''}
                onChangeText={(value) => handleInputChange('lastName', value)}
                placeholder="Enter last name"
                editable={!disabled}
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          {/* Job Title */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Job Title</Text>
            <TextInput
              style={styles.textInput}
              value={formData.jobTitle || ''}
              onChangeText={(value) => handleInputChange('jobTitle', value)}
              placeholder="e.g., Software Developer, Marketing Manager"
              editable={!disabled}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Email Address *</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon, errors.email && styles.textInputError]}
                value={formData.email || ''}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!disabled}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Phone Number *</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon, errors.phone && styles.textInputError]}
                value={formData.phone || ''}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="+1 (555) 123-4567"
                keyboardType="phone-pad"
                editable={!disabled}
              />
            </View>
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          {/* Address */}
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Address *</Text>
            <View style={styles.inputWithIcon}>
              <Icon name="map-marker" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, styles.textInputWithIcon, errors.address && styles.textInputError]}
                value={formData.address || ''}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="City, State, Country"
                multiline
                numberOfLines={2}
                editable={!disabled}
              />
            </View>
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, !isFormValid && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!isFormValid || isSaving || disabled}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="content-save" size={20} color="#fff" />
            )}
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Personal Details'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textInputError: {
    borderColor: '#ff6b35',
  },
  textInputWithIcon: {
    paddingLeft: 40,
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    top: 12,
    zIndex: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#004D40',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PersonalDetails;

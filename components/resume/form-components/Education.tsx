import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DatePickerSlider from './DatePickerSlider';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/lib/ToastContext';
import { Education as EducationType } from '@/lib/resume';

// Types
export interface EducationProps {
  education: EducationType[];
  onUpdate: (education: EducationType[]) => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

// Main Education Component
const Education: React.FC<EducationProps> = ({
  education,
  onUpdate,
  onSave,
  isLoading = false,
  isSaving = false,
  disabled = false
}) => {
  const [localEducation, setLocalEducation] = useState<EducationType[]>(education);
  const [errors, setErrors] = useState<{ [key: string]: { [field: string]: string } }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { showError, showSuccess } = useToast();

  // Update local education when prop changes
  useEffect(() => {
    setLocalEducation(education);
  }, [education]);

  // Validate education entry - Only date validation
  const validateEducation = useCallback((index: number, edu: EducationType) => {
    const newErrors = { ...errors };
    const entryErrors: { [field: string]: string } = {};

    // Date validation only
    if (edu.startDate && edu.endDate) {
      const startDate = new Date(edu.startDate);
      const endDate = new Date(edu.endDate);
      
      if (startDate > endDate) {
        entryErrors.endDate = 'End date must be after start date';
      }
    }

    if (Object.keys(entryErrors).length > 0) {
      newErrors[index] = entryErrors;
    } else {
      delete newErrors[index];
    }

    setErrors(newErrors);
    return Object.keys(entryErrors).length === 0;
  }, [errors]);

  // Handle input change with optimized updates
  const handleInputChange = useCallback((index: number, field: keyof EducationType, value: string) => {
    const updatedEducation = [...localEducation];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    
    setLocalEducation(updatedEducation);
    onUpdate(updatedEducation);
    
    // Validate the entry
    validateEducation(index, updatedEducation[index]);
  }, [localEducation, onUpdate, validateEducation]);

  // Add new education
  const addEducation = useCallback(() => {
    const newEducation: EducationType = {
      universityName: '',
      degree: '',
      major: '',
      startDate: '',
      endDate: '',
      grade: '',
      description: ''
    };
    
    const updatedEducation = [...localEducation, newEducation];
    setLocalEducation(updatedEducation);
    onUpdate(updatedEducation);
  }, [localEducation, onUpdate]);

  // Remove education
  const removeEducation = useCallback((index: number) => {
    if (localEducation.length <= 1) {
      showError('At least one education entry is required.');
      return;
    }

    setDeleteIndex(index);
    setShowDeleteModal(true);
  }, [localEducation.length, showError]);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (deleteIndex === null) return;

    const updatedEducation = localEducation.filter((_, i) => i !== deleteIndex);
    setLocalEducation(updatedEducation);
    onUpdate(updatedEducation);
    
    // Remove errors for this index
    const newErrors = { ...errors };
    delete newErrors[deleteIndex];
    setErrors(newErrors);

    setShowDeleteModal(false);
    setDeleteIndex(null);
    showSuccess('Education entry removed successfully.');
  }, [deleteIndex, localEducation, onUpdate, errors, showSuccess]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    // Validate all entries
    let isValid = true;
    localEducation.forEach((edu, index) => {
      if (!validateEducation(index, edu)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showError('Please fill in all required fields correctly.');
      return;
    }

    try {
      await onSave();
      showSuccess('Education saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save education. Please try again.');
    }
  }, [localEducation, validateEducation, onSave]);

  // Check if form is valid
  const isFormValid = localEducation.every((edu, index) => {
    const entryErrors = errors[index] || {};
    return Object.keys(entryErrors).length === 0 && 
           edu.universityName?.trim() && 
           edu.degree?.trim() && 
           edu.major?.trim() && 
           edu.startDate?.trim() && 
           edu.endDate?.trim() && 
           edu.grade?.trim();
  });

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Education</Text>
            <Text style={styles.subtitle}>
              List your educational background in reverse chronological order
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addEducation}
            disabled={disabled}
          >
            <Icon name="plus" size={20} color="#004D40" />
            <Text style={styles.addButtonText}>Add Education</Text>
          </TouchableOpacity>
        </View>

        {/* Education Entries */}
        {localEducation.map((edu, index) => (
          <View key={index} style={styles.educationCard}>
            <View style={styles.educationHeader}>
              <Text style={styles.educationTitle}>Education {index + 1}</Text>
              {localEducation.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeEducation(index)}
                  disabled={disabled}
                >
                  <Icon name="delete" size={20} color="#ff6b35" />
                </TouchableOpacity>
              )}
            </View>

            {/* University Name */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>University/Institution Name *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors[index]?.universityName && styles.textInputError
                ]}
                value={edu.universityName || ''}
                onChangeText={(value) => handleInputChange(index, 'universityName', value)}
                placeholder="e.g., Stanford University"
                editable={!disabled}
              />
              {errors[index]?.universityName && (
                <Text style={styles.errorText}>{errors[index].universityName}</Text>
              )}
            </View>

            {/* Degree and Major */}
            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <Text style={styles.fieldLabel}>Degree *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.degree && styles.textInputError
                  ]}
                  value={edu.degree || ''}
                  onChangeText={(value) => handleInputChange(index, 'degree', value)}
                  placeholder="e.g., Bachelor of Science"
                  editable={!disabled}
                />
                {errors[index]?.degree && (
                  <Text style={styles.errorText}>{errors[index].degree}</Text>
                )}
              </View>
              
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <Text style={styles.fieldLabel}>Major *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.major && styles.textInputError
                  ]}
                  value={edu.major || ''}
                  onChangeText={(value) => handleInputChange(index, 'major', value)}
                  placeholder="e.g., Computer Science"
                  editable={!disabled}
                />
                {errors[index]?.major && (
                  <Text style={styles.errorText}>{errors[index].major}</Text>
                )}
              </View>
            </View>

            {/* Dates */}
            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <DatePickerSlider
                  label="Start Date"
                  value={edu.startDate || ''}
                  onChange={(value) => handleInputChange(index, 'startDate', value)}
                  placeholder="Select start date"
                  disabled={disabled}
                  error={errors[index]?.startDate}
                  maximumDate={edu.endDate ? new Date(edu.endDate) : new Date(2035, 11, 31)}
                />
              </View>
              
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <DatePickerSlider
                  label="End Date"
                  value={edu.endDate || ''}
                  onChange={(value) => handleInputChange(index, 'endDate', value)}
                  placeholder="Select end date"
                  disabled={disabled}
                  error={errors[index]?.endDate}
                  minimumDate={edu.startDate ? new Date(edu.startDate) : new Date(1950, 0, 1)}
                  maximumDate={new Date(2035, 11, 31)}
                />
              </View>
            </View>

            {/* Grade/GPA */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Grade/GPA *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors[index]?.grade && styles.textInputError
                ]}
                value={edu.grade || ''}
                onChangeText={(value) => handleInputChange(index, 'grade', value)}
                placeholder="e.g., 3.8/4.0 or First Class"
                editable={!disabled}
              />
              {errors[index]?.grade && (
                <Text style={styles.errorText}>{errors[index].grade}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                value={edu.description || ''}
                onChangeText={(value) => handleInputChange(index, 'description', value)}
                placeholder="Additional details about your education, achievements, or relevant coursework..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!disabled}
              />
            </View>
          </View>
        ))}

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isFormValid || isSaving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isFormValid || isSaving || disabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="content-save" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Education'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Remove Education"
        message="Are you sure you want to remove this education entry?"
        confirmText="Remove"
        cancelText="Cancel"
        confirmColor="#ff6b35"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="delete"
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
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
  headerContent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#004D40',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  educationCard: {
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
  educationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  educationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  removeButton: {
    padding: 8,
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
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    margin: 16,
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

export default Education;

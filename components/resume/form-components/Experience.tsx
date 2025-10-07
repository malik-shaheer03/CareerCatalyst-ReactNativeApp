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
import RichTextEditor from '../RichTextEditor';
import DatePickerSlider from './DatePickerSlider';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useToast } from '@/lib/ToastContext';
import { Experience as ExperienceType, ResumeData } from '@/lib/resume';

// Types
export interface ExperienceProps {
  experience: ExperienceType[];
  onUpdate: (experience: ExperienceType[]) => void;
  onSave: () => Promise<void>;
  resumeInfo: ResumeData;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

// Main Experience Component
const Experience: React.FC<ExperienceProps> = ({
  experience,
  onUpdate,
  onSave,
  resumeInfo,
  isLoading = false,
  isSaving = false,
  disabled = false
}) => {
  const [localExperience, setLocalExperience] = useState<ExperienceType[]>(experience);
  const [errors, setErrors] = useState<{ [key: string]: { [field: string]: string } }>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { showError, showSuccess } = useToast();

  // Update local experience when prop changes
  useEffect(() => {
    setLocalExperience(experience);
  }, [experience]);

  // Validate experience entry - Only date validation
  const validateExperience = useCallback((index: number, exp: ExperienceType) => {
    const newErrors = { ...errors };
    const entryErrors: { [field: string]: string } = {};

    // Date validation only
    if (exp.startDate && exp.endDate) {
      const startDate = new Date(exp.startDate);
      const endDate = new Date(exp.endDate);
      
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
  const handleInputChange = useCallback((index: number, field: keyof ExperienceType, value: string) => {
    const updatedExperience = [...localExperience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    
    setLocalExperience(updatedExperience);
    onUpdate(updatedExperience);
    
    // Validate the entry
    validateExperience(index, updatedExperience[index]);
  }, [localExperience, onUpdate, validateExperience]);

  // Add new experience
  const addExperience = useCallback(() => {
    const newExperience: ExperienceType = {
      title: '',
      companyName: '',
      city: '',
      state: '',
      startDate: '',
      endDate: '',
      currentlyWorking: false,
      workSummary: ''
    };
    
    const updatedExperience = [...localExperience, newExperience];
    setLocalExperience(updatedExperience);
    onUpdate(updatedExperience);
  }, [localExperience, onUpdate]);

  // Remove experience
  const removeExperience = useCallback((index: number) => {
    if (localExperience.length <= 1) {
      showError('At least one experience entry is required.');
      return;
    }

    setDeleteIndex(index);
    setShowDeleteModal(true);
  }, [localExperience.length, showError]);

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (deleteIndex === null) return;

    const updatedExperience = localExperience.filter((_, i) => i !== deleteIndex);
    setLocalExperience(updatedExperience);
    onUpdate(updatedExperience);
    
    // Remove errors for this index
    const newErrors = { ...errors };
    delete newErrors[deleteIndex];
    setErrors(newErrors);

    setShowDeleteModal(false);
    setDeleteIndex(null);
    showSuccess('Experience entry removed successfully.');
  }, [deleteIndex, localExperience, onUpdate, errors, showSuccess]);

  // Cancel delete
  const cancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setDeleteIndex(null);
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    // Validate all entries
    let isValid = true;
    localExperience.forEach((exp, index) => {
      if (!validateExperience(index, exp)) {
        isValid = false;
      }
    });

    if (!isValid) {
      showError('Please fill in all required fields correctly.');
      return;
    }

    try {
      await onSave();
      showSuccess('Experience saved successfully.');
    } catch (error) {
      console.error('Save error:', error);
      showError('Failed to save experience. Please try again.');
    }
  }, [localExperience, validateExperience, onSave]);

  // Check if form is valid
  const isFormValid = localExperience.every((exp, index) => {
    const entryErrors = errors[index] || {};
    return Object.keys(entryErrors).length === 0 && 
           exp.title?.trim() && 
           exp.companyName?.trim() && 
           exp.city?.trim() && 
           exp.state?.trim() && 
           exp.startDate?.trim() && 
           exp.endDate?.trim();
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
            <Text style={styles.title}>Work Experience</Text>
            <Text style={styles.subtitle}>
              List your work experience in reverse chronological order (most recent first)
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addExperience}
            disabled={disabled}
          >
            <Icon name="plus" size={20} color="#004D40" />
            <Text style={styles.addButtonText}>Add Experience</Text>
          </TouchableOpacity>
        </View>

        {/* Experience Entries */}
        {localExperience.map((exp, index) => (
          <View key={index} style={styles.experienceCard}>
            <View style={styles.experienceHeader}>
              <Text style={styles.experienceTitle}>Experience {index + 1}</Text>
              {localExperience.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeExperience(index)}
                  disabled={disabled}
                >
                  <Icon name="delete" size={20} color="#ff6b35" />
                </TouchableOpacity>
              )}
            </View>

            {/* Job Title and Company */}
            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <Text style={styles.fieldLabel}>Job Title *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.title && styles.textInputError
                  ]}
                  value={exp.title || ''}
                  onChangeText={(value) => handleInputChange(index, 'title', value)}
                  placeholder="e.g., Software Developer"
                  editable={!disabled}
                />
                {errors[index]?.title && (
                  <Text style={styles.errorText}>{errors[index].title}</Text>
                )}
              </View>
              
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <Text style={styles.fieldLabel}>Company Name *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.companyName && styles.textInputError
                  ]}
                  value={exp.companyName || ''}
                  onChangeText={(value) => handleInputChange(index, 'companyName', value)}
                  placeholder="e.g., Tech Corp"
                  editable={!disabled}
                />
                {errors[index]?.companyName && (
                  <Text style={styles.errorText}>{errors[index].companyName}</Text>
                )}
              </View>
            </View>

            {/* Location */}
            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <Text style={styles.fieldLabel}>City *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.city && styles.textInputError
                  ]}
                  value={exp.city || ''}
                  onChangeText={(value) => handleInputChange(index, 'city', value)}
                  placeholder="e.g., San Francisco"
                  editable={!disabled}
                />
                {errors[index]?.city && (
                  <Text style={styles.errorText}>{errors[index].city}</Text>
                )}
              </View>
              
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <Text style={styles.fieldLabel}>State *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    errors[index]?.state && styles.textInputError
                  ]}
                  value={exp.state || ''}
                  onChangeText={(value) => handleInputChange(index, 'state', value)}
                  placeholder="e.g., CA"
                  editable={!disabled}
                />
                {errors[index]?.state && (
                  <Text style={styles.errorText}>{errors[index].state}</Text>
                )}
              </View>
            </View>

            {/* Dates */}
            <View style={styles.row}>
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <DatePickerSlider
                  label="Start Date"
                  value={exp.startDate || ''}
                  onChange={(value) => handleInputChange(index, 'startDate', value)}
                  placeholder="Select start date"
                  disabled={disabled}
                  error={errors[index]?.startDate}
                  maximumDate={exp.endDate ? new Date(exp.endDate) : new Date(2035, 11, 31)}
                />
              </View>
              
              <View style={[styles.fieldContainer, styles.halfWidth]}>
                <DatePickerSlider
                  label="End Date"
                  value={exp.endDate || ''}
                  onChange={(value) => handleInputChange(index, 'endDate', value)}
                  placeholder="Select end date"
                  disabled={disabled || exp.currentlyWorking}
                  error={errors[index]?.endDate}
                  minimumDate={exp.startDate ? new Date(exp.startDate) : new Date(1950, 0, 1)}
                  maximumDate={new Date(2035, 11, 31)}
                />
              </View>
            </View>

            {/* Currently Working */}
            <View style={styles.fieldContainer}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => handleInputChange(index, 'currentlyWorking', !exp.currentlyWorking)}
                disabled={disabled}
              >
                <View style={[
                  styles.checkbox,
                  exp.currentlyWorking && styles.checkboxChecked
                ]}>
                  {exp.currentlyWorking && (
                    <Icon name="check" size={16} color="#fff" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>I currently work here</Text>
              </TouchableOpacity>
            </View>

            {/* Work Summary with Rich Text Editor */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Work Summary</Text>
              <RichTextEditor
                value={exp.workSummary || ''}
                onChange={(value) => handleInputChange(index, 'workSummary', value)}
                placeholder="Describe your key responsibilities, achievements, and skills used in this role..."
                section="experience"
                field="workSummary"
                index={index}
                resumeInfo={resumeInfo}
                showAIGenerate={true}
                showToolbar={true}
                multiline={true}
                numberOfLines={6}
                disabled={disabled}
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
            {isSaving ? 'Saving...' : 'Save Experience'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        title="Remove Experience"
        message="Are you sure you want to remove this experience entry?"
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
  experienceCard: {
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
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  experienceTitle: {
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
  errorText: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#004D40',
    borderColor: '#004D40',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
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

export default Experience;

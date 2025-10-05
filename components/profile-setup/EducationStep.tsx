import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface EducationStepProps {
  formData: { education: Education[] };
  updateForm: (field: keyof any, value: any) => void;
}

export default function EducationStep({ formData, updateForm }: EducationStepProps) {
  const [education, setEducation] = useState<Education[]>(formData.education || []);
  const [currentItem, setCurrentItem] = useState<Education>({
    institution: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    setEducation(formData.education || []);
  }, [formData.education]);

  const addEducation = () => {
    if (!currentItem.institution.trim() || !currentItem.degree.trim()) {
      Alert.alert('Error', 'Please fill in Institution and Degree fields');
      return;
    }

    const newEducation = [...education, currentItem];
    setEducation(newEducation);
    updateForm('education', newEducation);
    setCurrentItem({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const removeEducation = (index: number) => {
    const newEducation = education.filter((_, i) => i !== index);
    setEducation(newEducation);
    updateForm('education', newEducation);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Education</Text>
      
      {/* Existing Education Items */}
      {education.map((edu, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{edu.institution}</Text>
              <Text style={styles.itemSubtitle}>{edu.degree}</Text>
              <Text style={styles.itemDetails}>
                {edu.field} ({edu.startDate} - {edu.endDate})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeEducation(index)}
            >
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          {edu.description ? (
            <Text style={styles.itemDescription}>{edu.description}</Text>
          ) : null}
        </View>
      ))}

      {/* Add New Education Form */}
      <View style={styles.addFormCard}>
        <Text style={styles.addFormTitle}>Add New Education</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Institution *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="University Name"
              value={currentItem.institution}
              onChangeText={(text) => setCurrentItem({...currentItem, institution: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Degree *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Bachelor's, Master's, etc."
              value={currentItem.degree}
              onChangeText={(text) => setCurrentItem({...currentItem, degree: text})}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Field of Study</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Computer Science"
            value={currentItem.field}
            onChangeText={(text) => setCurrentItem({...currentItem, field: text})}
          />
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YYYY"
              value={currentItem.startDate}
              onChangeText={(text) => setCurrentItem({...currentItem, startDate: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>End Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YYYY or Present"
              value={currentItem.endDate}
              onChangeText={(text) => setCurrentItem({...currentItem, endDate: text})}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Relevant courses, achievements, etc."
            value={currentItem.description}
            onChangeText={(text) => setCurrentItem({...currentItem, description: text})}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, (!currentItem.institution || !currentItem.degree) && styles.buttonDisabled]}
          onPress={addEducation}
          disabled={!currentItem.institution || !currentItem.degree}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Education</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 24,
    textAlign: 'center',
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#00A389',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 6,
  },
  itemSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A389',
    marginBottom: 6,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  itemDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginTop: 12,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  addFormCard: {
    backgroundColor: 'rgba(240, 249, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#E0F2FE',
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  addFormTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  inputHalf: {
    width: '48%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#00A389',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

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

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface ExperienceStepProps {
  formData: { experience: Experience[] };
  updateForm: (field: keyof any, value: any) => void;
}

export default function ExperienceStep({ formData, updateForm }: ExperienceStepProps) {
  const [experience, setExperience] = useState<Experience[]>(formData.experience || []);
  const [currentItem, setCurrentItem] = useState<Experience>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    description: ''
  });

  useEffect(() => {
    setExperience(formData.experience || []);
  }, [formData.experience]);

  const addExperience = () => {
    if (!currentItem.company.trim() || !currentItem.position.trim()) {
      Alert.alert('Error', 'Please fill in Company and Position fields');
      return;
    }

    const newExperience = [...experience, currentItem];
    setExperience(newExperience);
    updateForm('experience', newExperience);
    setCurrentItem({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      description: ''
    });
  };

  const removeExperience = (index: number) => {
    const newExperience = experience.filter((_, i) => i !== index);
    setExperience(newExperience);
    updateForm('experience', newExperience);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Work Experience</Text>
      
      {/* Existing Experience Items */}
      {experience.map((exp, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{exp.position}</Text>
              <Text style={styles.itemSubtitle}>{exp.company}</Text>
              <Text style={styles.itemDetails}>
                {exp.location} ({exp.startDate} - {exp.endDate})
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeExperience(index)}
            >
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          {exp.description ? (
            <Text style={styles.itemDescription}>{exp.description}</Text>
          ) : null}
        </View>
      ))}

      {/* Add New Experience Form */}
      <View style={styles.addFormCard}>
        <Text style={styles.addFormTitle}>Add New Experience</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Company *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Company Name"
              value={currentItem.company}
              onChangeText={(text) => setCurrentItem({...currentItem, company: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Position *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Job Title"
              value={currentItem.position}
              onChangeText={(text) => setCurrentItem({...currentItem, position: text})}
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            style={styles.textInput}
            placeholder="City, Country or Remote"
            value={currentItem.location}
            onChangeText={(text) => setCurrentItem({...currentItem, location: text})}
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
            placeholder="Detail your responsibilities and achievements"
            value={currentItem.description}
            onChangeText={(text) => setCurrentItem({...currentItem, description: text})}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.addButton, (!currentItem.company || !currentItem.position) && styles.buttonDisabled]}
          onPress={addExperience}
          disabled={!currentItem.company || !currentItem.position}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Experience</Text>
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
    height: 110,
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

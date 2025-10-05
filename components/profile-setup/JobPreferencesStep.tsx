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

interface JobPreferencesStepProps {
  formData: {
    desiredJobTitle: string;
    jobType: string;
    workEnvironment: string;
    salaryMin: string;
    salaryMax: string;
    availability: string;
    skills: string[];
  };
  updateForm: (field: keyof any, value: any) => void;
}

const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship'
];

const WORK_ENVIRONMENTS = [
  'On-site',
  'Remote',
  'Hybrid'
];

const AVAILABILITY_OPTIONS = [
  'Immediately',
  '2 weeks',
  '1 month',
  'More than 1 month'
];

export default function JobPreferencesStep({ formData, updateForm }: JobPreferencesStepProps) {
  const [skills, setSkills] = useState<string[]>(formData.skills || []);
  const [currentSkill, setCurrentSkill] = useState('');

  useEffect(() => {
    setSkills(formData.skills || []);
  }, [formData.skills]);

  const addSkill = () => {
    if (currentSkill.trim() !== '') {
      const newSkills = [...skills, currentSkill.trim()];
      setSkills(newSkills);
      updateForm('skills', newSkills);
      setCurrentSkill('');
    }
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
    updateForm('skills', newSkills);
  };

  const handleKeyPress = () => {
    if (currentSkill.trim() !== '') {
      addSkill();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Job Preferences & Skills</Text>

      {/* Desired Job Title */}
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Desired Job Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Software Engineer, Project Manager, etc."
          value={formData.desiredJobTitle || ''}
          onChangeText={(text) => updateForm('desiredJobTitle', text)}
        />
      </View>

      {/* Job Type and Work Environment Row */}
      <View style={styles.inputRow}>
        <View style={styles.inputHalf}>
          <Text style={styles.fieldLabel}>Job Type</Text>
          <View style={styles.selectContainer}>
            {JOB_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.selectOption,
                  formData.jobType === type && styles.selectOptionActive
                ]}
                onPress={() => updateForm('jobType', type)}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.jobType === type && styles.selectOptionTextActive
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputHalf}>
          <Text style={styles.fieldLabel}>Work Environment</Text>
          <View style={styles.selectContainer}>
            {WORK_ENVIRONMENTS.map((env) => (
              <TouchableOpacity
                key={env}
                style={[
                  styles.selectOption,
                  formData.workEnvironment === env && styles.selectOptionActive
                ]}
                onPress={() => updateForm('workEnvironment', env)}
              >
                <Text style={[
                  styles.selectOptionText,
                  formData.workEnvironment === env && styles.selectOptionTextActive
                ]}>
                  {env}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Salary Range */}
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Desired Salary Range</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <TextInput
              style={styles.textInput}
              placeholder="Minimum (e.g., 50000)"
              value={formData.salaryMin || ''}
              onChangeText={(text) => updateForm('salaryMin', text)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.inputHalf}>
            <TextInput
              style={styles.textInput}
              placeholder="Maximum (e.g., 80000)"
              value={formData.salaryMax || ''}
              onChangeText={(text) => updateForm('salaryMax', text)}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Availability */}
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Availability</Text>
        <View style={styles.selectContainer}>
          {AVAILABILITY_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.selectOption,
                formData.availability === option && styles.selectOptionActive
              ]}
              onPress={() => updateForm('availability', option)}
            >
              <Text style={[
                styles.selectOptionText,
                formData.availability === option && styles.selectOptionTextActive
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Skills Section */}
      <View style={styles.inputContainer}>
        <Text style={styles.fieldLabel}>Skills</Text>
        
        {/* Skills Chips */}
        <View style={styles.skillsContainer}>
          {skills.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillChipText}>{skill}</Text>
              <TouchableOpacity
                style={styles.skillChipDelete}
                onPress={() => removeSkill(index)}
              >
                <Icon name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Add Skill Input */}
        <View style={styles.addSkillContainer}>
          <TextInput
            style={[styles.textInput, styles.skillInput]}
            placeholder="e.g., JavaScript, Project Management"
            value={currentSkill}
            onChangeText={setCurrentSkill}
            onSubmitEditing={handleKeyPress}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addSkillButton, !currentSkill.trim() && styles.buttonDisabled]}
            onPress={addSkill}
            disabled={!currentSkill.trim()}
          >
            <Icon name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
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
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#E5E7EB',
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
  selectOptionActive: {
    backgroundColor: '#00A389',
    borderColor: '#00A389',
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  selectOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00A389',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  skillChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  skillChipDelete: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSkillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  skillInput: {
    flex: 1,
  },
  addSkillButton: {
    backgroundColor: '#00A389',
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

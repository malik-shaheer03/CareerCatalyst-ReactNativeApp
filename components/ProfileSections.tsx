import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
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

interface Experience {
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Certification {
  name: string;
  organization: string;
  issueDate: string;
  expiryDate: string;
  credentialID: string;
}

interface EducationSectionProps {
  education: Education[];
  updateArrayField: (arrayField: string, index: number, field: string, value: any) => void;
  addEducation: () => void;
  removeEducation: (index: number) => void;
}

interface ExperienceSectionProps {
  experience: Experience[];
  updateArrayField: (arrayField: string, index: number, field: string, value: any) => void;
  addExperience: () => void;
  removeExperience: (index: number) => void;
}

interface CertificationSectionProps {
  certifications: Certification[];
  updateArrayField: (arrayField: string, index: number, field: string, value: any) => void;
  addCertification: () => void;
  removeCertification: (index: number) => void;
}

export const EducationSection: React.FC<EducationSectionProps> = ({
  education,
  updateArrayField,
  addEducation,
  removeEducation,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Education</Text>
        <TouchableOpacity onPress={addEducation} style={styles.addButton}>
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {education.map((edu, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              {edu.institution || 'New Education Entry'}
            </Text>
            <TouchableOpacity onPress={() => removeEducation(index)} style={styles.removeButton}>
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Institution *</Text>
              <TextInput
                style={styles.input}
                value={edu.institution}
                onChangeText={(text) => updateArrayField('education', index, 'institution', text)}
                placeholder="University/College name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Degree *</Text>
              <TextInput
                style={styles.input}
                value={edu.degree}
                onChangeText={(text) => updateArrayField('education', index, 'degree', text)}
                placeholder="Bachelor's, Master's, etc."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
            <View style={styles.formGroup}>
              <Text style={styles.label}>Field of Study</Text>
              <TextInput
                style={styles.input}
                value={edu.field}
                onChangeText={(text) => updateArrayField('education', index, 'field', text)}
                placeholder="Computer Science, Business, etc."
                placeholderTextColor="#9CA3AF"
              />
            </View>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={edu.startDate}
                onChangeText={(text) => updateArrayField('education', index, 'startDate', text)}
                placeholder="MM/YYYY"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                value={edu.endDate}
                onChangeText={(text) => updateArrayField('education', index, 'endDate', text)}
                placeholder="MM/YYYY or Present"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={edu.description}
              onChangeText={(text) => updateArrayField('education', index, 'description', text)}
              placeholder="Relevant courses, achievements, etc."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  updateArrayField,
  addExperience,
  removeExperience,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
        <TouchableOpacity onPress={addExperience} style={styles.addButton}>
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {experience.map((exp, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              {exp.position || 'New Experience Entry'}
            </Text>
            <TouchableOpacity onPress={() => removeExperience(index)} style={styles.removeButton}>
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Company *</Text>
              <TextInput
                style={styles.input}
                value={exp.company}
                onChangeText={(text) => updateArrayField('experience', index, 'company', text)}
                placeholder="Company name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Position *</Text>
              <TextInput
                style={styles.input}
                value={exp.position}
                onChangeText={(text) => updateArrayField('experience', index, 'position', text)}
                placeholder="Job title"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={exp.location}
              onChangeText={(text) => updateArrayField('experience', index, 'location', text)}
              placeholder="City, Country or Remote"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={exp.startDate}
                onChangeText={(text) => updateArrayField('experience', index, 'startDate', text)}
                placeholder="MM/YYYY"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                value={exp.endDate}
                onChangeText={(text) => updateArrayField('experience', index, 'endDate', text)}
                placeholder="MM/YYYY or Present"
                placeholderTextColor="#9CA3AF"
                editable={!exp.current}
              />
            </View>
          </View>
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Current Job</Text>
            <Switch
              value={exp.current}
              onValueChange={(value) => {
                updateArrayField('experience', index, 'current', value);
                if (value) {
                  updateArrayField('experience', index, 'endDate', 'Present');
                }
              }}
              trackColor={{ false: '#E5E7EB', true: '#00A389' }}
              thumbColor={exp.current ? '#FFFFFF' : '#F3F4F6'}
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={exp.description}
              onChangeText={(text) => updateArrayField('experience', index, 'description', text)}
              placeholder="Detail your responsibilities and achievements"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export const CertificationSection: React.FC<CertificationSectionProps> = ({
  certifications,
  updateArrayField,
  addCertification,
  removeCertification,
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Certifications & Licenses</Text>
        <TouchableOpacity onPress={addCertification} style={styles.addButton}>
          <Icon name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {certifications.map((cert, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemTitle}>
              {cert.name || 'New Certification Entry'}
            </Text>
            <TouchableOpacity onPress={() => removeCertification(index)} style={styles.removeButton}>
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Certificate Name *</Text>
              <TextInput
                style={styles.input}
                value={cert.name}
                onChangeText={(text) => updateArrayField('certifications', index, 'name', text)}
                placeholder="AWS Certified Solutions Architect"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Organization *</Text>
              <TextInput
                style={styles.input}
                value={cert.organization}
                onChangeText={(text) => updateArrayField('certifications', index, 'organization', text)}
                placeholder="Amazon Web Services"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Issue Date</Text>
              <TextInput
                style={styles.input}
                value={cert.issueDate}
                onChangeText={(text) => updateArrayField('certifications', index, 'issueDate', text)}
                placeholder="MM/YYYY"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={cert.expiryDate}
                onChangeText={(text) => updateArrayField('certifications', index, 'expiryDate', text)}
                placeholder="MM/YYYY"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Credential ID</Text>
            <TextInput
              style={styles.input}
              value={cert.credentialID}
              onChangeText={(text) => updateArrayField('certifications', index, 'credentialID', text)}
              placeholder="Credential ID or URL"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  addButton: {
    backgroundColor: '#00A389',
    padding: 8,
    borderRadius: 8,
  },
  itemCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  removeButton: {
    padding: 4,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroup: {
    flex: 1,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

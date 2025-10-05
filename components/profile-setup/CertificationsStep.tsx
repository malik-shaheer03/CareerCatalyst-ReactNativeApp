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

interface Certification {
  name: string;
  issuer: string;
  date: string;
  url: string;
}

interface CertificationsStepProps {
  formData: { certifications: Certification[] };
  updateForm: (field: keyof any, value: any) => void;
}

export default function CertificationsStep({ formData, updateForm }: CertificationsStepProps) {
  const [certifications, setCertifications] = useState<Certification[]>(formData.certifications || []);
  const [currentItem, setCurrentItem] = useState<Certification>({
    name: '',
    issuer: '',
    date: '',
    url: ''
  });

  useEffect(() => {
    setCertifications(formData.certifications || []);
  }, [formData.certifications]);

  const addCertification = () => {
    if (!currentItem.name.trim() || !currentItem.issuer.trim()) {
      Alert.alert('Error', 'Please fill in Certificate Name and Issuing Organization fields');
      return;
    }

    const newCertifications = [...certifications, currentItem];
    setCertifications(newCertifications);
    updateForm('certifications', newCertifications);
    setCurrentItem({
      name: '',
      issuer: '',
      date: '',
      url: ''
    });
  };

  const removeCertification = (index: number) => {
    const newCertifications = certifications.filter((_, i) => i !== index);
    setCertifications(newCertifications);
    updateForm('certifications', newCertifications);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Certifications & Licenses</Text>
      
      {/* Existing Certifications */}
      {certifications.map((cert, index) => (
        <View key={index} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{cert.name}</Text>
              <Text style={styles.itemSubtitle}>{cert.issuer}</Text>
              {cert.date ? (
                <Text style={styles.itemDetails}>Issued: {cert.date}</Text>
              ) : null}
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => removeCertification(index)}
            >
              <Icon name="delete" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
          {cert.url ? (
            <Text style={styles.itemUrl} numberOfLines={1}>
              {cert.url}
            </Text>
          ) : null}
        </View>
      ))}

      {/* Add New Certification Form */}
      <View style={styles.addFormCard}>
        <Text style={styles.addFormTitle}>Add New Certification</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Certificate Name *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="AWS Certified Solutions Architect"
              value={currentItem.name}
              onChangeText={(text) => setCurrentItem({...currentItem, name: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Issuing Organization *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Amazon Web Services"
              value={currentItem.issuer}
              onChangeText={(text) => setCurrentItem({...currentItem, issuer: text})}
            />
          </View>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Issue Date</Text>
            <TextInput
              style={styles.textInput}
              placeholder="MM/YYYY"
              value={currentItem.date}
              onChangeText={(text) => setCurrentItem({...currentItem, date: text})}
            />
          </View>
          <View style={styles.inputHalf}>
            <Text style={styles.fieldLabel}>Credential URL (optional)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="https://www.credential.net/..."
              value={currentItem.url}
              onChangeText={(text) => setCurrentItem({...currentItem, url: text})}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, (!currentItem.name || !currentItem.issuer) && styles.buttonDisabled]}
          onPress={addCertification}
          disabled={!currentItem.name || !currentItem.issuer}
        >
          <Icon name="plus" size={20} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Certification</Text>
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
  itemUrl: {
    fontSize: 14,
    color: '#00A389',
    marginTop: 8,
    textDecorationLine: 'underline',
    fontWeight: '500',
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

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeAIService } from '@/lib/ai';
import { ResumeData } from '@/lib/resume';

// Types
export interface SummaryProps {
  summary: string;
  onUpdate: (summary: string) => void;
  onSave: () => Promise<void>;
  resumeInfo: ResumeData;
  isLoading?: boolean;
  isSaving?: boolean;
  disabled?: boolean;
}

// AI Generated Summary Item
interface AIGeneratedSummary {
  summary: string;
  experience_level: string;
}

// Main Summary Component
const Summary: React.FC<SummaryProps> = ({
  summary,
  onUpdate,
  onSave,
  resumeInfo,
  isLoading = false,
  isSaving = false,
  disabled = false
}) => {
  const [localSummary, setLocalSummary] = useState(summary);
  const [aiGeneratedSummaries, setAiGeneratedSummaries] = useState<AIGeneratedSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');

  // Update local summary when prop changes
  useEffect(() => {
    setLocalSummary(summary);
  }, [summary]);

  // Handle text change with optimized updates
  const handleTextChange = useCallback((text: string) => {
    setLocalSummary(text);
    onUpdate(text);
  }, [onUpdate]);

  // Generate AI summaries
  const generateAISummaries = useCallback(async () => {
    if (!resumeInfo.personal?.jobTitle) {
      Alert.alert('Error', 'Please add a job title in Personal Details first.');
      return;
    }

    try {
      console.log('Starting AI generation for job title:', resumeInfo.personal.jobTitle);
      setIsGenerating(true);
      setShowAIOptions(true);
      
      const summaries = await ResumeAIService.generateSummary(resumeInfo.personal.jobTitle);
      console.log('AI summaries generated:', summaries);
      
      // Convert to our format
      const formattedSummaries: AIGeneratedSummary[] = summaries.map((summary, index) => ({
        summary,
        experience_level: ['Fresher', 'Mid-Level', 'Senior'][index] || 'Professional'
      }));
      
      setAiGeneratedSummaries(formattedSummaries);
      console.log('Formatted summaries set:', formattedSummaries);
    } catch (error) {
      console.error('AI generation failed:', error);
      Alert.alert('Error', `Failed to generate summaries: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }, [resumeInfo.personal?.jobTitle]);

  // Select AI summary
  const selectAISummary = useCallback((selectedSummary: AIGeneratedSummary) => {
    setLocalSummary(selectedSummary.summary);
    onUpdate(selectedSummary.summary);
    setSelectedLevel(selectedSummary.experience_level);
    setShowAIOptions(false);
  }, [onUpdate]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!localSummary.trim()) {
      Alert.alert('Validation Error', 'Please add a professional summary.');
      return;
    }

    try {
      await onSave();
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save summary. Please try again.');
    }
  }, [localSummary, onSave]);

  // Get character count
  const getCharacterCount = () => localSummary.length;
  const getWordCount = () => localSummary.trim().split(/\s+/).filter(word => word.length > 0).length;

  // Check if summary is valid
  const isSummaryValid = localSummary.trim().length >= 50;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Professional Summary</Text>
            <Text style={styles.subtitle}>
              Write a compelling summary that highlights your key skills and experience
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.aiButton, isGenerating && styles.aiButtonGenerating]}
            onPress={generateAISummaries}
            disabled={isGenerating || disabled || !resumeInfo.personal?.jobTitle}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#004D40" />
            ) : (
              <Icon name="robot" size={20} color="#004D40" />
            )}
            <Text style={styles.aiButtonText}>
              {isGenerating ? 'Generating...' : 'Generate with AI'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Generated Options */}
        {showAIOptions && aiGeneratedSummaries.length > 0 && (
          <View style={styles.aiOptionsContainer}>
            <View style={styles.aiOptionsHeader}>
              <Text style={styles.aiOptionsTitle}>AI Generated Summaries</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAIOptions(false)}
              >
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {aiGeneratedSummaries.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.aiOptionCard,
                    selectedLevel === item.experience_level && styles.aiOptionCardSelected
                  ]}
                  onPress={() => selectAISummary(item)}
                >
                  <View style={styles.aiOptionHeader}>
                    <Text style={styles.aiOptionLevel}>{item.experience_level}</Text>
                    <Icon 
                      name="check-circle" 
                      size={16} 
                      color={selectedLevel === item.experience_level ? '#004D40' : '#ccc'} 
                    />
                  </View>
                  <Text style={styles.aiOptionText} numberOfLines={4}>
                    {item.summary}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Summary Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.textInput, !isSummaryValid && styles.textInputWarning]}
            value={localSummary}
            onChangeText={handleTextChange}
            placeholder="Write your professional summary here... (minimum 50 characters)"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            editable={!disabled}
          />
          
          {/* Character and Word Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {getCharacterCount()} characters
            </Text>
            <Text style={styles.countText}>
              {getWordCount()} words
            </Text>
            {!isSummaryValid && (
              <Text style={styles.warningText}>
                Minimum 50 characters required
              </Text>
            )}
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Writing Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Keep it concise (2-3 sentences)</Text>
            <Text style={styles.tipItem}>• Highlight your key skills and achievements</Text>
            <Text style={styles.tipItem}>• Use action verbs and quantifiable results</Text>
            <Text style={styles.tipItem}>• Tailor it to your target job</Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!isSummaryValid || isSaving) && styles.saveButtonDisabled
          ]}
          onPress={handleSave}
          disabled={!isSummaryValid || isSaving || disabled}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="content-save" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Summary'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  aiButton: {
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
  aiButtonGenerating: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  aiButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004D40',
  },
  aiOptionsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
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
  aiOptionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  aiOptionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  aiOptionCard: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    width: 200,
    minHeight: 120,
  },
  aiOptionCardSelected: {
    borderColor: '#004D40',
    backgroundColor: '#E8F5E8',
  },
  aiOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiOptionLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004D40',
  },
  aiOptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  inputContainer: {
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  textInputWarning: {
    borderColor: '#ff6b35',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  warningText: {
    fontSize: 12,
    color: '#ff6b35',
    fontWeight: '600',
  },
  tipsContainer: {
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
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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

export default Summary;

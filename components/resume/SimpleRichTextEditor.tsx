import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeAIService } from '@/lib/ai';

// Types
export interface SimpleRichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  section?: 'experience' | 'projects';
  field?: 'workSummary' | 'projectSummary';
  index?: number;
  resumeInfo?: any;
  onAIGenerate?: (generatedText: string) => void;
  disabled?: boolean;
  maxLength?: number;
  style?: any;
  containerStyle?: any;
  showAIGenerate?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

// Main Simple Rich Text Editor Component
const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  label,
  section = 'experience',
  field = 'workSummary',
  index = 0,
  resumeInfo,
  onAIGenerate,
  disabled = false,
  maxLength,
  style,
  containerStyle,
  showAIGenerate = true,
  multiline = true,
  numberOfLines = 4
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // AI Generation
  const handleAIGenerate = useCallback(async () => {
    if (!resumeInfo) {
      Alert.alert('Error', 'Resume information is required for AI generation');
      return;
    }

    try {
      setIsGenerating(true);
      
      let generatedText = '';
      
      if (section === 'experience') {
        const jobTitle = resumeInfo.experience?.[index]?.title;
        const companyName = resumeInfo.experience?.[index]?.companyName;
        
        if (!jobTitle) {
          Alert.alert('Error', 'Please add a job title first');
          return;
        }
        
        const bullets = await ResumeAIService.generateExperienceBullets(jobTitle, companyName);
        generatedText = bullets.join('');
      } else if (section === 'projects') {
        const projectName = resumeInfo.projects?.[index]?.projectName;
        const techStack = resumeInfo.projects?.[index]?.techStack;
        
        if (!projectName || !techStack) {
          Alert.alert('Error', 'Please add project name and tech stack first');
          return;
        }
        
        const bullets = await ResumeAIService.generateProjectSummary(projectName, techStack);
        generatedText = bullets.join('');
      }
      
      if (generatedText) {
        onChange(generatedText);
        if (onAIGenerate) {
          onAIGenerate(generatedText);
        }
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      Alert.alert('Error', 'Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [resumeInfo, section, index, onChange, onAIGenerate]);

  // Handle text change
  const handleTextChange = useCallback((text: string) => {
    onChange(text);
  }, [onChange]);

  // Get character count
  const getCharacterCount = () => {
    return value.length;
  };

  // Get word count
  const getWordCount = () => {
    return value.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, containerStyle]}
    >
      {/* Label and AI Button */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showAIGenerate && (
            <TouchableOpacity
              style={[
                styles.aiButton,
                isGenerating && styles.aiButtonGenerating
              ]}
              onPress={handleAIGenerate}
              disabled={isGenerating || disabled}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#004D40" />
              ) : (
                <Icon name="robot" size={16} color="#004D40" />
              )}
              <Text style={styles.aiButtonText}>
                {isGenerating ? 'Generating...' : 'AI Generate'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Text Input Container */}
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        disabled && styles.inputContainerDisabled
      ]}>
        <TextInput
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            style
          ]}
          value={value}
          onChangeText={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        
        {/* Character/Word Count */}
        {(maxLength || showAIGenerate) && (
          <View style={styles.countContainer}>
            {maxLength && (
              <Text style={[
                styles.countText,
                getCharacterCount() > maxLength * 0.9 && styles.countTextWarning
              ]}>
                {getCharacterCount()}/{maxLength}
              </Text>
            )}
            <Text style={styles.countText}>
              {getWordCount()} words
            </Text>
          </View>
        )}
      </View>

      {/* Help Text */}
      {section === 'experience' && (
        <Text style={styles.helpText}>
          💡 Use bullet points to describe your responsibilities and achievements
        </Text>
      )}
      
      {section === 'projects' && (
        <Text style={styles.helpText}>
          💡 Describe the project, technologies used, and your contributions
        </Text>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#004D40',
  },
  aiButtonGenerating: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004D40',
    marginLeft: 4,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 100,
  },
  inputContainerFocused: {
    borderColor: '#004D40',
    borderWidth: 2,
    shadowColor: '#004D40',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    minHeight: 40,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  countTextWarning: {
    color: '#ff6b35',
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});

export default SimpleRichTextEditor;

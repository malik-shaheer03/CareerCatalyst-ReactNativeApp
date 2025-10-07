import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { ResumeAIService } from '@/lib/ai';

// Types
export interface RichTextEditorProps {
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
  showToolbar?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

// Toolbar button component
const ToolbarButton: React.FC<{
  icon: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: number;
  color?: string;
}> = ({ icon, onPress, active = false, disabled = false, size = 20, color = '#666' }) => (
  <TouchableOpacity
    style={[
      styles.toolbarButton,
      active && styles.toolbarButtonActive,
      disabled && styles.toolbarButtonDisabled
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Icon 
      name={icon} 
      size={size} 
      color={disabled ? '#ccc' : (active ? '#004D40' : color)} 
    />
  </TouchableOpacity>
);

// Main Rich Text Editor Component
const RichTextEditor: React.FC<RichTextEditorProps> = ({
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
  showToolbar = true,
  multiline = true,
  numberOfLines = 4
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textInputRef = useRef<TextInput>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  // Formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Update formatting state based on current selection
  useEffect(() => {
    if (value && selection.start !== selection.end) {
      const selectedText = value.substring(selection.start, selection.end);
      setIsBold(selectedText.includes('<b>') || selectedText.includes('<strong>'));
      setIsItalic(selectedText.includes('<i>') || selectedText.includes('<em>'));
      setIsUnderline(selectedText.includes('<u>'));
    }
  }, [value, selection]);

  // Handle text change
  const handleTextChange = useCallback((text: string) => {
    onChange(text);
  }, [onChange]);

  // Handle selection change
  const handleSelectionChange = useCallback((event: any) => {
    setSelection(event.nativeEvent.selection);
  }, []);

  // Apply formatting
  const applyFormatting = useCallback((tag: string, closingTag: string) => {
    if (selection.start === selection.end) {
      // No selection, insert tags at cursor
      const before = value.substring(0, selection.start);
      const after = value.substring(selection.start);
      const newText = `${before}${tag}${closingTag}${after}`;
      onChange(newText);
      
      // Move cursor between tags
      const newPosition = selection.start + tag.length;
      setTimeout(() => {
        textInputRef.current?.setSelection(newPosition, newPosition);
      }, 100);
    } else {
      // Apply formatting to selected text
      const before = value.substring(0, selection.start);
      const selected = value.substring(selection.start, selection.end);
      const after = value.substring(selection.end);
      
      // Check if already formatted
      if (selected.includes(tag)) {
        // Remove formatting
        const unformatted = selected.replace(new RegExp(`<${tag}[^>]*>`, 'g'), '').replace(new RegExp(`</${tag}>`, 'g'), '');
        const newText = `${before}${unformatted}${after}`;
        onChange(newText);
      } else {
        // Add formatting
        const formatted = `${tag}${selected}${closingTag}`;
        const newText = `${before}${formatted}${after}`;
        onChange(newText);
      }
    }
  }, [value, selection, onChange]);

  // Formatting functions
  const toggleBold = useCallback(() => {
    applyFormatting('<b>', '</b>');
  }, [applyFormatting]);

  const toggleItalic = useCallback(() => {
    applyFormatting('<i>', '</i>');
  }, [applyFormatting]);

  const toggleUnderline = useCallback(() => {
    applyFormatting('<u>', '</u>');
  }, [applyFormatting]);

  const insertBulletList = useCallback(() => {
    const before = value.substring(0, selection.start);
    const after = value.substring(selection.start);
    const newText = `${before}<ul><li>• </li></ul>${after}`;
    onChange(newText);
  }, [value, selection, onChange]);

  const insertNumberedList = useCallback(() => {
    const before = value.substring(0, selection.start);
    const after = value.substring(selection.start);
    const newText = `${before}<ol><li>1. </li></ol>${after}`;
    onChange(newText);
  }, [value, selection, onChange]);

  const insertLineBreak = useCallback(() => {
    const before = value.substring(0, selection.start);
    const after = value.substring(selection.start);
    const newText = `${before}<br/>${after}`;
    onChange(newText);
  }, [value, selection, onChange]);

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

  // Clear formatting
  const clearFormatting = useCallback(() => {
    const plainText = value
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"');
    
    onChange(plainText);
  }, [value, onChange]);

  // Get character count
  const getCharacterCount = () => {
    const plainText = value.replace(/<[^>]*>/g, '');
    return plainText.length;
  };

  // Get word count
  const getWordCount = () => {
    const plainText = value.replace(/<[^>]*>/g, '');
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, containerStyle]}
    >
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>{label}</Text>
          {showAIGenerate && (
            <TouchableOpacity
              style={styles.aiButton}
              onPress={handleAIGenerate}
              disabled={isGenerating || disabled}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#004D40" />
              ) : (
                <Icon name="robot" size={16} color="#004D40" />
              )}
              <Text style={styles.aiButtonText}>
                {isGenerating ? 'Generating...' : 'Generate with AI'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Toolbar */}
      {showToolbar && (
        <View style={styles.toolbar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.toolbarRow}>
              <ToolbarButton
                icon="format-bold"
                onPress={toggleBold}
                active={isBold}
                disabled={disabled}
              />
              <ToolbarButton
                icon="format-italic"
                onPress={toggleItalic}
                active={isItalic}
                disabled={disabled}
              />
              <ToolbarButton
                icon="format-underline"
                onPress={toggleUnderline}
                active={isUnderline}
                disabled={disabled}
              />
              
              <View style={styles.toolbarSeparator} />
              
              <ToolbarButton
                icon="format-list-bulleted"
                onPress={insertBulletList}
                disabled={disabled}
              />
              <ToolbarButton
                icon="format-list-numbered"
                onPress={insertNumberedList}
                disabled={disabled}
              />
              <ToolbarButton
                icon="format-line-spacing"
                onPress={insertLineBreak}
                disabled={disabled}
              />
              
              <View style={styles.toolbarSeparator} />
              
              <ToolbarButton
                icon="format-clear"
                onPress={clearFormatting}
                disabled={disabled}
              />
            </View>
          </ScrollView>
        </View>
      )}

      {/* Text Input */}
      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            style
          ]}
          value={value}
          onChangeText={handleTextChange}
          onSelectionChange={handleSelectionChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={!disabled}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        
        {/* Character/Word Count */}
        {(maxLength || showToolbar) && (
          <View style={styles.countContainer}>
            {maxLength && (
              <Text style={styles.countText}>
                {getCharacterCount()}/{maxLength}
              </Text>
            )}
            {showToolbar && (
              <Text style={styles.countText}>
                {getWordCount()} words
              </Text>
            )}
          </View>
        )}
      </View>
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
  aiButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#004D40',
    marginLeft: 4,
  },
  toolbar: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 8,
  },
  toolbarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 2,
    borderRadius: 6,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButtonActive: {
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#004D40',
  },
  toolbarButtonDisabled: {
    opacity: 0.5,
  },
  toolbarSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#dee2e6',
    marginHorizontal: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  textInput: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    minHeight: 40,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
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
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  countText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default RichTextEditor;

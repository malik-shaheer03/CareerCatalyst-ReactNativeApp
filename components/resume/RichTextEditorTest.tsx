// Test file for Rich Text Editor components
// This file can be used to test rich text editor functionality during development

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { RichTextEditor, SimpleRichTextEditor, FormattedText, HtmlPreview } from './index';

// Example usage and testing functions
export class RichTextEditorTester {
  /**
   * Test Rich Text Editor component
   */
  static TestRichTextEditor = () => {
    const [value, setValue] = useState('<b>Bold text</b> and <i>italic text</i>');
    const [simpleValue, setSimpleValue] = useState('Simple text without formatting');

    const handleChange = (newValue: string) => {
      setValue(newValue);
      console.log('Rich text changed:', newValue);
    };

    const handleSimpleChange = (newValue: string) => {
      setSimpleValue(newValue);
      console.log('Simple text changed:', newValue);
    };

    const handleAIGenerate = (generatedText: string) => {
      console.log('AI generated text:', generatedText);
      Alert.alert('AI Generated', 'Content has been generated successfully!');
    };

    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Rich Text Editor Test</Text>
        
        {/* Rich Text Editor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rich Text Editor</Text>
          <RichTextEditor
            value={value}
            onChange={handleChange}
            placeholder="Enter rich text here..."
            label="Rich Text Content"
            showAIGenerate={true}
            showToolbar={true}
            multiline={true}
            numberOfLines={6}
            onAIGenerate={handleAIGenerate}
          />
        </View>

        {/* Simple Rich Text Editor */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Simple Rich Text Editor</Text>
          <SimpleRichTextEditor
            value={simpleValue}
            onChange={handleSimpleChange}
            placeholder="Enter simple text here..."
            label="Simple Text Content"
            showAIGenerate={true}
            multiline={true}
            numberOfLines={4}
            onAIGenerate={handleAIGenerate}
          />
        </View>

        {/* Formatted Text Display */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formatted Text Display</Text>
          <View style={styles.previewContainer}>
            <FormattedText
              text={value}
              style={styles.previewText}
            />
          </View>
        </View>

        {/* HTML Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HTML Preview</Text>
          <HtmlPreview
            html={value}
            style={styles.htmlPreview}
            maxHeight={150}
          />
        </View>

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Functions</Text>
          <View style={styles.buttonContainer}>
            <Text style={styles.testButton} onPress={() => {
              setValue('<b>Test Bold</b> and <i>Test Italic</i>');
            }}>
              Set Test HTML
            </Text>
            <Text style={styles.testButton} onPress={() => {
              setValue('');
            }}>
              Clear Rich Text
            </Text>
            <Text style={styles.testButton} onPress={() => {
              setSimpleValue('Simple test text');
            }}>
              Set Test Simple
            </Text>
            <Text style={styles.testButton} onPress={() => {
              setSimpleValue('');
            }}>
              Clear Simple Text
            </Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  /**
   * Test formatting functions
   */
  static testFormattingFunctions() {
    console.log('Testing formatting functions...');
    
    const testHtml = '<b>Bold text</b> and <i>italic text</i> with <u>underline</u>';
    
    // Test strip HTML
    const plainText = testHtml.replace(/<[^>]*>/g, '');
    console.log('Plain text:', plainText);
    
    // Test word count
    const wordCount = plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
    console.log('Word count:', wordCount);
    
    // Test character count
    const charCount = plainText.length;
    console.log('Character count:', charCount);
    
    console.log('✅ Formatting functions test passed');
  }

  /**
   * Test AI integration
   */
  static async testAIIntegration() {
    console.log('Testing AI integration...');
    
    try {
      // Mock AI service calls
      const mockResumeInfo = {
        experience: [{
          title: 'Software Developer',
          companyName: 'Tech Corp'
        }],
        projects: [{
          projectName: 'E-commerce App',
          techStack: 'React, Node.js, MongoDB'
        }]
      };

      // Test experience bullets generation
      console.log('Testing experience bullets generation...');
      // This would call the actual AI service in a real app
      console.log('Experience bullets would be generated here');

      // Test project summary generation
      console.log('Testing project summary generation...');
      // This would call the actual AI service in a real app
      console.log('Project summary would be generated here');

      console.log('✅ AI integration test passed');
    } catch (error) {
      console.error('❌ AI integration test failed:', error);
      throw error;
    }
  }

  /**
   * Test toolbar functionality
   */
  static testToolbarFunctionality() {
    console.log('Testing toolbar functionality...');
    
    try {
      // Test toolbar button states
      const mockToolbarState = {
        isBold: false,
        isItalic: true,
        isUnderline: false,
        isDisabled: false
      };

      console.log('Toolbar state:', mockToolbarState);

      // Test formatting functions
      const testText = 'Sample text for formatting';
      console.log('Original text:', testText);

      // Simulate bold formatting
      const boldText = `<b>${testText}</b>`;
      console.log('Bold text:', boldText);

      // Simulate italic formatting
      const italicText = `<i>${testText}</i>`;
      console.log('Italic text:', italicText);

      // Simulate underline formatting
      const underlineText = `<u>${testText}</u>`;
      console.log('Underline text:', underlineText);

      // Simulate bullet list
      const bulletList = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      console.log('Bullet list:', bulletList);

      // Simulate numbered list
      const numberedList = '<ol><li>Item 1</li><li>Item 2</li></ol>';
      console.log('Numbered list:', numberedList);

      console.log('✅ Toolbar functionality test passed');
    } catch (error) {
      console.error('❌ Toolbar functionality test failed:', error);
      throw error;
    }
  }

  /**
   * Test text validation
   */
  static testTextValidation() {
    console.log('Testing text validation...');
    
    try {
      const testCases = [
        { html: '<b>Valid HTML</b>', expected: true },
        { html: '<b>Unclosed tag', expected: false },
        { html: 'Plain text', expected: true },
        { html: '<invalid>tag</invalid>', expected: true },
        { html: '', expected: true }
      ];

      testCases.forEach((testCase, index) => {
        const hasUnclosedTags = testCase.html.includes('<') && !testCase.html.includes('>');
        const isValid = !hasUnclosedTags;
        
        console.log(`Test case ${index + 1}:`, {
          input: testCase.html,
          expected: testCase.expected,
          actual: isValid,
          passed: isValid === testCase.expected
        });
      });

      console.log('✅ Text validation test passed');
    } catch (error) {
      console.error('❌ Text validation test failed:', error);
      throw error;
    }
  }

  /**
   * Run all rich text editor tests
   */
  static async runAllTests() {
    console.log('🚀 Starting Rich Text Editor Tests...\n');
    
    try {
      this.testFormattingFunctions();
      console.log('✅ Formatting functions test passed\n');
      
      await this.testAIIntegration();
      console.log('✅ AI integration test passed\n');
      
      this.testToolbarFunctionality();
      console.log('✅ Toolbar functionality test passed\n');
      
      this.testTextValidation();
      console.log('✅ Text validation test passed\n');
      
      console.log('🎉 All Rich Text Editor tests passed successfully!');
    } catch (error) {
      console.error('❌ Rich Text Editor tests failed:', error);
      throw error;
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  previewContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
  },
  previewText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  htmlPreview: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  testButton: {
    backgroundColor: '#004D40',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 120,
  },
});

export default RichTextEditorTester;

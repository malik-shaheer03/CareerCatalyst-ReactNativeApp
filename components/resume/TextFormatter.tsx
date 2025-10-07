import React from 'react';
import { Text, StyleSheet, View } from 'react-native';

// Types
export interface FormattedTextProps {
  text: string;
  style?: any;
  numberOfLines?: number;
  allowFontScaling?: boolean;
}

// HTML to React Native Text converter
export class TextFormatter {
  /**
   * Convert HTML to React Native Text components
   */
  static htmlToText(html: string): React.ReactNode[] {
    if (!html) return [];

    // Split by HTML tags and process each part
    const parts = html.split(/(<[^>]*>)/);
    const result: React.ReactNode[] = [];
    let key = 0;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('<')) {
        // Skip HTML tags for now - we'll handle them in the component
        continue;
      } else if (part.trim()) {
        result.push(
          <Text key={key++} style={styles.plainText}>
            {part}
          </Text>
        );
      }
    }

    return result;
  }

  /**
   * Strip HTML tags from text
   */
  static stripHtml(html: string): string {
    if (!html) return '';
    
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .replace(/&amp;/g, '&') // Replace HTML entities
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Convert plain text to HTML
   */
  static textToHtml(text: string): string {
    if (!text) return '';
    
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br/>');
  }

  /**
   * Format text with basic HTML support
   */
  static formatText(text: string): React.ReactNode[] {
    if (!text) return [];

    const parts = text.split(/(<[^>]*>)/);
    const result: React.ReactNode[] = [];
    let key = 0;
    let currentStyle = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.startsWith('<')) {
        // Handle HTML tags
        if (part.includes('<b>') || part.includes('<strong>')) {
          currentStyle = { ...currentStyle, fontWeight: 'bold' };
        } else if (part.includes('<i>') || part.includes('<em>')) {
          currentStyle = { ...currentStyle, fontStyle: 'italic' };
        } else if (part.includes('<u>')) {
          currentStyle = { ...currentStyle, textDecorationLine: 'underline' };
        } else if (part.includes('</b>') || part.includes('</strong>')) {
          currentStyle = { ...currentStyle, fontWeight: 'normal' };
        } else if (part.includes('</i>') || part.includes('</em>')) {
          currentStyle = { ...currentStyle, fontStyle: 'normal' };
        } else if (part.includes('</u>')) {
          currentStyle = { ...currentStyle, textDecorationLine: 'none' };
        } else if (part.includes('<br/>') || part.includes('<br>')) {
          result.push(<Text key={key++}>{'\n'}</Text>);
        } else if (part.includes('<ul>')) {
          // Start unordered list
          continue;
        } else if (part.includes('</ul>')) {
          // End unordered list
          continue;
        } else if (part.includes('<ol>')) {
          // Start ordered list
          continue;
        } else if (part.includes('</ol>')) {
          // End ordered list
          continue;
        } else if (part.includes('<li>')) {
          // List item
          const content = part.replace(/<li[^>]*>/, '').replace(/<\/li>/, '');
          result.push(
            <Text key={key++} style={[styles.listItem, currentStyle]}>
              • {content}
            </Text>
          );
        }
      } else if (part.trim()) {
        // Regular text
        result.push(
          <Text key={key++} style={[styles.plainText, currentStyle]}>
            {part}
          </Text>
        );
      }
    }

    return result;
  }

  /**
   * Get word count from HTML text
   */
  static getWordCount(html: string): number {
    const plainText = this.stripHtml(html);
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Get character count from HTML text
   */
  static getCharacterCount(html: string): number {
    const plainText = this.stripHtml(html);
    return plainText.length;
  }

  /**
   * Validate HTML content
   */
  static validateHtml(html: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for unclosed tags
    const openTags = html.match(/<[^/][^>]*>/g) || [];
    const closeTags = html.match(/<\/[^>]*>/g) || [];
    
    if (openTags.length !== closeTags.length) {
      errors.push('Unclosed HTML tags detected');
    }
    
    // Check for invalid tags
    const invalidTags = html.match(/<[^>]*[^/]>[^<]*$/g);
    if (invalidTags) {
      errors.push('Invalid HTML structure detected');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Formatted Text Component
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  style,
  numberOfLines,
  allowFontScaling = true
}) => {
  const formattedText = TextFormatter.formatText(text);
  
  return (
    <Text 
      style={[styles.container, style]} 
      numberOfLines={numberOfLines}
      allowFontScaling={allowFontScaling}
    >
      {formattedText}
    </Text>
  );
};

// HTML Preview Component
export const HtmlPreview: React.FC<{
  html: string;
  style?: any;
  maxHeight?: number;
}> = ({ html, style, maxHeight = 200 }) => {
  const formattedText = TextFormatter.formatText(html);
  
  return (
    <View style={[styles.previewContainer, { maxHeight }, style]}>
      <Text style={styles.previewText}>
        {formattedText}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  plainText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginLeft: 16,
    marginVertical: 2,
  },
  previewContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default TextFormatter;

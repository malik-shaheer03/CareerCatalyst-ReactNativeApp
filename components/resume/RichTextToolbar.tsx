import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

// Types
export interface ToolbarButtonProps {
  icon: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  size?: number;
  color?: string;
  label?: string;
  tooltip?: string;
}

export interface RichTextToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onBulletList: () => void;
  onNumberedList: () => void;
  onLineBreak: () => void;
  onClearFormatting: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onLink?: () => void;
  onStrikeThrough?: () => void;
  disabled?: boolean;
  showAdvanced?: boolean;
  style?: any;
}

// Individual Toolbar Button Component
export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  onPress,
  active = false,
  disabled = false,
  size = 20,
  color = '#666',
  label,
  tooltip
}) => (
  <TouchableOpacity
    style={[
      styles.toolbarButton,
      active && styles.toolbarButtonActive,
      disabled && styles.toolbarButtonDisabled
    ]}
    onPress={onPress}
    disabled={disabled}
    accessibilityLabel={tooltip || label}
    accessibilityRole="button"
  >
    <Icon 
      name={icon} 
      size={size} 
      color={disabled ? '#ccc' : (active ? '#004D40' : color)} 
    />
    {label && (
      <Text style={[
        styles.toolbarButtonLabel,
        active && styles.toolbarButtonLabelActive,
        disabled && styles.toolbarButtonLabelDisabled
      ]}>
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

// Separator Component
export const ToolbarSeparator: React.FC<{ style?: any }> = ({ style }) => (
  <View style={[styles.toolbarSeparator, style]} />
);

// Main Rich Text Toolbar Component
export const RichTextToolbar: React.FC<RichTextToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onBulletList,
  onNumberedList,
  onLineBreak,
  onClearFormatting,
  onUndo,
  onRedo,
  onLink,
  onStrikeThrough,
  disabled = false,
  showAdvanced = false,
  style
}) => {
  const screenWidth = Dimensions.get('window').width;
  const isSmallScreen = screenWidth < 400;

  return (
    <View style={[styles.toolbar, style]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.toolbarContent}
      >
        {/* Basic Formatting */}
        <View style={styles.toolbarSection}>
          <ToolbarButton
            icon="format-bold"
            onPress={onBold}
            disabled={disabled}
            tooltip="Bold"
            size={isSmallScreen ? 18 : 20}
          />
          <ToolbarButton
            icon="format-italic"
            onPress={onItalic}
            disabled={disabled}
            tooltip="Italic"
            size={isSmallScreen ? 18 : 20}
          />
          <ToolbarButton
            icon="format-underline"
            onPress={onUnderline}
            disabled={disabled}
            tooltip="Underline"
            size={isSmallScreen ? 18 : 20}
          />
          
          {showAdvanced && onStrikeThrough && (
            <ToolbarButton
              icon="format-strikethrough"
              onPress={onStrikeThrough}
              disabled={disabled}
              tooltip="Strikethrough"
              size={isSmallScreen ? 18 : 20}
            />
          )}
        </View>

        <ToolbarSeparator />

        {/* Lists */}
        <View style={styles.toolbarSection}>
          <ToolbarButton
            icon="format-list-bulleted"
            onPress={onBulletList}
            disabled={disabled}
            tooltip="Bullet List"
            size={isSmallScreen ? 18 : 20}
          />
          <ToolbarButton
            icon="format-list-numbered"
            onPress={onNumberedList}
            disabled={disabled}
            tooltip="Numbered List"
            size={isSmallScreen ? 18 : 20}
          />
        </View>

        <ToolbarSeparator />

        {/* Line Breaks */}
        <View style={styles.toolbarSection}>
          <ToolbarButton
            icon="format-line-spacing"
            onPress={onLineBreak}
            disabled={disabled}
            tooltip="Line Break"
            size={isSmallScreen ? 18 : 20}
          />
        </View>

        {/* Advanced Options */}
        {showAdvanced && (
          <>
            <ToolbarSeparator />
            
            <View style={styles.toolbarSection}>
              {onUndo && (
                <ToolbarButton
                  icon="undo"
                  onPress={onUndo}
                  disabled={disabled}
                  tooltip="Undo"
                  size={isSmallScreen ? 18 : 20}
                />
              )}
              {onRedo && (
                <ToolbarButton
                  icon="redo"
                  onPress={onRedo}
                  disabled={disabled}
                  tooltip="Redo"
                  size={isSmallScreen ? 18 : 20}
                />
              )}
              {onLink && (
                <ToolbarButton
                  icon="link"
                  onPress={onLink}
                  disabled={disabled}
                  tooltip="Add Link"
                  size={isSmallScreen ? 18 : 20}
                />
              )}
            </View>
          </>
        )}

        <ToolbarSeparator />

        {/* Clear Formatting */}
        <View style={styles.toolbarSection}>
          <ToolbarButton
            icon="format-clear"
            onPress={onClearFormatting}
            disabled={disabled}
            tooltip="Clear Formatting"
            size={isSmallScreen ? 18 : 20}
          />
        </View>
      </ScrollView>
    </View>
  );
};

// Compact Toolbar for smaller screens
export const CompactRichTextToolbar: React.FC<RichTextToolbarProps> = (props) => {
  return (
    <RichTextToolbar
      {...props}
      showAdvanced={false}
      style={styles.compactToolbar}
    />
  );
};

// Full Toolbar with all features
export const FullRichTextToolbar: React.FC<RichTextToolbarProps> = (props) => {
  return (
    <RichTextToolbar
      {...props}
      showAdvanced={true}
      style={styles.fullToolbar}
    />
  );
};

const styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 8,
    minHeight: 48,
  },
  toolbarContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
  toolbarButtonLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  toolbarButtonLabelActive: {
    color: '#004D40',
    fontWeight: '600',
  },
  toolbarButtonLabelDisabled: {
    color: '#ccc',
  },
  toolbarSeparator: {
    width: 1,
    height: 24,
    backgroundColor: '#dee2e6',
    marginHorizontal: 8,
  },
  compactToolbar: {
    minHeight: 40,
  },
  fullToolbar: {
    minHeight: 56,
  },
});

export default RichTextToolbar;

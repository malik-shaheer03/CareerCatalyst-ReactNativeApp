import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Get screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Types
export interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'delete' | 'warning' | 'info' | 'success';
}

// Main Confirmation Modal Component
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#ff6b35',
  onConfirm,
  onCancel,
  type = 'delete'
}) => {
  // Get icon and colors based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'delete':
        return {
          icon: 'delete-alert',
          iconColor: '#ff6b35',
          confirmBg: '#ff6b35',
          confirmText: '#fff',
          cancelBg: '#f5f5f5',
          cancelText: '#666',
        };
      case 'warning':
        return {
          icon: 'alert-circle',
          iconColor: '#ff9800',
          confirmBg: '#ff9800',
          confirmText: '#fff',
          cancelBg: '#f5f5f5',
          cancelText: '#666',
        };
      case 'info':
        return {
          icon: 'information',
          iconColor: '#2196f3',
          confirmBg: '#2196f3',
          confirmText: '#fff',
          cancelBg: '#f5f5f5',
          cancelText: '#666',
        };
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#4caf50',
          confirmBg: '#4caf50',
          confirmText: '#fff',
          cancelBg: '#f5f5f5',
          cancelText: '#666',
        };
      default:
        return {
          icon: 'help-circle',
          iconColor: '#666',
          confirmBg: '#666',
          confirmText: '#fff',
          cancelBg: '#f5f5f5',
          cancelText: '#666',
        };
    }
  };

  const typeConfig = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* Blur Background */}
      <View style={styles.overlay}>
        {Platform.OS === 'ios' ? (
          <BlurView
            style={styles.blurView}
            intensity={20}
            tint="dark"
          />
        ) : Platform.OS === 'web' ? (
          <View style={styles.webBlur} />
        ) : (
          <View style={styles.androidBlur} />
        )}
        
        {/* Modal Content */}
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: `${typeConfig.iconColor}15` }]}>
              <Icon 
                name={typeConfig.icon} 
                size={48} 
                color={typeConfig.iconColor} 
              />
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: typeConfig.cancelBg }]}
                onPress={onCancel}
                activeOpacity={0.8}
              >
                <Text style={[styles.buttonText, { color: typeConfig.cancelText }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>

              {/* Confirm Button */}
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[confirmColor, `${confirmColor}dd`]}
                  style={styles.gradientButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.buttonText, { color: typeConfig.confirmText }]}>
                    {confirmText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  androidBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  webBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  modalContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
    marginHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    // Gradient will be applied via LinearGradient
  },
  gradientButton: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ConfirmationModal;

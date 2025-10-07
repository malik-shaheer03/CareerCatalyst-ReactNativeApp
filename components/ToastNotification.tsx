import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Types
export interface ToastNotificationProps {
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onHide?: () => void;
  position?: 'top' | 'bottom';
  showIcon?: boolean;
  actionText?: string;
  onActionPress?: () => void;
}

// Main Toast Notification Component
const ToastNotification: React.FC<ToastNotificationProps> = ({
  visible,
  message,
  type = 'success',
  duration = 3000,
  onHide,
  position = 'top',
  showIcon = true,
  actionText,
  onActionPress,
}) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Get type configuration
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'check-circle',
          iconColor: '#4CAF50',
          backgroundColor: '#E8F5E8',
          borderColor: '#4CAF50',
          textColor: '#2E7D32',
        };
      case 'error':
        return {
          icon: 'alert-circle',
          iconColor: '#F44336',
          backgroundColor: '#FFEBEE',
          borderColor: '#F44336',
          textColor: '#C62828',
        };
      case 'warning':
        return {
          icon: 'alert',
          iconColor: '#FF9800',
          backgroundColor: '#FFF3E0',
          borderColor: '#FF9800',
          textColor: '#E65100',
        };
      case 'info':
        return {
          icon: 'information',
          iconColor: '#2196F3',
          backgroundColor: '#E3F2FD',
          borderColor: '#2196F3',
          textColor: '#1565C0',
        };
      default:
        return {
          icon: 'check-circle',
          iconColor: '#4CAF50',
          backgroundColor: '#E8F5E8',
          borderColor: '#4CAF50',
          textColor: '#2E7D32',
        };
    }
  };

  const typeConfig = getTypeConfig();

  // Show animation
  useEffect(() => {
    if (visible) {
      const startValue = position === 'top' ? -100 : 100;
      slideAnim.setValue(startValue);
      opacityAnim.setValue(0);
      scaleAnim.setValue(0.8);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, position]);

  // Hide animation
  const hideToast = () => {
    const endValue = position === 'top' ? -100 : 100;
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: endValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  // Handle manual dismiss
  const handleDismiss = () => {
    hideToast();
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          [position]: 50,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          {
            backgroundColor: typeConfig.backgroundColor,
            borderColor: typeConfig.borderColor,
          },
        ]}
      >
        {/* Icon */}
        {showIcon && (
          <View style={[styles.iconContainer, { backgroundColor: typeConfig.iconColor }]}>
            <Icon name={typeConfig.icon} size={20} color="#FFFFFF" />
          </View>
        )}

        {/* Message */}
        <Text
          style={[styles.message, { color: typeConfig.textColor }]}
          numberOfLines={2}
        >
          {message}
        </Text>

        {/* Action Button */}
        {actionText && onActionPress && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: typeConfig.iconColor }]}
            onPress={onActionPress}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: typeConfig.iconColor }]}>
              {actionText}
            </Text>
          </TouchableOpacity>
        )}

        {/* Dismiss Button */}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <Icon name="close" size={16} color={typeConfig.textColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    elevation: 10,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 56,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dismissButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default ToastNotification;

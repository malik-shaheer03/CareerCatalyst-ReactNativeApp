import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Animated, Dimensions, View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface NotificationContextType {
  showNotification: (notification: Omit<NotificationData, 'id'>) => void;
  hideNotification: (id: string) => void;
  hideAllNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback((notification: Omit<NotificationData, 'id'>) => {
    const id = Date.now().toString();
    const newNotification: NotificationData = {
      ...notification,
      id,
      duration: notification.duration || 4000,
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-hide notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        hideNotification(id);
      }, newNotification.duration);
    }
  }, []);

  const hideNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const hideAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification, hideAllNotifications }}>
      {children}
      <NotificationContainer notifications={notifications} onHide={hideNotification} />
    </NotificationContext.Provider>
  );
};

interface NotificationContainerProps {
  notifications: NotificationData[];
  onHide: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({ notifications, onHide }) => {
  return (
    <>
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={onHide}
        />
      ))}
    </>
  );
};

interface NotificationItemProps {
  notification: NotificationData;
  onHide: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onHide }) => {
  const translateY = new Animated.Value(-100);
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  React.useEffect(() => {
    // Show animation
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleHide = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide(notification.id);
    });
  };

  const getNotificationStyle = () => {
    switch (notification.type) {
      case 'success':
        return {
          backgroundColor: '#00A389',
          borderColor: '#00C4A1',
          icon: 'check-circle',
          iconColor: '#FFFFFF',
        };
      case 'error':
        return {
          backgroundColor: '#EF4444',
          borderColor: '#F87171',
          icon: 'alert-circle',
          iconColor: '#FFFFFF',
        };
      case 'warning':
        return {
          backgroundColor: '#F59E0B',
          borderColor: '#FBBF24',
          icon: 'alert-triangle',
          iconColor: '#FFFFFF',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#3B82F6',
          borderColor: '#60A5FA',
          icon: 'information',
          iconColor: '#FFFFFF',
        };
    }
  };

  const style = getNotificationStyle();

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 50,
        left: 16,
        right: 16,
        zIndex: 1000,
        transform: [{ translateY }, { scale }],
        opacity,
      }}
    >
      <NotificationCard
        notification={notification}
        style={style}
        onHide={handleHide}
      />
    </Animated.View>
  );
};

interface NotificationCardProps {
  notification: NotificationData;
  style: {
    backgroundColor: string;
    borderColor: string;
    icon: string;
    iconColor: string;
  };
  onHide: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, style, onHide }) => {

  return (
    <View style={[styles.notificationCard, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
      <View style={styles.notificationContent}>
        <View style={styles.iconContainer}>
          <Icon name={style.icon} size={24} color={style.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationMessage}>{notification.message}</Text>
        </View>
        <TouchableOpacity onPress={onHide} style={styles.closeButton}>
          <Icon name="close" size={20} color={style.iconColor} />
        </TouchableOpacity>
      </View>
      {notification.action && (
        <TouchableOpacity style={styles.actionButton} onPress={notification.action.onPress}>
          <Text style={styles.actionButtonText}>{notification.action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  notificationCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
  },
  notificationMessage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    fontFamily: Platform.OS === 'android' ? 'Roboto-Regular' : 'System',
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Platform.OS === 'android' ? 'Roboto-Medium' : 'System',
  },
});

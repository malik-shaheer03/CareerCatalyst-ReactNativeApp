import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNotificationService } from '@/lib/notification-service';

export const NotificationDemo: React.FC = () => {
  const { notifications } = useNotificationService();

  const demoNotifications = [
    {
      title: 'Login Success',
      action: () => notifications.loginSuccess('employee'),
      icon: 'check-circle',
      color: '#00A389',
    },
    {
      title: 'Signup Success',
      action: () => notifications.signupSuccess('employer'),
      icon: 'account-plus',
      color: '#00A389',
    },
    {
      title: 'Logout Success',
      action: () => notifications.logoutSuccess(),
      icon: 'logout',
      color: '#3B82F6',
    },
    {
      title: 'Login Error',
      action: () => notifications.loginError('Invalid email or password'),
      icon: 'alert-circle',
      color: '#EF4444',
    },
    {
      title: 'Signup Error',
      action: () => notifications.signupError('Email already in use'),
      icon: 'alert-circle',
      color: '#EF4444',
    },
    {
      title: 'Job Applied',
      action: () => notifications.jobApplied('Senior React Developer'),
      icon: 'briefcase',
      color: '#00A389',
    },
    {
      title: 'Resume Uploaded',
      action: () => notifications.resumeUploaded(),
      icon: 'file-document',
      color: '#00A389',
    },
    {
      title: 'Interview Scheduled',
      action: () => notifications.interviewScheduled('Tech Corp', 'Dec 15, 2024'),
      icon: 'calendar',
      color: '#00A389',
    },
    {
      title: 'Profile Updated',
      action: () => notifications.profileUpdated(),
      icon: 'account-edit',
      color: '#00A389',
    },
    {
      title: 'Network Error',
      action: () => notifications.networkError(),
      icon: 'wifi-off',
      color: '#EF4444',
    },
    {
      title: 'Feature Coming Soon',
      action: () => notifications.featureComingSoon('Advanced Analytics'),
      icon: 'rocket-launch',
      color: '#3B82F6',
    },
    {
      title: 'Custom Warning',
      action: () => notifications.customWarning('Low Storage', 'You are running low on storage space'),
      icon: 'alert-triangle',
      color: '#F59E0B',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Icon name="bell-outline" size={32} color="#00A389" />
        <Text style={styles.headerTitle}>Notification Demo</Text>
        <Text style={styles.headerSubtitle}>Test different notification types</Text>
      </View>

      <View style={styles.grid}>
        {demoNotifications.map((notification, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.notificationButton, { borderLeftColor: notification.color }]}
            onPress={notification.action}
            activeOpacity={0.7}
          >
            <View style={styles.buttonContent}>
              <Icon name={notification.icon} size={24} color={notification.color} />
              <Text style={styles.buttonText}>{notification.title}</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap any button above to see the notification in action!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
    fontFamily: 'System',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  grid: {
    gap: 12,
  },
  notificationButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    fontFamily: 'System',
  },
  footer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

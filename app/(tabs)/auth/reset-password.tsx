import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { verifyOTPAndResetPassword } from '@/lib/services/backend-api';
import {
  validatePassword,
  getPasswordStrengthColor,
  getPasswordStrengthPercentage,
  type PasswordValidationResult,
} from '@/lib/utils/password-validation';
import { useToast } from '@/lib/ToastContext';

const { width } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();
  const { showToast } = useToast();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [validation, setValidation] = useState<PasswordValidationResult | null>(null);
  const [touched, setTouched] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Validate password on change
  useEffect(() => {
    if (newPassword) {
      const result = validatePassword(newPassword);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [newPassword]);

  const handleResetPassword = async () => {
    setTouched(true);

    // Validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (validation && !validation.isValid) {
      Alert.alert('Weak Password', 'Please ensure your password meets all requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsResetting(true);

    try {
      await verifyOTPAndResetPassword(email, otp, newPassword);
      
      // Show success toast with proper configuration
      showToast({
        message: 'Password reset successfully! You can now login with your new password.',
        type: 'success',
        duration: 3000,
        position: 'top',
        showIcon: true,
      });
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.replace('/auth/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      showToast({
        message: error.message || 'Failed to reset password. Please try again.',
        type: 'error',
        duration: 4000,
        position: 'top',
        showIcon: true,
      });
    } finally {
      setIsResetting(false);
    }
  };

  const renderPasswordStrengthBar = () => {
    if (!validation || !newPassword) return null;

    const percentage = getPasswordStrengthPercentage(validation);
    const color = getPasswordStrengthColor(validation.strength);

    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBarBackground}>
          <View 
            style={[
              styles.strengthBarFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={[styles.strengthText, { color }]}>
          {validation.strength.replace('-', ' ').toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderPasswordChecks = () => {
    if (!validation || !touched) return null;

    const checks = [
      { key: 'minLength', label: '8+ characters', checked: validation.checks.minLength },
      { key: 'hasUppercase', label: 'Uppercase letter', checked: validation.checks.hasUppercase },
      { key: 'hasLowercase', label: 'Lowercase letter', checked: validation.checks.hasLowercase },
      { key: 'hasNumber', label: 'Number', checked: validation.checks.hasNumber },
      { key: 'hasSpecialChar', label: 'Special character', checked: validation.checks.hasSpecialChar },
    ];

    return (
      <View style={styles.checksContainer}>
        <Text style={styles.checksTitle}>Password Requirements:</Text>
        {checks.map((check) => (
          <View key={check.key} style={styles.checkItem}>
            <Icon
              name={check.checked ? 'check-circle' : 'circle-outline'}
              size={18}
              color={check.checked ? '#10B981' : '#9CA3AF'}
            />
            <Text style={[
              styles.checkText,
              check.checked && styles.checkTextValid
            ]}>
              {check.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#004D40', '#00A389', '#26A69A']}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[
                styles.formWrapper,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Icon name="lock-reset" size={40} color="#00A389" />
                </View>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.subtitle}>
                  Create a strong, secure password for your account
                </Text>
              </View>

              {/* New Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>New Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      setTouched(true);
                    }}
                    placeholder="Enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showNewPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Strength Bar */}
              {renderPasswordStrengthBar()}

              {/* Password Requirements */}
              {renderPasswordChecks()}

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Icon name="lock-check" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Icon
                      name={showConfirmPassword ? 'eye-off' : 'eye'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {touched && confirmPassword && newPassword !== confirmPassword && (
                  <Text style={styles.errorText}>Passwords do not match</Text>
                )}
              </View>

              {/* Reset Button */}
              <TouchableOpacity
                style={[
                  styles.resetButton,
                  (isResetting || !validation?.isValid) && styles.buttonDisabled
                ]}
                onPress={handleResetPassword}
                disabled={isResetting || !validation?.isValid}
              >
                {isResetting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Icon name="check-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.resetButtonText}>Reset Password</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Security Info */}
              <View style={styles.infoBox}>
                <Icon name="shield-check" size={20} color="#00A389" />
                <Text style={styles.infoText}>
                  Your password will be encrypted and securely stored
                </Text>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Add extra padding to clear tab bar
  },
  formWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  inputIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  eyeIcon: {
    padding: 12,
  },
  strengthContainer: {
    marginBottom: 20,
  },
  strengthBarBackground: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  checksContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  checksTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  checkTextValid: {
    color: '#10B981',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  resetButton: {
    flexDirection: 'row',
    backgroundColor: '#00A389',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#00A389',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E0F2F1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#00A389',
    marginLeft: 8,
    lineHeight: 18,
  },
});

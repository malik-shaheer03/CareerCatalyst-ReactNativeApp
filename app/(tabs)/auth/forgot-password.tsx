import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const { width, height } = Dimensions.get('window');

interface FormErrors {
  email?: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Clear error when field changes
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate form
  const validateForm = () => {
    let isValid = true;
    const newErrors: FormErrors = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
      console.log('✅ Password reset email sent successfully');
    } catch (err: any) {
      console.error('❌ Password reset error:', err);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
        setErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.back();
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
          <View style={styles.contentContainer}>
            <Animated.View 
              style={[
                styles.formWrapper,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim }
                  ]
                }
              ]}
            >
              {/* Back Button */}
              <TouchableOpacity style={styles.backButton} onPress={handleBackToLogin}>
                <Icon name="arrow-left" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Header with Logo */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <View style={styles.logoCircle}>
                    <Icon name="lock-reset" size={32} color="#00A389" />
                  </View>
                </View>
                <Text style={styles.title}>Forgot Password?</Text>
                <Text style={styles.subtitle}>
                  {emailSent 
                    ? 'Check your email for reset instructions'
                    : 'Enter your email address and we\'ll send you instructions to reset your password'}
                </Text>
              </View>

              {!emailSent && (
                <>
                  {/* Email Input */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                      <Icon name="email-outline" size={22} color="#666" style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        placeholder="Enter your email address"
                        placeholderTextColor="#999"
                        value={email}
                        onChangeText={(text) => {
                          setEmail(text);
                          clearError('email');
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        editable={!isSubmitting}
                      />
                    </View>
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
                  </View>

                  {/* Reset Password Button */}
                  <TouchableOpacity
                    style={[styles.resetButton, isSubmitting && styles.buttonDisabled]}
                    onPress={handleResetPassword}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text style={styles.resetButtonText}>Send Reset Email</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {emailSent && (
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Icon name="check-circle" size={48} color="#4CAF50" />
                  </View>
                  <Text style={styles.successTitle}>Email Sent! 📧</Text>
                  <Text style={styles.successText}>
                    We've sent password reset instructions to:
                  </Text>
                  <Text style={styles.emailText}>{email}</Text>
                  <Text style={styles.instructionText}>
                    Please check your inbox and follow the instructions to reset your password. 
                    Don't forget to check your spam folder!
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                    disabled={isSubmitting}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.resendButtonText}>Try Different Email</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Back to Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={handleBackToLogin}>
                  <Text style={styles.loginLink}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
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
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    paddingTop: 40,
    paddingBottom: 100, // Account for tab bar height
    justifyContent: 'center',
  },
  formWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    backdropFilter: 'blur(10px)',
    width: '100%',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    height: 52,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
    minHeight: 52,
    justifyContent: 'center',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '400',
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: 50,
    lineHeight: 20,
    maxHeight: 50,
    overflow: 'hidden',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  resetButton: {
    backgroundColor: '#00A389',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
    shadowColor: '#00A389',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  successIconContainer: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  emailText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A389',
    textAlign: 'center',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  resendButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#00A389',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  resendButtonText: {
    color: '#00A389',
    fontSize: 14,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '400',
  },
  loginLink: {
    color: '#00A389',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});
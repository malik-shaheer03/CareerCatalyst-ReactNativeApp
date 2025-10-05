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
  Switch,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import GoogleSignin from '@/lib/google-signin-config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useNotificationService } from '@/lib/notification-service';

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  companyName?: string;
  companyLocation?: string;
}

const { width, height } = Dimensions.get('window');

export default function SignUpScreen() {
  const router = useRouter();
  const { notifications } = useNotificationService();

  // Switch state for Job Seeker/Employer
  const [isEmployer, setIsEmployer] = useState(false);

  // Common States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Employer-specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  
  // Job seeker fields
  const [fullName, setFullName] = useState('');

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

  // Validation function
  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

        // Field validation based on user type
    if (isEmployer) {
      if (!companyName.trim()) {
        newErrors.companyName = 'Company name is required';
      }
      if (!companyLocation.trim()) {
        newErrors.companyLocation = 'Company location is required';
      }
        } else {
          if (!fullName.trim()) {
            newErrors.fullName = 'Full name is required';
          }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear error when field changes
  const clearError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Email/Password signup handler
  const handleSignup = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields correctly');
      return;
    }

    console.log('🔍 Signup attempt - isEmployer:', isEmployer);
    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (isEmployer) {
        // Store employer data
        await addDoc(collection(db, "employers"), {
          uid: user.uid,
          email: user.email,
          companyName,
          companyWebsite,
          companyLocation,
          createdAt: new Date(),
        });

        console.log('✅ Employer account created successfully!');
        console.log('🔄 Attempting redirect to /employer-dashboard');
        
        // Show success notification
        notifications.signupSuccess('employer');
        
        // Direct navigation without alert
        try {
          router.replace('/(tabs)/dashboards/employer-dashboard');
          console.log('✅ Router replace successful');
        } catch (error) {
          console.error('❌ Router error:', error);
          router.push('/employer-dashboard');
        }
      } else {
        // Store employee data
        await addDoc(collection(db, "employees"), {
          uid: user.uid,
          email: user.email,
          fullName: fullName,
          createdAt: new Date(),
        });

        console.log('✅ Employee account created successfully!');
        console.log('🔄 Attempting redirect to /profile-setup');
        
        // Show success notification
        notifications.signupSuccess('employee');
        
        // Direct navigation without alert
        try {
          router.replace('/(tabs)/profile-setup');
          console.log('✅ Router replace successful');
        } catch (error) {
          console.error('❌ Router error:', error);
          router.push('/profile-setup');
        }
      }
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or try logging in.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      notifications.signupError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google signup handler
  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Get the users ID token
      const signInResult = await GoogleSignin.signIn();
      console.log('Google Sign-In result:', signInResult);
      
      // @ts-ignore - Google Sign-In response structure varies
      const idToken = signInResult.data?.idToken;
      
      if (!idToken) {
        throw new Error('Google Sign-In failed: No ID token received');
      }
      
      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);
      
      // Sign-in the user with the credential
      const result = await signInWithCredential(auth, googleCredential);
      const user = result.user;
      console.log('Firebase user created:', user.uid);

      if (isEmployer) {
        // Check if employer already exists
        const q = query(
          collection(db, "employers"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // New Employer: Save to Firestore
          await addDoc(collection(db, "employers"), {
            uid: user.uid,
            email: user.email,
            companyName,
            companyWebsite,
            companyLocation,
            createdAt: new Date(),
          });
        }

        console.log('✅ Employer Google signup successful!');
        console.log('🔄 Attempting redirect to /employer-dashboard');
        
        // Direct navigation without alert
        try {
          router.replace('/(tabs)/dashboards/employer-dashboard');
          console.log('✅ Router replace successful');
        } catch (error) {
          console.error('❌ Router error:', error);
          router.push('/employer-dashboard');
        }
      } else {
        // Check if employee already exists
        const q = query(
          collection(db, "employees"),
          where("uid", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // New User: Save to Firestore
          await addDoc(collection(db, "employees"), {
            uid: user.uid,
            email: user.email,
            fullName: fullName || 'Google User',
            createdAt: new Date(),
          });
        }

        console.log('✅ Employee Google signup successful!');
        console.log('🔄 Attempting redirect to /profile-setup');
        
        // Direct navigation without alert
        try {
          router.replace('/(tabs)/profile-setup');
          console.log('✅ Router replace successful');
        } catch (error) {
          console.error('❌ Router error:', error);
          router.push('/profile-setup');
        }
      }
    } catch (err: any) {
      console.error('❌ Google Sign-In error:', err);
      let errorMessage = 'Google Sign-In is not properly configured. Please use email/password signup or contact support.';
      
      if (err.message?.includes('webClientId')) {
        errorMessage = 'Google Sign-In is not configured. Please use email/password signup for now.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email. Please use email/password signup.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert('Google Sign-In Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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
            {/* Header with Logo */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Icon name="account-plus" size={32} color="#00A389" />
                </View>
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                {isEmployer
                  ? 'Join as an employer and find the best talent'
                  : 'Join as a job seeker and find your dream job'}
              </Text>
            </View>

          {/* User Type Switch */}
          <View style={styles.switchContainer}>
              <View style={styles.switchWrapper}>
                <Text style={[styles.switchLabel, !isEmployer && styles.switchLabelActive]}>
                  Job Seeker {!isEmployer && '✓'}
            </Text>
            <Switch
              value={isEmployer}
              onValueChange={(value) => {
                console.log('🔄 Toggle switch changed to:', value ? 'Employer' : 'Job Seeker');
                setIsEmployer(value);
              }}
                  trackColor={{ false: '#E0E0E0', true: '#00A389' }}
                  thumbColor={isEmployer ? '#FFFFFF' : '#FFFFFF'}
                  ios_backgroundColor="#E0E0E0"
                />
                <Text style={[styles.switchLabel, isEmployer && styles.switchLabelActive]}>
                  Employer {isEmployer && '✓'}
            </Text>
          </View>
              </View>

          {/* Grid Layout for All Fields */}
          <View style={styles.fieldsGrid}>
            {/* Row 1: Email and Password */}
            <View style={styles.gridRow}>
              <View style={styles.gridFieldHalf}>
                <Text style={styles.gridFieldLabel}>Email *</Text>
                <View style={[styles.gridInputWrapper, errors.email && styles.inputError]}>
                  <Icon name="email-outline" size={18} color="#666" style={styles.gridInputIcon} />
                  <View style={styles.textInputContainer}>
                  <TextInput
                      style={styles.gridTextInput}
                      placeholder="Email"
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
              />
            </View>
                </View>
                {errors.email ? <Text style={styles.gridErrorText}>{errors.email}</Text> : null}
          </View>

              <View style={styles.gridFieldHalf}>
                <Text style={styles.gridFieldLabel}>Password *</Text>
                <View style={[styles.gridInputWrapper, errors.password && styles.inputError]}>
                  <Icon name="lock-outline" size={18} color="#666" style={styles.gridInputIcon} />
                  <View style={styles.textInputContainer}>
              <TextInput
                      style={styles.gridTextInput}
                      placeholder="Password"
                      placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  clearError('password');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                      autoComplete="new-password"
              />
                  </View>
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                    style={styles.gridEyeIcon}
              >
                <Icon
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color="#666"
                />
              </TouchableOpacity>
            </View>
                {errors.password ? <Text style={styles.gridErrorText}>{errors.password}</Text> : null}
              </View>
          </View>

            {/* Row 2: Confirm Password and Name/Company */}
            <View style={styles.gridRow}>
              <View style={styles.gridFieldHalf}>
                <Text style={styles.gridFieldLabel}>Confirm *</Text>
                <View style={[styles.gridInputWrapper, errors.confirmPassword && styles.inputError]}>
                  <Icon name="lock-check-outline" size={18} color="#666" style={styles.gridInputIcon} />
                  <View style={styles.textInputContainer}>
              <TextInput
                      style={styles.gridTextInput}
                      placeholder="Confirm"
                      placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError('confirmPassword');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                      autoComplete="new-password"
              />
                  </View>
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.gridEyeIcon}
              >
                <Icon
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={16}
                      color="#666"
                />
              </TouchableOpacity>
            </View>
                {errors.confirmPassword ? <Text style={styles.gridErrorText}>{errors.confirmPassword}</Text> : null}
              </View>

              <View style={styles.gridFieldHalf}>
                <Text style={styles.gridFieldLabel}>{isEmployer ? 'Company *' : 'Full Name'}</Text>
                <View style={[styles.gridInputWrapper, isEmployer && errors.companyName && styles.inputError]}>
                  <Icon 
                    name={isEmployer ? "office-building-outline" : "account-outline"} 
                    size={18} 
                    color="#666" 
                    style={styles.gridInputIcon} 
                  />
                  <View style={styles.textInputContainer}>
                    <TextInput
                      style={styles.gridTextInput}
                      placeholder={isEmployer ? "Company" : "Full Name"}
                      placeholderTextColor="#999"
                      value={isEmployer ? companyName : fullName}
                      onChangeText={(text) => {
                        if (isEmployer) {
                          setCompanyName(text);
                          clearError('companyName');
                        } else {
                          setFullName(text);
                          clearError('fullName');
                        }
                      }}
                      autoCapitalize="words"
                    />
                  </View>
                </View>
                {isEmployer && errors.companyName ? (
                  <Text style={styles.gridErrorText}>{errors.companyName}</Text>
                ) : !isEmployer && errors.fullName ? (
                  <Text style={styles.gridErrorText}>{errors.fullName}</Text>
                ) : null}
              </View>
            </View>

            {/* Row 3: Employer-specific fields */}
            {isEmployer && (
              <View style={styles.gridRow}>
                <View style={styles.gridFieldHalf}>
                  <Text style={styles.gridFieldLabel}>Location *</Text>
                  <View style={[styles.gridInputWrapper, errors.companyLocation && styles.inputError]}>
                    <Icon name="map-marker-outline" size={18} color="#666" style={styles.gridInputIcon} />
                    <View style={styles.textInputContainer}>
                      <TextInput
                        style={styles.gridTextInput}
                        placeholder="Location"
                        placeholderTextColor="#999"
                        value={companyLocation}
                        onChangeText={(text) => {
                          setCompanyLocation(text);
                          clearError('companyLocation');
                        }}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>
                  {errors.companyLocation ? <Text style={styles.gridErrorText}>{errors.companyLocation}</Text> : null}
                </View>

                <View style={styles.gridFieldHalf}>
                  <Text style={styles.gridFieldLabel}>Website</Text>
                  <View style={styles.gridInputWrapper}>
                    <Icon name="web" size={18} color="#666" style={styles.gridInputIcon} />
                    <View style={styles.textInputContainer}>
                      <TextInput
                        style={styles.gridTextInput}
                        placeholder="Website"
                        placeholderTextColor="#999"
                        value={companyWebsite}
                        onChangeText={setCompanyWebsite}
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={isSubmitting}
              activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.signUpButtonText}>
                  {isEmployer ? 'Create Employer Account' : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

          {/* Google Sign Up Button */}
          <TouchableOpacity
            style={[styles.googleButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleGoogleSignup}
            disabled={isSubmitting}
              activeOpacity={0.8}
          >
              <Icon name="google" size={20} color="#666" style={styles.googleIcon} />
            <Text style={styles.googleButtonText}>
              {isEmployer ? 'Continue as Employer with Google' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
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
    paddingTop: 30,
    paddingBottom: 100, // Account for tab bar height
    justifyContent: 'center',
  },
  formWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
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
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0F2FE',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#004D40',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
  },
  switchContainer: {
    width: '100%',
    marginBottom: 16,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 4,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999999',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  switchLabelActive: {
    color: '#00A389',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  fieldsGrid: {
    width: '100%',
    marginBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  gridFieldHalf: {
    width: '48%',
  },
  gridFieldLabel: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 3,
    fontWeight: '600',
  },
  gridInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 6,
    height: 44,
    paddingHorizontal: 10,
    backgroundColor: '#FFFFFF',
    minHeight: 44,
    justifyContent: 'center',
  },
  gridInputIcon: {
    marginRight: 6,
  },
  textInputContainer: {
    flex: 1,
    height: 42,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  gridTextInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 12,
    fontWeight: '400',
    paddingVertical: 0,
    textAlignVertical: 'center',
    height: 42,
    lineHeight: 16,
    includeFontPadding: false,
    maxHeight: 42,
    overflow: 'hidden',
  },
  gridEyeIcon: {
    padding: 4,
  },
  gridErrorText: {
    color: '#EF4444',
    fontSize: 9,
    marginTop: 1,
    fontWeight: '500',
  },
  fieldLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '600',
  },
  employerFieldLabel: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 4,
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
  employerInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  employerInputIcon: {
    marginRight: 8,
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
  employerTextInput: {
    flex: 1,
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '400',
    paddingVertical: 0,
    textAlignVertical: 'center',
    includeFontPadding: false,
    height: 40,
    lineHeight: 18,
    maxHeight: 40,
    overflow: 'hidden',
  },
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  employerErrorText: {
    color: '#EF4444',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#00A389',
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 4,
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
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    height: 48,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleIcon: {
    marginRight: 12,
  },
  googleButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
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
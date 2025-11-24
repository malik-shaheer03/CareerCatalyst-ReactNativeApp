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
  Platform,
  ScrollView
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithCredential 
} from 'firebase/auth';
import GoogleSignin from '@/lib/google-signin-config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useNotificationService } from '@/lib/notification-service';

interface FormErrors {
  email?: string;
  password?: string;
}

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { notifications } = useNotificationService();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmployer, setIsEmployer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Friendly error mapping
  const getFriendlyError = (code: string) => {
    switch (code) {
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/invalid-email":
        return "Invalid email format.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup closed before completing sign in.";
      case "auth/cancelled-popup-request":
        return "Only one popup request is allowed at a time.";
      default:
        return "Authentication failed. Please try again.";
    }
  };

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

    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Email/password login handler
  const handleLogin = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Please fill in all required fields correctly');
      return;
    }

    console.log('🔍 Login attempt - isEmployer:', isEmployer);
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (isEmployer) {
        // Check if user exists in employer table
        console.log('🔍 Checking employer collection for user:', user.uid);
        const q = query(collection(db, "employers"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        console.log('📊 Employer query result:', snapshot.empty ? 'No documents found' : `${snapshot.size} documents found`);
        
        if (!snapshot.empty) {
          console.log('✅ Employer login successful!');
          console.log('🔄 Attempting redirect to /employer-dashboard');
          
          // Show success notification
          notifications.loginSuccess('employer');
          
          // Direct navigation without alert
          try {
            router.replace('/(tabs)/dashboards/employer-dashboard');
            console.log('✅ Router replace successful');
          } catch (error) {
            console.error('❌ Router error:', error);
            router.push('/employer-dashboard');
          }
        } else {
          console.log('❌ No employer account found for user:', user.uid);
          notifications.loginError('No employer account found for this email. Please check your login type or create an account.');
        }
      } else {
        // Check if user exists in employee table
        console.log('🔍 Checking employee collection for user:', user.uid);
        console.log('🔍 User email:', user.email);
        console.log('🔍 isEmployer state:', isEmployer);
        
        const q = query(collection(db, "employees"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        console.log('📊 Employee query result:', snapshot.empty ? 'No documents found' : `${snapshot.size} documents found`);
        
        if (!snapshot.empty) {
          console.log('✅ Employee login successful!');
          console.log('🔄 Attempting redirect to /user-dashboard');
          
          // Show success notification
          notifications.loginSuccess('employee');
          
          // Direct navigation without alert
          try {
            console.log('🔄 About to call router.replace("/user-dashboard")');
            router.replace('/(tabs)/dashboards/user-dashboard');
            console.log('✅ Router replace successful');
          } catch (error) {
            console.error('❌ Router error:', error);
            console.log('🔄 Trying router.push as fallback...');
            router.push('/(tabs)/dashboards/user-dashboard');
          }
        } else {
          console.log('❌ No employee account found for user:', user.uid);
          console.log('❌ This means user exists in Firebase Auth but not in employees collection');
          notifications.loginError('No job seeker account found for this email. Please check your login type or create an account.');
        }
      }
    } catch (err: any) {
      const friendly = getFriendlyError(err.code);
      notifications.loginError(friendly);
      
      // Map backend error to field if possible
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        setErrors(prev => ({ ...prev, email: friendly }));
      } else if (err.code === "auth/wrong-password") {
        setErrors(prev => ({ ...prev, password: friendly }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google login handler
  const handleGoogleSignIn = async () => {
    setErrors({});
    setIsSubmitting(true);
    
    try {
      // Check if Google Sign-In is properly configured
      console.log('Attempting Google Sign-In...');
      
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
        // Check if user exists in employer table
        console.log('🔍 Checking employer collection for Google user:', user.uid);
        const q = query(collection(db, "employers"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        console.log('📊 Employer Google query result:', snapshot.empty ? 'No documents found' : `${snapshot.size} documents found`);
        
        if (!snapshot.empty) {
          console.log('✅ Employer Google login successful!');
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
          console.log('❌ No employer account found for Google user:', user.uid);
          Alert.alert('Login Failed', 'No employer account found for this email. Please check your login type or create an account.');
        }
      } else {
        // Check if user exists in employee table
        console.log('🔍 Checking employee collection for Google user:', user.uid);
        const q = query(collection(db, "employees"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        console.log('📊 Employee Google query result:', snapshot.empty ? 'No documents found' : `${snapshot.size} documents found`);
        
        if (!snapshot.empty) {
          console.log('✅ Employee Google login successful!');
          console.log('🔄 Attempting redirect to /user-dashboard');
          
          // Direct navigation without alert
          try {
            router.replace('/(tabs)/dashboards/user-dashboard');
            console.log('✅ Router replace successful');
          } catch (error) {
            console.error('❌ Router error:', error);
            router.push('/(tabs)/dashboards/user-dashboard');
          }
        } else {
          console.log('❌ No employee account found for Google user:', user.uid);
          Alert.alert('Login Failed', 'No job seeker account found for this email. Please check your login type or create an account.');
        }
      }
    } catch (err: any) {
      console.error('❌ Google Sign-In error:', err);
      let errorMessage = 'Google Sign-In is not properly configured. Please use email/password login or contact support.';
      
      if (err.message?.includes('webClientId')) {
        errorMessage = 'Google Sign-In is not configured. Please use email/password login for now.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email. Please use email/password login.';
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
          <ScrollView 
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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
                  <Icon name="briefcase" size={32} color="#00A389" />
                </View>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                {isEmployer ? 'Sign in to your employer account' : 'Sign in to your job seeker account'}
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

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Email Address</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Icon name="email-outline" size={22} color="#666" style={styles.inputIcon} />
        <TextInput
                  style={styles.textInput}
                  placeholder="Enter your email"
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
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>
        
            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.fieldLabel}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Icon name="lock-outline" size={22} color="#666" style={styles.inputIcon} />
        <TextInput
                  style={styles.textInput}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
          value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
          secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
        </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Button */}
            <TouchableOpacity
              style={[styles.googleButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Icon name="google" size={20} color="#666" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>


            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>
                Don't have an account?{' '}
              </Text>
        <TouchableOpacity onPress={() => router.push('/auth/signup')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
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
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Better status bar handling
    paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Increased padding for tab bar
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
  switchContainer: {
    width: '100%',
    marginBottom: 20,
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
  eyeIcon: {
    padding: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#00A389',
    fontSize: 14,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '400',
  },
  signUpLink: {
    color: '#00A389',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
});

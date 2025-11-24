// lib/services/backend-api.ts
import axios, { AxiosError } from 'axios';

// Backend API Configuration
// TODO: Update these URLs to your deployed backend servers
const BACKEND_CONFIG = {
  PASSWORD_RESET_URL: 'http://localhost:5001', // Password reset & account deletion service
  EMAIL_SERVICE_URL: 'http://localhost:5000',   // Candidate email service
  RESUME_EMAIL_URL: 'http://localhost:5002',    // Resume email service
};

// Create axios instances with default config
const passwordResetAPI = axios.create({
  baseURL: BACKEND_CONFIG.PASSWORD_RESET_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const emailServiceAPI = axios.create({
  baseURL: BACKEND_CONFIG.EMAIL_SERVICE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const resumeEmailAPI = axios.create({
  baseURL: BACKEND_CONFIG.RESUME_EMAIL_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling utility
function handleAPIError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    
    if (axiosError.response) {
      // Server responded with error status
      return axiosError.response.data?.error || 
             axiosError.response.data?.message || 
             'Server error occurred';
    } else if (axiosError.request) {
      // Request made but no response
      return 'Unable to reach the server. Please check your internet connection.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
}

// ============= PASSWORD RESET SERVICES =============

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

/**
 * Send OTP to user's email for password reset
 */
export async function sendPasswordResetOTP(email: string): Promise<SendOTPResponse> {
  try {
    const response = await passwordResetAPI.post('/send-otp', { email });
    return response.data;
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
}

/**
 * Verify OTP code without resetting password
 */
export async function verifyOTP(email: string, otp: string): Promise<VerifyOTPResponse> {
  try {
    const response = await passwordResetAPI.post('/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
}

/**
 * Resend OTP to user's email
 */
export async function resendOTP(email: string): Promise<SendOTPResponse> {
  try {
    const response = await passwordResetAPI.post('/resend-otp', { email });
    return response.data;
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
}

/**
 * Verify OTP and reset password
 */
export async function verifyOTPAndResetPassword(
  email: string, 
  otp: string, 
  newPassword: string
): Promise<PasswordResetResponse> {
  try {
    const response = await passwordResetAPI.post('/verify-otp-and-reset', {
      email,
      otp,
      newPassword,
    });
    return response.data;
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
}

// ============= EMAIL SERVICES =============

export interface SendCandidateEmailRequest {
  to: string;
  subject: string;
  body: string;
  company: string;
  jobTitle: string;
  candidateName: string;
}

export interface SendCandidateEmailResponse {
  success: boolean;
  message?: string;
}

/**
 * Send professional email to job candidate from employer
 */
export async function sendCandidateEmail(
  data: SendCandidateEmailRequest
): Promise<SendCandidateEmailResponse> {
  try {
    const response = await emailServiceAPI.post('/send-candidate-email', data);
    return response.data;
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
}

// ============= RESUME EMAIL SERVICES =============

export interface SendResumeEmailRequest {
  recipientEmail: string;
  senderName: string;
  message?: string;
  pdfData: string; // base64 encoded PDF
  filename: string;
}

export interface SendResumeEmailResponse {
  success: boolean;
  message?: string;
}

/**
 * Send resume PDF via email
 */
export async function sendResumeEmail(
  data: SendResumeEmailRequest
): Promise<SendResumeEmailResponse> {
  try {
    const response = await resumeEmailAPI.post('/send-resume-email', data);
    return response.data;
  } catch (error) {
    const errorMessage = handleAPIError(error);
    throw new Error(errorMessage);
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Test backend connectivity
 */
export async function testBackendConnection(): Promise<{
  passwordResetService: boolean;
  emailService: boolean;
  resumeEmailService: boolean;
}> {
  const results = {
    passwordResetService: false,
    emailService: false,
    resumeEmailService: false,
  };

  try {
    await passwordResetAPI.get('/');
    results.passwordResetService = true;
  } catch (error) {
    console.log('Password reset service not available');
  }

  try {
    await emailServiceAPI.get('/');
    results.emailService = true;
  } catch (error) {
    console.log('Email service not available');
  }

  try {
    await resumeEmailAPI.get('/');
    results.resumeEmailService = true;
  } catch (error) {
    console.log('Resume email service not available');
  }

  return results;
}

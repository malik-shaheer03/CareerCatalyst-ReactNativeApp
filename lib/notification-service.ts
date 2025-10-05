import { useNotification } from './notification-context';

export const useNotificationService = () => {
  const { showNotification } = useNotification();

  const showSuccess = (title: string, message: string, action?: { label: string; onPress: () => void }) => {
    showNotification({
      type: 'success',
      title,
      message,
      duration: 4000,
      action,
    });
  };

  const showError = (title: string, message: string, action?: { label: string; onPress: () => void }) => {
    showNotification({
      type: 'error',
      title,
      message,
      duration: 5000,
      action,
    });
  };

  const showInfo = (title: string, message: string, action?: { label: string; onPress: () => void }) => {
    showNotification({
      type: 'info',
      title,
      message,
      duration: 4000,
      action,
    });
  };

  const showWarning = (title: string, message: string, action?: { label: string; onPress: () => void }) => {
    showNotification({
      type: 'warning',
      title,
      message,
      duration: 4500,
      action,
    });
  };

  // Predefined notification messages
  const notifications = {
    // Authentication notifications
    loginSuccess: (userType: string) => {
      showSuccess(
        'Welcome Back!',
        `Successfully logged in as ${userType === 'employer' ? 'Employer' : 'Job Seeker'}.`,
        { label: 'View Dashboard', onPress: () => {} }
      );
    },

    loginError: (error: string) => {
      showError(
        'Login Failed',
        error || 'Invalid email or password. Please try again.',
        { label: 'Try Again', onPress: () => {} }
      );
    },

    signupSuccess: (userType: string) => {
      showSuccess(
        'Account Created!',
        `Welcome! Your ${userType === 'employer' ? 'employer' : 'job seeker'} account has been created successfully.`,
        { label: 'Get Started', onPress: () => {} }
      );
    },

    signupError: (error: string) => {
      showError(
        'Signup Failed',
        error || 'Failed to create account. Please try again.',
        { label: 'Retry', onPress: () => {} }
      );
    },

    logoutSuccess: () => {
      showSuccess(
        'Logged Out',
        'You have been successfully logged out. See you next time!',
        { label: 'Login Again', onPress: () => {} }
      );
    },
    profileUpdated: () => {
      showSuccess(
        'Profile Updated',
        'Your profile has been successfully updated!',
        { label: 'View Profile', onPress: () => {} }
      );
    },
    profileUpdateError: (message: string) => {
      showError(
        'Update Failed',
        message,
        { label: 'Try Again', onPress: () => {} }
      );
    },

    passwordResetSent: () => {
      showInfo(
        'Reset Link Sent',
        'Password reset instructions have been sent to your email address.',
        { label: 'Check Email', onPress: () => {} }
      );
    },

    passwordResetError: (error: string) => {
      showError(
        'Reset Failed',
        error || 'Failed to send reset email. Please try again.',
        { label: 'Try Again', onPress: () => {} }
      );
    },

    // Profile and account notifications
    profileUpdated: () => {
      showSuccess(
        'Profile Updated',
        'Your profile information has been saved successfully.',
        { label: 'View Profile', onPress: () => {} }
      );
    },

    profileUpdateError: (error: string) => {
      showError(
        'Update Failed',
        error || 'Failed to update profile. Please try again.',
        { label: 'Retry', onPress: () => {} }
      );
    },

    // Job-related notifications
    jobApplied: (jobTitle: string) => {
      showSuccess(
        'Application Submitted',
        `Your application for "${jobTitle}" has been submitted successfully.`,
        { label: 'View Applications', onPress: () => {} }
      );
    },

    jobApplicationError: (error: string) => {
      showError(
        'Application Failed',
        error || 'Failed to submit application. Please try again.',
        { label: 'Retry', onPress: () => {} }
      );
    },

    jobSaved: (jobTitle: string) => {
      showInfo(
        'Job Saved',
        `"${jobTitle}" has been added to your saved jobs.`,
        { label: 'View Saved', onPress: () => {} }
      );
    },

    jobRemoved: (jobTitle: string) => {
      showInfo(
        'Job Removed',
        `"${jobTitle}" has been removed from your saved jobs.`,
        { label: 'View Jobs', onPress: () => {} }
      );
    },

    // Resume notifications
    resumeUploaded: () => {
      showSuccess(
        'Resume Uploaded',
        'Your resume has been uploaded and is now visible to employers.',
        { label: 'View Resume', onPress: () => {} }
      );
    },

    resumeUploadError: (error: string) => {
      showError(
        'Upload Failed',
        error || 'Failed to upload resume. Please try again.',
        { label: 'Retry Upload', onPress: () => {} }
      );
    },

    resumeUpdated: () => {
      showSuccess(
        'Resume Updated',
        'Your resume has been updated successfully.',
        { label: 'View Changes', onPress: () => {} }
      );
    },

    // Interview notifications
    interviewScheduled: (companyName: string, date: string) => {
      showSuccess(
        'Interview Scheduled',
        `Your interview with ${companyName} has been scheduled for ${date}.`,
        { label: 'View Details', onPress: () => {} }
      );
    },

    interviewCancelled: (companyName: string) => {
      showWarning(
        'Interview Cancelled',
        `Your interview with ${companyName} has been cancelled.`,
        { label: 'Reschedule', onPress: () => {} }
      );
    },

    // Career path notifications
    careerPathUpdated: () => {
      showSuccess(
        'Career Path Updated',
        'Your career development plan has been updated.',
        { label: 'View Plan', onPress: () => {} }
      );
    },

    skillAdded: (skillName: string) => {
      showInfo(
        'Skill Added',
        `"${skillName}" has been added to your skills profile.`,
        { label: 'View Skills', onPress: () => {} }
      );
    },

    // General notifications
    networkError: () => {
      showError(
        'Connection Error',
        'Please check your internet connection and try again.',
        { label: 'Retry', onPress: () => {} }
      );
    },

    loadingComplete: (action: string) => {
      showSuccess(
        'Complete',
        `${action} completed successfully.`,
        { label: 'Continue', onPress: () => {} }
      );
    },

    featureComingSoon: (feature: string) => {
      showInfo(
        'Coming Soon',
        `${feature} feature is under development and will be available soon.`,
        { label: 'Learn More', onPress: () => {} }
      );
    },

    // Custom notifications
    customSuccess: (title: string, message: string, action?: { label: string; onPress: () => void }) => {
      showSuccess(title, message, action);
    },

    customError: (title: string, message: string, action?: { label: string; onPress: () => void }) => {
      showError(title, message, action);
    },

    customInfo: (title: string, message: string, action?: { label: string; onPress: () => void }) => {
      showInfo(title, message, action);
    },

    customWarning: (title: string, message: string, action?: { label: string; onPress: () => void }) => {
      showWarning(title, message, action);
    },
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    notifications,
  };
};

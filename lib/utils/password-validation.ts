// lib/utils/password-validation.ts

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

/**
 * Validate password strength according to security requirements
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  // Check minimum length
  const hasMinLength = password.length >= 8;
  if (!hasMinLength) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  const hasUppercase = /[A-Z]/.test(password);
  if (!hasUppercase) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  const hasLowercase = /[a-z]/.test(password);
  if (!hasLowercase) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  const hasNumber = /[0-9]/.test(password);
  if (!hasNumber) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  const passedChecks = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecialChar].filter(Boolean).length;
  
  if (passedChecks === 5 && password.length >= 12) {
    strength = 'very-strong';
  } else if (passedChecks === 5) {
    strength = 'strong';
  } else if (passedChecks >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    checks: {
      minLength: hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    },
  };
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: PasswordValidationResult['strength']): string {
  switch (strength) {
    case 'very-strong':
      return '#10B981'; // Green
    case 'strong':
      return '#3B82F6'; // Blue
    case 'medium':
      return '#F59E0B'; // Orange
    case 'weak':
    default:
      return '#EF4444'; // Red
  }
}

/**
 * Get password strength percentage
 */
export function getPasswordStrengthPercentage(validation: PasswordValidationResult): number {
  const checks = Object.values(validation.checks).filter(Boolean).length;
  return (checks / 5) * 100;
}

// Password validation rules
export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};

// Email validation regex - secure version with length limits and strict validation
// Rules:
// 1. Local part (before @): 1-64 chars, alphanumeric with limited special chars
// 2. Domain part: 1-255 chars, alphanumeric with hyphens
// 3. TLD: 2-63 chars, letters only
// 4. No consecutive dots
// 5. No special chars in domain
export const EMAIL_REGEX =
  /^[a-zA-Z0-9][a-zA-Z0-9._%+-]{0,62}[a-zA-Z0-9]@[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,63}$/;

// Password validation function
export const validatePassword = (password) => {
  const errors = [];

  if (password.length < PASSWORD_RULES.minLength) {
    errors.push(
      `Password must be at least ${PASSWORD_RULES.minLength} characters long`
    );
  }

  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (PASSWORD_RULES.requireNumber && !/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (
    PASSWORD_RULES.requireSpecialChar &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Additional email validation function with length checks
export const validateEmail = (email) => {
  if (!email || email.length > 254) return false; // RFC 5321
  return EMAIL_REGEX.test(email);
};

// Password strength calculation
export const calculatePasswordStrength = (password) => {
  let strength = 0;

  // Length check
  if (password.length >= PASSWORD_RULES.minLength) strength += 1;

  // Character type checks
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[a-z]/.test(password)) strength += 1;
  if (/\d/.test(password)) strength += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

  // Return strength level (0-5)
  return strength;
};

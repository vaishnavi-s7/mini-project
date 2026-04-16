/**
 * Validate a password against the app's password policy.
 */
export const validatePassword = (password) => {
  const rules = {
    length: password.length >= 6 && password.length <= 24,
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    number: /[0-9]/.test(password),
  };

  return {
    ...rules,
    valid: Object.values(rules).every(Boolean),
  };
};

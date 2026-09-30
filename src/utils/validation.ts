/**
 * Reusable field rules. Kept as plain functions so they compose into any
 * form's schema and can be unit tested without rendering anything.
 */

// Deliberately permissive: the server is the real authority on deliverability,
// and over-strict client regexes reject valid addresses.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const required =
  (label: string) =>
  (value: unknown): string | undefined =>
    String(value ?? '').trim().length === 0 ? `${label} is required` : undefined;

export const email = (value: unknown): string | undefined => {
  const text = String(value ?? '').trim();
  if (text.length === 0) {
    return 'Email address is required';
  }
  return EMAIL_PATTERN.test(text) ? undefined : 'Enter a valid email address';
};

export const minLength =
  (length: number, label: string) =>
  (value: unknown): string | undefined =>
    String(value ?? '').length < length
      ? `${label} must be at least ${length} characters`
      : undefined;

export const phoneNumber = (value: unknown): string | undefined => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 0) {
    return 'Phone number is required';
  }
  return digits.length >= 8 ? undefined : 'Enter a valid phone number';
};

/** Runs rules in order and returns the first failure. */
export const compose =
  <T>(...rules: ((value: T) => string | undefined)[]) =>
  (value: T): string | undefined => {
    for (const rule of rules) {
      const message = rule(value);
      if (message) {
        return message;
      }
    }
    return undefined;
  };

export type PasswordStrength = 0 | 1 | 2 | 3 | 4;

/**
 * Scores a password 0-4 for the strength meter. Length carries the most
 * weight because it matters more than character classes in practice.
 */
export const scorePassword = (password: string): PasswordStrength => {
  if (password.length === 0) {
    return 0;
  }
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4) as PasswordStrength;
};

export const PASSWORD_STRENGTH_LABELS: Record<PasswordStrength, string> = {
  0: '',
  1: 'Weak password',
  2: 'Fair password',
  3: 'Good password',
  4: 'Strong password',
};

/**
 * Input sanitization utilities for security
 */

/**
 * Sanitize field names - allow only alphanumeric, underscore, and hyphen
 */
export const sanitizeFieldName = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .slice(0, 100) // Limit length
    .replace(/[^a-zA-Z0-9_-]/g, '') // Remove special characters
    .replace(/^[^a-zA-Z_]/, c => c === '-' ? '_' : c); // Ensure starts with letter or underscore
};

/**
 * Sanitize pattern input - allow alphanumeric, hyphens, X, and #
 */
export const sanitizePattern = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .slice(0, 100)
    .replace(/[^a-zA-Z0-9X#\-]/g, '')
    .toUpperCase();
};

/**
 * Sanitize prefix/suffix - allow alphanumeric and common symbols
 */
export const sanitizeAffix = (input: string): string => {
  if (!input) return '';
  return input
    .trim()
    .slice(0, 50)
    .replace(/[<>\"'`]/g, '') // Remove dangerous characters
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate and sanitize numeric input
 */
export const sanitizeNumber = (input: unknown, min?: number, max?: number): number => {
  const num = Number(input);
  
  if (isNaN(num)) return 0;
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;
  
  return num;
};

/**
 * Sanitize percentage input
 */
export const sanitizePercentage = (input: unknown): number => {
  return Math.max(0, Math.min(100, sanitizeNumber(input)));
};

/**
 * Escape HTML special characters to prevent XSS
 */
export const escapeHtml = (input: string): string => {
  if (!input) return '';
  const htmlMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  return input.replace(/[&<>\"'\/]/g, char => htmlMap[char]);
};

/**
 * Validate email format (basic)
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize and validate data generator config
 */
export const sanitizeGenerationConfig = (config: any): any => {
  return {
    count: sanitizeNumber(config.count, 1, 100000),
    malePercentage: sanitizePercentage(config.malePercentage),
    femalePercentage: sanitizePercentage(config.femalePercentage),
    ageLower: sanitizeNumber(config.ageLower, 0, 150),
    ageUpper: sanitizeNumber(config.ageUpper, 0, 150)
  };
};

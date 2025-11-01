/**
 * Input validation utilities for Excel export and file operations
 */

/**
 * Validate filename for safety and compatibility
 */
export const validateFilename = (filename: string): { valid: boolean; sanitized: string; error?: string } => {
  if (!filename || typeof filename !== 'string') {
    return { valid: false, sanitized: '', error: 'Filename must be a non-empty string' };
  }

  // Remove invalid characters for most filesystems
  const invalidChars = /[<>:"|?*\\/]/g;
  let sanitized = filename.replace(invalidChars, '_');

  // Remove null characters
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length (keep under 255 characters for most filesystems)
  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200);
  }

  // Ensure it's not empty after sanitization
  if (!sanitized.trim()) {
    return { valid: false, sanitized: '', error: 'Filename cannot be empty after sanitization' };
  }

  return { valid: true, sanitized: sanitized.trim() };
};

/**
 * Validate URL format
 */
export const validateUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate data URL format
 */
export const validateDataUrl = (dataUrl: string): boolean => {
  if (!dataUrl || typeof dataUrl !== 'string') {
    return false;
  }

  // Check if it's a valid data URL (data:image/...)
  return /^data:image\/\w+;base64,.+$/i.test(dataUrl);
};

/**
 * Validate crop data structure
 */
export const validateCropData = (crop: any): { valid: boolean; error?: string } => {
  if (!crop || typeof crop !== 'object') {
    return { valid: false, error: 'Crop data must be an object' };
  }

  const requiredFields = ['dataUrl', 'timestamp', 'pageUrl', 'width', 'height', 'x', 'y'];

  for (const field of requiredFields) {
    if (!(field in crop)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  if (!validateDataUrl(crop.dataUrl)) {
    return { valid: false, error: 'Invalid data URL format' };
  }

  if (typeof crop.timestamp !== 'number' || crop.timestamp <= 0) {
    return { valid: false, error: 'Invalid timestamp' };
  }

  if (typeof crop.width !== 'number' || crop.width <= 0) {
    return { valid: false, error: 'Invalid width' };
  }

  if (typeof crop.height !== 'number' || crop.height <= 0) {
    return { valid: false, error: 'Invalid height' };
  }

  if (typeof crop.x !== 'number' || crop.x < 0) {
    return { valid: false, error: 'Invalid x coordinate' };
  }

  if (typeof crop.y !== 'number' || crop.y < 0) {
    return { valid: false, error: 'Invalid y coordinate' };
  }

  return { valid: true };
};

/**
 * Validate export options
 */
export const validateExportOptions = (options: any): { valid: boolean; error?: string } => {
  if (!options || typeof options !== 'object') {
    return { valid: false, error: 'Options must be an object' };
  }

  if (typeof options.includeMetadata !== 'boolean') {
    return { valid: false, error: 'includeMetadata must be a boolean' };
  }

  if (options.filename !== undefined && typeof options.filename !== 'string') {
    return { valid: false, error: 'filename must be a string' };
  }

  if (options.filename) {
    const filenameValidation = validateFilename(options.filename);
    if (!filenameValidation.valid) {
      return { valid: false, error: filenameValidation.error };
    }
  }

  return { valid: true };
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';

  // Remove HTML tags and dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
};

/**
 * Check if browser has permission to access a resource
 */
export const canAccessResource = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    // Allow data URLs, blob URLs, and extension URLs
    return (
      urlObj.protocol === 'data:' ||
      urlObj.protocol === 'blob:' ||
      urlObj.protocol === 'chrome-extension:' ||
      urlObj.protocol === 'chrome:'
    );
  } catch {
    return false;
  }
};

/**
 * Standardized error messages for consistent UX
 */

export const ERROR_MESSAGES = {
  // Screenshot errors
  SCREENSHOT_CAPTURE_FAILED: 'Failed to capture screenshot. Please try again.',
  SCREENSHOT_CORS_ISSUE: 'Cannot capture this page due to browser security restrictions.',
  SCREENSHOT_PERMISSION_DENIED: 'Permission denied. Please check extension permissions.',
  SCREENSHOT_NO_ACTIVE_TAB: 'No active tab found. Please click on a webpage first.',

  // Excel export errors
  EXCEL_EXPORT_FAILED: 'Failed to export to Excel. Please try again.',
  EXCEL_INVALID_DATA: 'Invalid data format for Excel export.',
  EXCEL_FILE_WRITE_FAILED: 'Failed to write Excel file.',
  EXCEL_CORRUPTED_FILE: 'Generated Excel file may be corrupted.',

  // Batch operations
  BATCH_EMPTY: 'No crops to export. Capture screenshots first.',
  BATCH_STORAGE_FAILED: 'Failed to store crop. Storage may be full.',
  BATCH_CLEAR_FAILED: 'Failed to clear crops.',
  BATCH_EXPORT_EMPTY: 'Cannot export empty batch.',

  // Validation errors
  INVALID_FILENAME: 'Invalid filename. Using default.',
  INVALID_CROP_DATA: 'Invalid crop data structure.',
  INVALID_URL: 'Invalid URL format.',
  INVALID_DATA_URL: 'Invalid screenshot data format.',

  // General errors
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NOT_IMPLEMENTED: 'This feature is not yet implemented.',
  OPERATION_CANCELLED: 'Operation cancelled.',
};

export const SUCCESS_MESSAGES = {
  SCREENSHOT_CAPTURED: 'Screenshot captured ✓',
  SCREENSHOT_CAPTURED_FULL: 'Full page screenshot captured ✓',
  SCREENSHOT_CROPPED: 'Screenshot cropped successfully ✓',
  EXPORT_TO_EXCEL_SUCCESS: 'Exported to Excel successfully ✓',
  BATCH_EXPORT_SUCCESS: 'Batch exported to Excel ✓',
  CROP_STORED: 'Crop stored for batch export ✓',
  CROPS_CLEARED: 'Crops cleared ✓',
  SETTINGS_SAVED: 'Settings saved ✓',
};

export const INFO_MESSAGES = {
  CROP_MODE_ACTIVE: 'Crop mode activated. Hold Alt and drag to select.',
  BATCH_CROP_COUNT: (count: number) => `${count} crop${count !== 1 ? 's' : ''} stored`,
  EXPORT_BATCH_COUNT: (count: number) => `Exporting ${count} crop${count !== 1 ? 's' : ''}...`,
  STORAGE_WARNING: 'Storage is getting full. Consider exporting and clearing crops.',
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('cors')) {
      return ERROR_MESSAGES.SCREENSHOT_CORS_ISSUE;
    } else if (message.includes('permission')) {
      return ERROR_MESSAGES.SCREENSHOT_PERMISSION_DENIED;
    } else if (message.includes('storage')) {
      return ERROR_MESSAGES.BATCH_STORAGE_FAILED;
    } else if (message.includes('invalid')) {
      return ERROR_MESSAGES.INVALID_CROP_DATA;
    }

    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

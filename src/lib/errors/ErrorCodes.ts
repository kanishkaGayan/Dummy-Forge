export enum ErrorCategory {
  GENERATION = 'GEN',
  EXPORT = 'EXP',
  VALIDATION = 'VAL',
  SYSTEM = 'SYS',
  NETWORK = 'NET',
  DATABASE = 'DB'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorCode {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  userMessage: string;
  resolution: string;
  logLevel: 'info' | 'warn' | 'error' | 'fatal';
}

export const ERROR_CODES: Record<string, ErrorCode> = {
  'DF-GEN-001': {
    code: 'DF-GEN-001',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Failed to generate unique value after maximum attempts',
    userMessage: 'Unable to generate enough unique values for this field. Try reducing the number of records or removing uniqueness constraint.',
    resolution: 'Reduce record count, remove unique constraint, or use a different field type',
    logLevel: 'warn'
  },
  'DF-GEN-002': {
    code: 'DF-GEN-002',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'Invalid field configuration',
    userMessage: 'One or more fields are configured incorrectly. Please check your field settings.',
    resolution: 'Review field configuration and ensure all required parameters are valid',
    logLevel: 'error'
  },
  'DF-GEN-003': {
    code: 'DF-GEN-003',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'Record count exceeds maximum allowed',
    userMessage: 'You can generate a maximum of 10,000 records at a time.',
    resolution: 'Reduce the record count to 10,000 or less',
    logLevel: 'warn'
  },
  'DF-GEN-004': {
    code: 'DF-GEN-004',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'No fields selected for generation',
    userMessage: 'Please select at least one field to generate data.',
    resolution: 'Select one or more fields from the available options',
    logLevel: 'warn'
  },
  'DF-GEN-005': {
    code: 'DF-GEN-005',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.CRITICAL,
    message: 'Data generation engine initialization failed',
    userMessage: 'Unable to start data generation. Please restart the application.',
    resolution: 'Restart application. If problem persists, reinstall DummyForge',
    logLevel: 'fatal'
  },
  'DF-GEN-006': {
    code: 'DF-GEN-006',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid demographics configuration',
    userMessage: 'Gender percentages must add up to 100%. Please adjust your settings.',
    resolution: 'Ensure male + female + other percentages equal 100%',
    logLevel: 'warn'
  },
  'DF-GEN-007': {
    code: 'DF-GEN-007',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid age range configuration',
    userMessage: 'Age range is invalid. Minimum age must be less than maximum age.',
    resolution: 'Set a valid age range (e.g., min: 18, max: 65)',
    logLevel: 'warn'
  },
  'DF-EXP-001': {
    code: 'DF-EXP-001',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to SQL format',
    userMessage: 'Unable to export data to SQL. The file may be in use or you may not have write permissions.',
    resolution: 'Close any programs using the file and ensure you have write permissions',
    logLevel: 'error'
  },
  'DF-EXP-002': {
    code: 'DF-EXP-002',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to CSV format',
    userMessage: 'Unable to export data to CSV. The file may be in use or you may not have write permissions.',
    resolution: 'Close any programs using the file and ensure you have write permissions',
    logLevel: 'error'
  },
  'DF-EXP-003': {
    code: 'DF-EXP-003',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to PDF format',
    userMessage: 'Unable to create PDF file. You may not have enough disk space or write permissions.',
    resolution: 'Check available disk space and file permissions',
    logLevel: 'error'
  },
  'DF-EXP-004': {
    code: 'DF-EXP-004',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to TXT format',
    userMessage: 'Unable to export data to text file. The file may be in use or you may not have write permissions.',
    resolution: 'Close any programs using the file and ensure you have write permissions',
    logLevel: 'error'
  },
  'DF-EXP-005': {
    code: 'DF-EXP-005',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'No data available for export',
    userMessage: 'No data has been generated yet. Please generate data before exporting.',
    resolution: 'Generate data first, then try exporting again',
    logLevel: 'warn'
  },
  'DF-EXP-006': {
    code: 'DF-EXP-006',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.MEDIUM,
    message: 'Export format not selected',
    userMessage: 'Please select at least one export format (SQL, CSV, TXT, PDF, or XLSX).',
    resolution: 'Check at least one export format option',
    logLevel: 'warn'
  },
  'DF-EXP-007': {
    code: 'DF-EXP-007',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'File path contains invalid characters',
    userMessage: 'The filename contains invalid characters. Please use only letters, numbers, hyphens, and underscores.',
    resolution: 'Remove special characters from the filename',
    logLevel: 'warn'
  },
  'DF-EXP-008': {
    code: 'DF-EXP-008',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.MEDIUM,
    message: 'Export file size exceeds recommended limit',
    userMessage: 'The export file is very large and may take time to open. Consider reducing the number of records.',
    resolution: 'Reduce record count or split into multiple exports',
    logLevel: 'warn'
  },
  'DF-VAL-001': {
    code: 'DF-VAL-001',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid field name',
    userMessage: 'Field name is invalid. Use only letters, numbers, and underscores. No spaces allowed.',
    resolution: 'Enter a valid field name (e.g., "student_id", "firstName")',
    logLevel: 'warn'
  },
  'DF-VAL-002': {
    code: 'DF-VAL-002',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Duplicate field name',
    userMessage: 'This field name already exists. Please use a unique name.',
    resolution: 'Choose a different field name',
    logLevel: 'warn'
  },
  'DF-VAL-003': {
    code: 'DF-VAL-003',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid custom pattern',
    userMessage: 'The pattern you entered is invalid. Use "X" for letters and "#" for numbers.',
    resolution: 'Enter a valid pattern (e.g., "XXX-###-XXX")',
    logLevel: 'warn'
  },
  'DF-VAL-004': {
    code: 'DF-VAL-004',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid number range',
    userMessage: 'Invalid number range. Minimum must be less than maximum.',
    resolution: 'Enter a valid range where min < max',
    logLevel: 'warn'
  },
  'DF-VAL-005': {
    code: 'DF-VAL-005',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid string length',
    userMessage: 'String length must be between 1 and 1000 characters.',
    resolution: 'Enter a length between 1 and 1000',
    logLevel: 'warn'
  },
  'DF-SYS-001': {
    code: 'DF-SYS-001',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'Insufficient disk space',
    userMessage: 'Not enough disk space to save the file. Please free up some space and try again.',
    resolution: 'Free up disk space (at least 100MB recommended)',
    logLevel: 'error'
  },
  'DF-SYS-002': {
    code: 'DF-SYS-002',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'Permission denied',
    userMessage: 'Permission denied. You don\'t have access to save files in this location.',
    resolution: 'Choose a different save location or run as administrator',
    logLevel: 'error'
  },
  'DF-SYS-003': {
    code: 'DF-SYS-003',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    message: 'Out of memory',
    userMessage: 'Not enough memory to complete this operation. Try generating fewer records.',
    resolution: 'Reduce record count or close other applications',
    logLevel: 'fatal'
  },
  'DF-SYS-004': {
    code: 'DF-SYS-004',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'File already exists',
    userMessage: 'A file with this name already exists. Do you want to overwrite it?',
    resolution: 'Choose a different filename or confirm overwrite',
    logLevel: 'warn'
  },
  'DF-SYS-005': {
    code: 'DF-SYS-005',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    message: 'Application crash detected',
    userMessage: 'DummyForge encountered an unexpected error and needs to restart.',
    resolution: 'The application will restart. Your work has been saved.',
    logLevel: 'fatal'
  },
  'DF-SYS-006': {
    code: 'DF-SYS-006',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    message: 'Configuration file corrupted',
    userMessage: 'Your settings file is corrupted. Default settings will be restored.',
    resolution: 'Settings have been reset to defaults',
    logLevel: 'warn'
  },
  'DF-DB-001': {
    code: 'DF-DB-001',
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    message: 'Database connection failed',
    userMessage: 'Unable to connect to the local database. Please restart the application.',
    resolution: 'Restart application. If problem persists, reinstall DummyForge',
    logLevel: 'error'
  },
  'DF-DB-002': {
    code: 'DF-DB-002',
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    message: 'Database query failed',
    userMessage: 'Failed to save your configuration. Please try again.',
    resolution: 'Try saving again. If problem persists, restart the application',
    logLevel: 'error'
  },
  'DF-NET-001': {
    code: 'DF-NET-001',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    message: 'Update check failed',
    userMessage: 'Unable to check for updates. Please check your internet connection.',
    resolution: 'Check internet connection and try again later',
    logLevel: 'warn'
  }
};

export function getErrorByCode(code: string): ErrorCode | undefined {
  return ERROR_CODES[code];
}

export function createError(
  code: string,
  technicalDetails?: string,
  context?: Record<string, unknown>
): DummyForgeError {
  const errorDef = getErrorByCode(code);

  if (!errorDef) {
    return new DummyForgeError(
      'DF-SYS-999',
      ErrorCategory.SYSTEM,
      ErrorSeverity.CRITICAL,
      'Unknown error',
      'An unexpected error occurred. Please contact support.',
      'Restart the application',
      'fatal',
      technicalDetails,
      context
    );
  }

  return new DummyForgeError(
    errorDef.code,
    errorDef.category,
    errorDef.severity,
    errorDef.message,
    errorDef.userMessage,
    errorDef.resolution,
    errorDef.logLevel,
    technicalDetails,
    context
  );
}

export class DummyForgeError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly resolution: string;
  public readonly logLevel: 'info' | 'warn' | 'error' | 'fatal';
  public readonly technicalDetails?: string;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;
  public readonly stackTrace?: string;

  constructor(
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    userMessage: string,
    resolution: string,
    logLevel: 'info' | 'warn' | 'error' | 'fatal',
    technicalDetails?: string,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DummyForgeError';
    this.code = code;
    this.category = category;
    this.severity = severity;
    this.userMessage = userMessage;
    this.resolution = resolution;
    this.logLevel = logLevel;
    this.technicalDetails = technicalDetails;
    this.context = context;
    this.timestamp = new Date();
    this.stackTrace = this.stack;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DummyForgeError);
    }
  }

  toLogFormat(): string {
    return JSON.stringify(
      {
        code: this.code,
        category: this.category,
        severity: this.severity,
        message: this.message,
        userMessage: this.userMessage,
        resolution: this.resolution,
        technicalDetails: this.technicalDetails,
        context: this.context,
        timestamp: this.timestamp.toISOString(),
        stackTrace: this.stackTrace
      },
      null,
      2
    );
  }

  toUserDisplay(): {
    title: string;
    message: string;
    resolution: string;
    code: string;
  } {
    return {
      title: this.getSeverityTitle(),
      message: this.userMessage,
      resolution: this.resolution,
      code: this.code
    };
  }

  private getSeverityTitle(): string {
    switch (this.severity) {
      case ErrorSeverity.LOW:
        return 'Information';
      case ErrorSeverity.MEDIUM:
        return 'Warning';
      case ErrorSeverity.HIGH:
        return 'Error';
      case ErrorSeverity.CRITICAL:
        return 'Critical Error';
      default:
        return 'Error';
    }
  }
}

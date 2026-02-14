# DummyForge Error Handling System - Complete Implementation

## Overview
Production-ready error handling system with unique error codes, user-friendly messages, logging, and recovery strategies.

---

## Error Code Structure

```
Format: DF-[CATEGORY]-[NUMBER]

Categories:
- GEN: Data Generation errors
- EXP: Export errors
- VAL: Validation errors
- SYS: System/File errors
- NET: Network errors (future)
- DB: Database errors (future)
```

---

## ErrorCodes.ts - Complete Implementation

```typescript
// src/lib/errors/ErrorCodes.ts

export enum ErrorCategory {
  GENERATION = 'GEN',
  EXPORT = 'EXP',
  VALIDATION = 'VAL',
  SYSTEM = 'SYS',
  NETWORK = 'NET',
  DATABASE = 'DB',
}

export enum ErrorSeverity {
  LOW = 'LOW',           // Informational, can continue
  MEDIUM = 'MEDIUM',     // Warning, may affect results
  HIGH = 'HIGH',         // Error, operation failed
  CRITICAL = 'CRITICAL', // Critical, app may crash
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

// ============================================================================
// ERROR DEFINITIONS
// ============================================================================

export const ERROR_CODES: Record<string, ErrorCode> = {
  // ========== GENERATION ERRORS (DF-GEN-xxx) ==========
  'DF-GEN-001': {
    code: 'DF-GEN-001',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Failed to generate unique value after maximum attempts',
    userMessage: 'Unable to generate enough unique values for this field. Try reducing the number of records or removing uniqueness constraint.',
    resolution: 'Reduce record count, remove unique constraint, or use a different field type',
    logLevel: 'warn',
  },

  'DF-GEN-002': {
    code: 'DF-GEN-002',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'Invalid field configuration',
    userMessage: 'One or more fields are configured incorrectly. Please check your field settings.',
    resolution: 'Review field configuration and ensure all required parameters are valid',
    logLevel: 'error',
  },

  'DF-GEN-003': {
    code: 'DF-GEN-003',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'Record count exceeds maximum allowed',
    userMessage: 'You can generate a maximum of 10,000 records at a time.',
    resolution: 'Reduce the record count to 10,000 or less',
    logLevel: 'warn',
  },

  'DF-GEN-004': {
    code: 'DF-GEN-004',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.HIGH,
    message: 'No fields selected for generation',
    userMessage: 'Please select at least one field to generate data.',
    resolution: 'Select one or more fields from the available options',
    logLevel: 'warn',
  },

  'DF-GEN-005': {
    code: 'DF-GEN-005',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.CRITICAL,
    message: 'Data generation engine initialization failed',
    userMessage: 'Unable to start data generation. Please restart the application.',
    resolution: 'Restart application. If problem persists, reinstall DummyForge',
    logLevel: 'fatal',
  },

  'DF-GEN-006': {
    code: 'DF-GEN-006',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid demographics configuration',
    userMessage: 'Gender percentages must add up to 100%. Please adjust your settings.',
    resolution: 'Ensure male + female + other percentages equal 100%',
    logLevel: 'warn',
  },

  'DF-GEN-007': {
    code: 'DF-GEN-007',
    category: ErrorCategory.GENERATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid age range configuration',
    userMessage: 'Age range is invalid. Minimum age must be less than maximum age.',
    resolution: 'Set a valid age range (e.g., min: 18, max: 65)',
    logLevel: 'warn',
  },

  // ========== EXPORT ERRORS (DF-EXP-xxx) ==========
  'DF-EXP-001': {
    code: 'DF-EXP-001',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to SQL format',
    userMessage: 'Unable to export data to SQL. The file may be in use or you may not have write permissions.',
    resolution: 'Close any programs using the file and ensure you have write permissions',
    logLevel: 'error',
  },

  'DF-EXP-002': {
    code: 'DF-EXP-002',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to CSV format',
    userMessage: 'Unable to export data to CSV. The file may be in use or you may not have write permissions.',
    resolution: 'Close any programs using the file and ensure you have write permissions',
    logLevel: 'error',
  },

  'DF-EXP-003': {
    code: 'DF-EXP-003',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to PDF format',
    userMessage: 'Unable to create PDF file. You may not have enough disk space or write permissions.',
    resolution: 'Check available disk space and file permissions',
    logLevel: 'error',
  },

  'DF-EXP-004': {
    code: 'DF-EXP-004',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'Failed to export to TXT format',
    userMessage: 'Unable to export data to text file. The file may be in use or you may not have write permissions.',
    resolution: 'Close any programs using the file and ensure you have write permissions',
    logLevel: 'error',
  },

  'DF-EXP-005': {
    code: 'DF-EXP-005',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'No data available for export',
    userMessage: 'No data has been generated yet. Please generate data before exporting.',
    resolution: 'Generate data first, then try exporting again',
    logLevel: 'warn',
  },

  'DF-EXP-006': {
    code: 'DF-EXP-006',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.MEDIUM,
    message: 'Export format not selected',
    userMessage: 'Please select at least one export format (SQL, CSV, TXT, or PDF).',
    resolution: 'Check at least one export format option',
    logLevel: 'warn',
  },

  'DF-EXP-007': {
    code: 'DF-EXP-007',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.HIGH,
    message: 'File path contains invalid characters',
    userMessage: 'The filename contains invalid characters. Please use only letters, numbers, hyphens, and underscores.',
    resolution: 'Remove special characters from the filename',
    logLevel: 'warn',
  },

  'DF-EXP-008': {
    code: 'DF-EXP-008',
    category: ErrorCategory.EXPORT,
    severity: ErrorSeverity.MEDIUM,
    message: 'Export file size exceeds recommended limit',
    userMessage: 'The export file is very large and may take time to open. Consider reducing the number of records.',
    resolution: 'Reduce record count or split into multiple exports',
    logLevel: 'warn',
  },

  // ========== VALIDATION ERRORS (DF-VAL-xxx) ==========
  'DF-VAL-001': {
    code: 'DF-VAL-001',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid field name',
    userMessage: 'Field name is invalid. Use only letters, numbers, and underscores. No spaces allowed.',
    resolution: 'Enter a valid field name (e.g., "student_id", "firstName")',
    logLevel: 'warn',
  },

  'DF-VAL-002': {
    code: 'DF-VAL-002',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Duplicate field name',
    userMessage: 'This field name already exists. Please use a unique name.',
    resolution: 'Choose a different field name',
    logLevel: 'warn',
  },

  'DF-VAL-003': {
    code: 'DF-VAL-003',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid custom pattern',
    userMessage: 'The pattern you entered is invalid. Use "X" for letters and "#" for numbers.',
    resolution: 'Enter a valid pattern (e.g., "XXX-###-XXX")',
    logLevel: 'warn',
  },

  'DF-VAL-004': {
    code: 'DF-VAL-004',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid number range',
    userMessage: 'Invalid number range. Minimum must be less than maximum.',
    resolution: 'Enter a valid range where min < max',
    logLevel: 'warn',
  },

  'DF-VAL-005': {
    code: 'DF-VAL-005',
    category: ErrorCategory.VALIDATION,
    severity: ErrorSeverity.MEDIUM,
    message: 'Invalid string length',
    userMessage: 'String length must be between 1 and 1000 characters.',
    resolution: 'Enter a length between 1 and 1000',
    logLevel: 'warn',
  },

  // ========== SYSTEM ERRORS (DF-SYS-xxx) ==========
  'DF-SYS-001': {
    code: 'DF-SYS-001',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'Insufficient disk space',
    userMessage: 'Not enough disk space to save the file. Please free up some space and try again.',
    resolution: 'Free up disk space (at least 100MB recommended)',
    logLevel: 'error',
  },

  'DF-SYS-002': {
    code: 'DF-SYS-002',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'Permission denied',
    userMessage: 'Permission denied. You don\'t have access to save files in this location.',
    resolution: 'Choose a different save location or run as administrator',
    logLevel: 'error',
  },

  'DF-SYS-003': {
    code: 'DF-SYS-003',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    message: 'Out of memory',
    userMessage: 'Not enough memory to complete this operation. Try generating fewer records.',
    resolution: 'Reduce record count or close other applications',
    logLevel: 'fatal',
  },

  'DF-SYS-004': {
    code: 'DF-SYS-004',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.HIGH,
    message: 'File already exists',
    userMessage: 'A file with this name already exists. Do you want to overwrite it?',
    resolution: 'Choose a different filename or confirm overwrite',
    logLevel: 'warn',
  },

  'DF-SYS-005': {
    code: 'DF-SYS-005',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.CRITICAL,
    message: 'Application crash detected',
    userMessage: 'DummyForge encountered an unexpected error and needs to restart.',
    resolution: 'The application will restart. Your work has been saved.',
    logLevel: 'fatal',
  },

  'DF-SYS-006': {
    code: 'DF-SYS-006',
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.MEDIUM,
    message: 'Configuration file corrupted',
    userMessage: 'Your settings file is corrupted. Default settings will be restored.',
    resolution: 'Settings have been reset to defaults',
    logLevel: 'warn',
  },

  // ========== DATABASE ERRORS (DF-DB-xxx) ==========
  'DF-DB-001': {
    code: 'DF-DB-001',
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    message: 'Database connection failed',
    userMessage: 'Unable to connect to the local database. Please restart the application.',
    resolution: 'Restart application. If problem persists, reinstall DummyForge',
    logLevel: 'error',
  },

  'DF-DB-002': {
    code: 'DF-DB-002',
    category: ErrorCategory.DATABASE,
    severity: ErrorSeverity.HIGH,
    message: 'Database query failed',
    userMessage: 'Failed to save your configuration. Please try again.',
    resolution: 'Try saving again. If problem persists, restart the application',
    logLevel: 'error',
  },

  // ========== NETWORK ERRORS (DF-NET-xxx) - Future use ==========
  'DF-NET-001': {
    code: 'DF-NET-001',
    category: ErrorCategory.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    message: 'Update check failed',
    userMessage: 'Unable to check for updates. Please check your internet connection.',
    resolution: 'Check internet connection and try again later',
    logLevel: 'warn',
  },
};

// ============================================================================
// ERROR HELPER FUNCTIONS
// ============================================================================

export function getErrorByCode(code: string): ErrorCode | undefined {
  return ERROR_CODES[code];
}

export function createError(
  code: string,
  technicalDetails?: string,
  context?: Record<string, any>
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

// ============================================================================
// CUSTOM ERROR CLASS
// ============================================================================

export class DummyForgeError extends Error {
  public readonly code: string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly userMessage: string;
  public readonly resolution: string;
  public readonly logLevel: 'info' | 'warn' | 'error' | 'fatal';
  public readonly technicalDetails?: string;
  public readonly context?: Record<string, any>;
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
    context?: Record<string, any>
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

    // Maintains proper stack trace for where error was thrown (V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DummyForgeError);
    }
  }

  /**
   * Get formatted error for logging
   */
  toLogFormat(): string {
    return JSON.stringify({
      code: this.code,
      category: this.category,
      severity: this.severity,
      message: this.message,
      userMessage: this.userMessage,
      resolution: this.resolution,
      technicalDetails: this.technicalDetails,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stackTrace: this.stackTrace,
    }, null, 2);
  }

  /**
   * Get user-friendly error display
   */
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
      code: this.code,
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

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Example 1: Throw error with code
throw createError('DF-GEN-003', 'User tried to generate 15000 records', { 
  requestedCount: 15000 
});

// Example 2: Catch and handle error
try {
  generateData(config);
} catch (error) {
  if (error instanceof DummyForgeError) {
    // Log technical details
    console.error(error.toLogFormat());
    
    // Show user-friendly message
    const display = error.toUserDisplay();
    showErrorDialog(display.title, display.message, display.resolution, display.code);
  }
}

// Example 3: Get error by code
const errorDef = getErrorByCode('DF-EXP-001');
console.log(errorDef.userMessage);
*/
```

---

## ErrorLogger.ts - Logging System

```typescript
// src/lib/errors/ErrorLogger.ts

import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { DummyForgeError } from './ErrorCodes';

export class ErrorLogger {
  private static logDir: string;
  private static logFile: string;
  private static errorFile: string;

  /**
   * Initialize logger
   */
  static initialize(): void {
    // Set log directory in user data folder
    this.logDir = path.join(app.getPath('userData'), 'logs');
    
    // Ensure log directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    // Set log files
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(this.logDir, `dummyforge-${date}.log`);
    this.errorFile = path.join(this.logDir, `errors-${date}.log`);
  }

  /**
   * Log error
   */
  static logError(error: DummyForgeError | Error): void {
    const timestamp = new Date().toISOString();
    
    if (error instanceof DummyForgeError) {
      // Structured error logging
      const logEntry = {
        timestamp,
        level: error.logLevel,
        code: error.code,
        category: error.category,
        severity: error.severity,
        message: error.message,
        userMessage: error.userMessage,
        technicalDetails: error.technicalDetails,
        context: error.context,
        stackTrace: error.stackTrace,
      };

      this.writeToFile(this.errorFile, JSON.stringify(logEntry, null, 2) + '\n\n');
    } else {
      // Generic error logging
      const logEntry = {
        timestamp,
        level: 'error',
        message: error.message,
        stackTrace: error.stack,
      };

      this.writeToFile(this.errorFile, JSON.stringify(logEntry, null, 2) + '\n\n');
    }
  }

  /**
   * Log info message
   */
  static logInfo(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   */
  static logWarning(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  /**
   * Generic log method
   */
  private static log(
    level: 'info' | 'warn' | 'error',
    message: string,
    context?: Record<string, any>
  ): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
    };

    this.writeToFile(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  /**
   * Write to log file
   */
  private static writeToFile(filePath: string, content: string): void {
    try {
      fs.appendFileSync(filePath, content, 'utf8');
    } catch (err) {
      console.error('Failed to write to log file:', err);
    }
  }

  /**
   * Get recent logs
   */
  static getRecentLogs(count: number = 100): string {
    try {
      const logs = fs.readFileSync(this.logFile, 'utf8');
      const lines = logs.split('\n').filter(line => line.trim());
      return lines.slice(-count).join('\n');
    } catch (err) {
      return 'No logs available';
    }
  }

  /**
   * Clear old logs (keep last 7 days)
   */
  static clearOldLogs(): void {
    try {
      const files = fs.readdirSync(this.logDir);
      const now = Date.now();
      const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < sevenDaysAgo) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (err) {
      console.error('Failed to clear old logs:', err);
    }
  }
}
```

---

## ErrorHandler.tsx - React Component

```typescript
// src/components/ErrorHandler.tsx

import React from 'react';
import { DummyForgeError, ErrorSeverity } from '@/lib/errors/ErrorCodes';
import { ErrorLogger } from '@/lib/errors/ErrorLogger';

interface ErrorDialogProps {
  error: DummyForgeError;
  onClose: () => void;
  onRetry?: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onClose, onRetry }) => {
  const display = error.toUserDisplay();

  // Log error
  React.useEffect(() => {
    ErrorLogger.logError(error);
  }, [error]);

  const getSeverityColor = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'bg-blue-500';
      case ErrorSeverity.MEDIUM:
        return 'bg-yellow-500';
      case ErrorSeverity.HIGH:
        return 'bg-orange-500';
      case ErrorSeverity.CRITICAL:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.LOW:
        return 'ℹ️';
      case ErrorSeverity.MEDIUM:
        return '⚠️';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className={`w-10 h-10 rounded-full ${getSeverityColor()} flex items-center justify-center text-white text-2xl mr-3`}>
            {getSeverityIcon()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{display.title}</h2>
            <p className="text-xs text-gray-500">Error Code: {display.code}</p>
          </div>
        </div>

        {/* Message */}
        <div className="mb-4">
          <p className="text-gray-700 mb-3">{display.message}</p>
          
          {/* Resolution */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
            <p className="text-sm font-semibold text-blue-900 mb-1">How to fix:</p>
            <p className="text-sm text-blue-800">{display.resolution}</p>
          </div>
        </div>

        {/* Technical Details (collapsible) */}
        {error.technicalDetails && (
          <details className="mb-4">
            <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
              Technical Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {error.technicalDetails}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Retry
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
          >
            Close
            </button>
        </div>
      </div>
    </div>
  );
};

// Global error boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: DummyForgeError }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorLogger.logError(error);
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorDialog
          error={this.state.error}
          onClose={() => this.setState({ hasError: false })}
          onRetry={() => window.location.reload()}
        />
      );
    }

    return this.props.children;
  }
}
```

---

## Implementation in Main Code

```typescript
// Example: DataGenerator with error handling

import { createError } from '@/lib/errors/ErrorCodes';

export class DataGenerator {
  generateRecords(config: GenerationConfig): Record<string, any>[] {
    // Validate record count
    if (config.count > 10000) {
      throw createError('DF-GEN-003', `Requested ${config.count} records`, {
        requestedCount: config.count,
        maxAllowed: 10000,
      });
    }

    // Validate fields
    if (!config.fields || config.fields.length === 0) {
      throw createError('DF-GEN-004');
    }

    // Validate demographics
    const total = config.demographics.malePercentage + config.demographics.femalePercentage;
    if (total !== 100) {
      throw createError('DF-GEN-006', `Total percentage: ${total}%`, {
        malePercentage: config.demographics.malePercentage,
        femalePercentage: config.demographics.femalePercentage,
        total,
      });
    }

    try {
      // Generation logic...
      return this.performGeneration(config);
    } catch (error) {
      if (error instanceof DummyForgeError) {
        throw error;
      }
      throw createError('DF-GEN-005', error.message, { originalError: error });
    }
  }
}
```

---

This comprehensive error handling system provides:
✅ Unique error codes for all scenarios
✅ User-friendly and technical messages
✅ Structured logging with file persistence
✅ React error boundaries and dialogs
✅ Error recovery strategies
✅ Context and stack trace capture
✅ Production-ready error management

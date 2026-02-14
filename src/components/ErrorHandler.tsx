import React from 'react';
import { createError, DummyForgeError, ErrorSeverity } from '../lib/errors/ErrorCodes';
import { ErrorLogger } from '../lib/errors/ErrorLogger';

interface ErrorDialogProps {
  error: DummyForgeError;
  onClose: () => void;
  onRetry?: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, onClose, onRetry }) => {
  const display = error.toUserDisplay();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center">
          <div className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full text-2xl text-white ${getSeverityColor()}`}>
            {getSeverityIcon()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{display.title}</h2>
            <p className="text-xs text-gray-500">Error Code: {display.code}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-3 text-gray-700">{display.message}</p>
          <div className="rounded border-l-4 border-blue-400 bg-blue-50 p-3">
            <p className="mb-1 text-sm font-semibold text-blue-900">How to fix:</p>
            <p className="text-sm text-blue-800">{display.resolution}</p>
          </div>
        </div>

        {error.technicalDetails && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Technical Details
            </summary>
            <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs">{error.technicalDetails}</pre>
          </details>
        )}

        <div className="flex justify-end gap-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="rounded bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            >
              Retry
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded bg-gray-200 px-4 py-2 text-gray-700 transition hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: DummyForgeError }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    if (error instanceof DummyForgeError) {
      return { hasError: true, error };
    }
    if (error instanceof Error) {
      return { hasError: true, error: createError('DF-SYS-005', error.message) };
    }
    return { hasError: true, error: createError('DF-SYS-005', 'Unknown error') };
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

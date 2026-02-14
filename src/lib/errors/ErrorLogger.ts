import { DummyForgeError } from './ErrorCodes';

type LogLevel = 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

const sendLog = async (entry: LogEntry, isErrorLog: boolean) => {
  if (window.dummyForge?.logError && isErrorLog) {
    await window.dummyForge.logError(entry);
    return;
  }

  if (window.dummyForge?.log && !isErrorLog) {
    await window.dummyForge.log(entry);
    return;
  }

  if (isErrorLog) {
    console.error(entry.message, entry.context ?? {});
  } else if (entry.level === 'warn') {
    console.warn(entry.message, entry.context ?? {});
  } else {
    console.info(entry.message, entry.context ?? {});
  }
};

export class ErrorLogger {
  static async logError(error: DummyForgeError | Error): Promise<void> {
    const timestamp = new Date().toISOString();

    if (error instanceof DummyForgeError) {
      await sendLog(
        {
          timestamp,
          level: error.logLevel,
          message: error.message,
          context: {
            code: error.code,
            category: error.category,
            severity: error.severity,
            userMessage: error.userMessage,
            resolution: error.resolution,
            technicalDetails: error.technicalDetails,
            context: error.context,
            stackTrace: error.stackTrace
          }
        },
        true
      );
      return;
    }

    await sendLog(
      {
        timestamp,
        level: 'error',
        message: error.message,
        context: { stackTrace: error.stack }
      },
      true
    );
  }

  static async logInfo(message: string, context?: Record<string, unknown>): Promise<void> {
    await sendLog(
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        context
      },
      false
    );
  }

  static async logWarning(message: string, context?: Record<string, unknown>): Promise<void> {
    await sendLog(
      {
        timestamp: new Date().toISOString(),
        level: 'warn',
        message,
        context
      },
      false
    );
  }
}

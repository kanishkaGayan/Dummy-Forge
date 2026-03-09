export {};

declare global {
  interface Window {
    dummyForge?: {
      version: string;
      logError?: (entry: unknown) => Promise<void>;
      log?: (entry: unknown) => Promise<void>;
      checkForUpdates?: () => Promise<{ success: boolean }>;
      getAppVersion?: () => Promise<string>;
      onUpdateStatus?: (callback: (data: unknown) => void) => void;
      removeUpdateStatusListener?: () => void;
    };
  }
}

declare module '*.sql?raw' {
  const content: string;
  export default content;
}

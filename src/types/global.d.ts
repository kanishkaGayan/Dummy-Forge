export {};

declare global {
  interface Window {
    dummyForge?: {
      version: string;
      logError?: (entry: unknown) => Promise<void>;
      log?: (entry: unknown) => Promise<void>;
    };
  }
}

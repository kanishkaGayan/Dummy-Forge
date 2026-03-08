import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('dummyForge', {
  version: '0.0.9',
  logError: (entry: unknown) => ipcRenderer.invoke('dummyforge:log-error', entry),
  log: (entry: unknown) => ipcRenderer.invoke('dummyforge:log', entry),
  checkForUpdates: () => ipcRenderer.invoke('dummyforge:check-for-updates'),
  getAppVersion: () => ipcRenderer.invoke('dummyforge:get-app-version'),
  onUpdateStatus: (callback: (data: unknown) => void) => {
    ipcRenderer.on('dummyforge:update-status', (_event, data) => callback(data));
  },
  removeUpdateStatusListener: () => {
    ipcRenderer.removeAllListeners('dummyforge:update-status');
  }
});

export type DummyForgeApi = {
  version: string;
  logError: (entry: unknown) => Promise<void>;
  log: (entry: unknown) => Promise<void>;
  checkForUpdates: () => Promise<{ success: boolean }>;
  getAppVersion: () => Promise<string>;
  onUpdateStatus: (callback: (data: unknown) => void) => void;
  removeUpdateStatusListener: () => void;
};

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('dummyForge', {
  version: '1.0.0',
  logError: (entry: unknown) => ipcRenderer.invoke('dummyforge:log-error', entry),
  log: (entry: unknown) => ipcRenderer.invoke('dummyforge:log', entry)
});

export type DummyForgeApi = {
  version: string;
  logError: (entry: unknown) => Promise<void>;
  log: (entry: unknown) => Promise<void>;
};

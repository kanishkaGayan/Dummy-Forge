import { app, BrowserWindow, dialog, Menu, shell, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';

const isDev = !!process.env.VITE_DEV_SERVER_URL || !app.isPackaged;

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'Dummy Forge',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  Menu.setApplicationMenu(null);
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('web-contents-created', (_event, contents) => {
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;

  const shouldOpenExternal = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return false;
    }
    if (devServerUrl && url.startsWith(devServerUrl)) {
      return false;
    }
    return true;
  };

  contents.setWindowOpenHandler(({ url }) => {
    if (shouldOpenExternal(url)) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  contents.on('will-navigate', (event, url) => {
    if (shouldOpenExternal(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });
});

const ensureLogDir = () => {
  const logDir = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

const getLogFiles = () => {
  const logDir = ensureLogDir();
  const date = new Date().toISOString().split('T')[0];
  return {
    logFile: path.join(logDir, `dummyforge-${date}.log`),
    errorFile: path.join(logDir, `errors-${date}.log`)
  };
};

const writeLog = (filePath: string, payload: unknown) => {
  const entry = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  fs.appendFileSync(filePath, `${entry}\n`);
};

ipcMain.handle('dummyforge:log-error', (_event, payload) => {
  const { errorFile } = getLogFiles();
  writeLog(errorFile, payload);
});

ipcMain.handle('dummyforge:log', (_event, payload) => {
  const { logFile } = getLogFiles();
  writeLog(logFile, payload);
});

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('Dummy Forge Error', error.message);
});

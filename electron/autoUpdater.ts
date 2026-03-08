import { app, BrowserWindow, dialog } from 'electron';
import { autoUpdater, type UpdateInfo } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import path from 'path';

const ensureUpdaterLogDir = () => {
  const logDir = path.join(app.getPath('userData'), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  return logDir;
};

const formatReleaseNotes = (info: UpdateInfo) => {
  if (!info.releaseNotes) return 'No release notes available.';
  if (typeof info.releaseNotes === 'string') return info.releaseNotes;
  return info.releaseNotes
    .map((note) => `${note.version ?? ''}\n${note.note ?? ''}`.trim())
    .filter(Boolean)
    .join('\n\n');
};

class AutoUpdateManager {
  private mainWindow: BrowserWindow | null = null;
  private updateCheckInterval: NodeJS.Timeout | null = null;
  private isCheckingForUpdates = false;

  constructor() {
    if (app.isReady()) {
      this.configureAutoUpdater();
    } else {
      app.whenReady().then(() => this.configureAutoUpdater());
    }
  }

  private configureAutoUpdater() {
    const logDir = ensureUpdaterLogDir();
    log.transports.file.level = 'info';
    log.transports.file.resolvePath = () => path.join(logDir, 'updater.log');
    autoUpdater.logger = log;

    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;

    this.setupEventListeners();
  }

  private setupEventListeners() {
    autoUpdater.on('checking-for-update', () => {
      log.info('Checking for updates (privacy-respecting, no data sent)');
      this.sendStatusToWindow('checking-for-update');
    });

    autoUpdater.on('update-available', (info) => {
      log.info('Update available', { version: info.version, releaseDate: info.releaseDate });
      this.sendStatusToWindow('update-available', {
        version: info.version,
        releaseNotes: formatReleaseNotes(info),
        releaseDate: info.releaseDate
      });
      this.showUpdateAvailableDialog(info);
      this.isCheckingForUpdates = false;
    });

    autoUpdater.on('update-not-available', (info) => {
      log.info('Update not available. Current version is latest.');
      this.sendStatusToWindow('update-not-available', { version: info.version });

      if (this.isCheckingForUpdates && this.mainWindow) {
        dialog.showMessageBox(this.mainWindow, {
          type: 'info',
          title: 'No Updates Available',
          message: 'You are running the latest version!',
          detail: `Current version: ${app.getVersion()}`
        });
      }

      this.isCheckingForUpdates = false;
    });

    autoUpdater.on('download-progress', (progressObj) => {
      const percent = Math.floor(progressObj.percent ?? 0);
      log.info(`Download progress: ${percent}%`);

      this.sendStatusToWindow('download-progress', {
        percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
        bytesPerSecond: progressObj.bytesPerSecond
      });

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setTitle(`Dummy Forge - Downloading ${percent}%`);
      }
    });

    autoUpdater.on('update-downloaded', (info) => {
      log.info('Update downloaded successfully');
      this.sendStatusToWindow('update-downloaded', { version: info.version });

      if (this.mainWindow && !this.mainWindow.isDestroyed()) {
        this.mainWindow.setTitle('Dummy Forge');
      }

      this.showUpdateDownloadedDialog(info);
    });

    autoUpdater.on('error', (err) => {
      log.error('Error in auto-updater', err);
      this.sendStatusToWindow('error', { message: err.message || 'Unknown error' });

      if (this.isCheckingForUpdates && this.mainWindow) {
        dialog.showMessageBox(this.mainWindow, {
          type: 'error',
          title: 'Update Error',
          message: 'Failed to check for updates',
          detail: 'Please check your internet connection and try again later.'
        });
      }

      this.isCheckingForUpdates = false;
    });
  }

  private showUpdateAvailableDialog(info: UpdateInfo) {
    if (!this.mainWindow) return;

    dialog
      .showMessageBox(this.mainWindow, {
        type: 'info',
        buttons: ['Download Now', 'Later'],
        defaultId: 0,
        title: 'Update Available',
        message: `New Version ${info.version} Available!`,
        detail: `Current version: ${app.getVersion()}\nNew version: ${info.version}\n\n${formatReleaseNotes(info)}`
      })
      .then((returnValue) => {
        if (returnValue.response === 0) {
          log.info('User initiated update download');
          autoUpdater.downloadUpdate();
          this.setDownloadTitle();
        } else {
          log.info('User postponed update');
        }
      });
  }

  private showUpdateDownloadedDialog(info: UpdateInfo) {
    if (!this.mainWindow) return;

    dialog
      .showMessageBox(this.mainWindow, {
        type: 'info',
        buttons: ['Restart Now', 'Restart Later'],
        defaultId: 0,
        title: 'Update Ready to Install',
        message: 'Update Downloaded Successfully!',
        detail: `Version ${info.version} has been downloaded.\n\nRestart now to install?`
      })
      .then((returnValue) => {
        if (returnValue.response === 0) {
          log.info('User initiated app restart for update installation');
          setImmediate(() => autoUpdater.quitAndInstall(false, true));
        } else {
          log.info('User postponed app restart. Update will install on next launch.');
        }
      });
  }

  private setDownloadTitle() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.setTitle('Dummy Forge - Downloading Update...');
    }
  }

  private sendStatusToWindow(status: string, data: Record<string, unknown> = {}) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('dummyforge:update-status', {
        status,
        data,
        timestamp: new Date().toISOString()
      });
    }
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  checkForUpdates() {
    if (this.isCheckingForUpdates) {
      log.info('Update check already in progress, skipping');
      return;
    }

    log.info('Manual update check triggered by user');
    this.isCheckingForUpdates = true;

    autoUpdater.checkForUpdates().catch((error) => {
      log.error('Failed to check for updates', error);
      this.isCheckingForUpdates = false;
    });
  }

  checkForUpdatesOnStartup() {
    setTimeout(() => {
      log.info('Automatic update check on startup (privacy-respecting)');
      autoUpdater.checkForUpdates().catch((err) => {
        log.error('Startup update check failed', err);
      });
    }, 10000);
  }

  startPeriodicUpdateChecks(intervalHours = 6) {
    const intervalMs = intervalHours * 60 * 60 * 1000;

    this.updateCheckInterval = setInterval(() => {
      log.info('Periodic update check (privacy-respecting)');
      autoUpdater.checkForUpdates().catch((err) => {
        log.error('Periodic update check failed', err);
      });
    }, intervalMs);

    log.info(`Periodic update checks started (every ${intervalHours} hours)`);
  }

  stopPeriodicUpdateChecks() {
    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
      log.info('Periodic update checks stopped');
    }
  }
}

const autoUpdateManager = new AutoUpdateManager();
export default autoUpdateManager;

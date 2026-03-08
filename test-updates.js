const { app } = require('electron');
const { autoUpdater } = require('electron-updater');

autoUpdater.on('checking-for-update', () => {
  console.log('✓ Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
  console.log('✓ Update available!', info);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('✓ No updates available', info);
});

autoUpdater.on('error', (err) => {
  console.error('✗ Update error:', err);
});

app.whenReady().then(() => {
  autoUpdater.forceDevUpdateConfig = true;
  console.log('Starting update check...');
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('✗ Update check failed:', err);
  });

  setTimeout(() => {
    console.log('Test complete');
    app.quit();
  }, 10000);
});

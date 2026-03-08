import { app, BrowserWindow, dialog, Menu, shell, type MenuItemConstructorOptions } from 'electron';

type MenuHandlers = {
  onCheckForUpdates: () => void;
};

export const createAppMenu = (win: BrowserWindow, handlers: MenuHandlers) => {
  const isMac = process.platform === 'darwin';

  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    const macSubmenu: MenuItemConstructorOptions[] = [
      { role: 'about' },
      { type: 'separator' },
      {
        label: 'Check for Updates...',
        click: handlers.onCheckForUpdates
      },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ];

    template.push({ label: app.name, submenu: macSubmenu });
  }

  const fileSubmenu: MenuItemConstructorOptions[] = isMac ? [{ role: 'close' }] : [{ role: 'quit' }];

  const editSubmenu: MenuItemConstructorOptions[] = [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' }
  ];

  if (isMac) {
    editSubmenu.push({ role: 'pasteAndMatchStyle' }, { role: 'delete' }, { role: 'selectAll' });
  } else {
    editSubmenu.push({ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' });
  }

  const viewSubmenu: MenuItemConstructorOptions[] = [
    { role: 'reload' },
    { role: 'forceReload' },
    { type: 'separator' },
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' }
  ];

  if (process.env.NODE_ENV === 'development') {
    viewSubmenu.push({ type: 'separator' }, { role: 'toggleDevTools' });
  }

  const windowSubmenu: MenuItemConstructorOptions[] = [{ role: 'minimize' }, { role: 'zoom' }];

  if (isMac) {
    windowSubmenu.push({ type: 'separator' }, { role: 'front' });
  } else {
    windowSubmenu.push({ role: 'close' });
  }

  const helpSubmenu: MenuItemConstructorOptions[] = [
    {
      label: 'Check for Updates...',
      click: handlers.onCheckForUpdates
    },
    { type: 'separator' },
    {
      label: 'View on GitHub',
      click: () => shell.openExternal('https://github.com/kanishkaGayan/Dummy-Forge')
    },
    {
      label: 'Report Issue',
      click: () => shell.openExternal('https://github.com/kanishkaGayan/Dummy-Forge/issues')
    },
    { type: 'separator' },
    {
      label: 'About Dummy Forge',
      click: () => {
        dialog.showMessageBox(win, {
          type: 'info',
          title: 'About Dummy Forge',
          message: `Dummy Forge v${app.getVersion()}`,
          detail:
            'Educational Data Generation Tool\n\nPrivacy-First Design:\n• No data collection\n• No tracking\n• No analytics\n• 100% local processing\n\nLicense: All rights reserved.\n\nWebsite: https://dummyforge.vercel.app\nGitHub: https://github.com/kanishkaGayan/Dummy-Forge',
          buttons: ['OK']
        });
      }
    }
  ];

  template.push(
    { label: 'File', submenu: fileSubmenu },
    { label: 'Edit', submenu: editSubmenu },
    { label: 'View', submenu: viewSubmenu },
    { label: 'Window', submenu: windowSubmenu },
    { role: 'help', submenu: helpSubmenu }
  );

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

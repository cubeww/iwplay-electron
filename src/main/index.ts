import { app, shell, BrowserWindow } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import log from 'electron-log/main';
import { initMainAPI } from './api';

export const windows: { [name: string]: BrowserWindow } = {};

export function createWindow(type: string, name: string, width: number, height: number): BrowserWindow {
  const exists = windows[name];
  if (exists) {
    exists.show();
    return exists;
  }

  const window = new BrowserWindow({
    minWidth: width,
    minHeight: height,
    width: width,
    height: height,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      webviewTag: true,
      nodeIntegration: true
    }
  });

  window.on('ready-to-show', () => {
    window.show();
  });

  window.on('maximize', () => {
    window.webContents.send('maximize', true);
  });

  window.on('unmaximize', () => {
    window.webContents.send('maximize', false);
  });

  window.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  const queryString = `?type=${type}&name=${name}`;
  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] + queryString);
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html' + queryString));
  }

  window.webContents.openDevTools();

  windows[name] = window;
  return window;
}

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-attach-webview', (_wawevent, webPreferences, _params) => {
      // Inject a preload file into all webviews
      // to facilitate sending IPC messages from within the webviews to their parent.
      webPreferences.preload = join(__dirname, '../preload/index.js');
    });
  });

  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

  log.initialize({ preload: true });

  // Create the main window.
  const mainWindow = createWindow('main', 'main', 1000, 600);
  // mainWindow.webContents.openDevTools();

  // Register IPC handlers
  initMainAPI();
});

app.on('window-all-closed', () => {
  app.quit();
});

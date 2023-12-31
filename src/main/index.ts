import { app, shell, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import log from 'electron-log/main';
import { initMainAPI } from './api';
import { ChildProcess } from 'child_process';

export const windows: { [name: string]: BrowserWindow } = {};
export const processes: { [id: string]: ChildProcess } = {};

export function createWindow(params: { [key: string]: string }, options?: BrowserWindowConstructorOptions): BrowserWindow {
  const exists = windows[params.name];
  if (exists) {
    exists.show();
    return exists;
  }

  const window = new BrowserWindow({
    show: false,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      webSecurity: false,
      webviewTag: true,
      nodeIntegration: true
    },
    minWidth: options?.width,
    minHeight: options?.height,
    ...options
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

  const queryString = '?' + new URLSearchParams(params).toString();

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'] + queryString);

    window.webContents.openDevTools();
  } else {
    // window.loadFile(join(__dirname, '../renderer/index.html' + queryString));
    window.loadURL(join('file://', __dirname, '../renderer/index.html' + queryString));

    window.webContents.openDevTools();
  }

  windows[params.name] = window;
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

  // Create the main window
  const mainWindow = createWindow({ type: 'main', name: 'main' }, { width: 1000, height: 600 });

  // Register IPC handlers
  initMainAPI();

  // Download
  mainWindow.webContents.session.on('will-download', (_downloadEvent, item) => {
    console.log('Download: ' + item.getFilename());
    item.setSavePath('D:\\' + item.getFilename());
    item.on('updated', (_updateEvent, updateState) => {
      console.log(updateState);
    });
    item.on('done', (_itemEvent, itemState) => {
      console.log(itemState);
    });
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

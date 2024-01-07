/**
 * index.ts
 * Main process entry.
 */

import { app, shell, BrowserWindow, BrowserWindowConstructorOptions, Tray, screen } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { initMainAPI } from './api';
import { ChildProcess } from 'child_process';
import log from 'electron-log/main';
import icon from '../../resources/icon.png?asset&asarUnpack';

export const windows: { [name: string]: BrowserWindow } = {};
export const processes: { [id: string]: ChildProcess } = {};

export const downloadContext = {
  savePath: ''
};

export let tray: Tray;
export const trayMenuSize = { x: 250, y: 400 };

export function createWindow<T extends { type: string; name: string }>(params: T, options?: BrowserWindowConstructorOptions): BrowserWindow {
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
    if (!options || options.show !== false) window.show();
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
    window.loadURL(join('file://', __dirname, '../renderer/index.html' + queryString));
  }

  windows[params.name] = window;
  return window;
}

app.whenReady().then(() => {
  /** Check if single instance, if not, simply quit new instance */
  const isSingleInstance = app.requestSingleInstanceLock();
  if (!isSingleInstance) {
    app.quit();
  }

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.iwplay');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  app.on('web-contents-created', (_event, contents) => {
    contents.on('will-attach-webview', (_wawevent, webPreferences) => {
      // Inject a preload file into all webviews
      // to facilitate sending IPC messages from within the webviews to their parent.
      webPreferences.preload = join(__dirname, '../preload/index.js');
    });
    contents.on('did-attach-webview', (_e, wb) => {
      // wb.openDevTools();

      // When the webview opens a new tab, load it directly instead of opening the new tab
      wb.setWindowOpenHandler((details) => {
        // Mediafire may have ads pop-ups, so prevent it from loading ads.
        if (wb.getURL().includes('www.mediafire.com/file/')) {
          return {
            action: 'deny'
          };
        }

        wb.loadURL(details.url);

        return {
          action: 'deny'
        };
      });
    });
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

  log.initialize({ preload: true });

  // Create the main window
  const mainWindow = createWindow({ type: 'main', name: 'main' }, { width: 1000, height: 600 });

  app.on('second-instance', (_event, _argv, _cwd) => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  // Register IPC handlers
  initMainAPI();

  // Handle download events
  mainWindow.webContents.session.on('will-download', (_downloadEvent, item, webContents) => {
    if (webContents.getType() === 'webview') {
      item.cancel();
      mainWindow.webContents.send('webview-download', {
        url: item.getURL(),
        filename: item.getFilename(),
        filesize: item.getTotalBytes()
      });
    } else {
      item.setSavePath(downloadContext.savePath);
      item.on('updated', (_updateEvent, updateState) => {
        if (updateState === 'progressing') {
          mainWindow.webContents.send('download-updated', item.getURL(), item.getReceivedBytes());
        }
      });
      item.on('done', (_itemEvent, itemState) => {
        if (itemState === 'completed') {
          mainWindow.webContents.send('download-successfully', item.getURL());
        } else {
          mainWindow.webContents.send('download-failed', item.getURL());
        }
      });
    }
  });

  // Tray
  tray = new Tray(icon);
  tray.setToolTip('IWPlay');
  tray.on('click', () => {
    mainWindow.show();
  });

  const trayMenu = createWindow(
    { type: 'traymenu', name: 'traymenu' },
    {
      width: 250,
      height: 400,
      minWidth: 250,
      minHeight: 0,
      show: false,
      skipTaskbar: true,
      resizable: false,
      movable: false,
      transparent: true,
      alwaysOnTop: true
    }
  );
  trayMenu.on('blur', () => {
    trayMenu.hide();
  });

  tray.on('right-click', () => {
    const mousePos = screen.getCursorScreenPoint();
    trayMenu.setSize(trayMenuSize.x, trayMenuSize.y);
    trayMenu.setPosition(mousePos.x, mousePos.y - trayMenuSize.y);
    trayMenu.show();
  });
});

import { BrowserWindowConstructorOptions, OpenDialogSyncOptions, app, dialog, ipcMain, shell } from 'electron';
import { addLibrary, applyDebugHelper, createManifest, getGameExecutables, getGameReadmes, getInstalledFangameIDs, getManifest, getProfile, getRunningFangameIDs, installGame, openGameDirectory, removeLibrary, runGame, saveManifest, stopGame, uninstallGame } from './services/library';
import { addDownloadItem, createWindow, trayMenuSize, windows } from '.';
import { join } from 'path';
import { readTextFile, writeTextFile } from './utils/fs';
import { sendEvent } from './event';
import { getSettings, setSettings } from './services/settings';
import { statSync } from 'fs';
import { execSync } from 'child_process';

const mainAPIMap = {
  // Library
  // -------

  'install-game': installGame,
  'uninstall-game': uninstallGame,
  'add-library': addLibrary,
  'remove-library': removeLibrary,
  'get-installed-fangame-ids': getInstalledFangameIDs,
  'get-running-fangame-ids': getRunningFangameIDs,
  'create-manifest': createManifest,
  'get-manifest': getManifest,
  'save-manifest': saveManifest,
  'get-game-executables': getGameExecutables,
  'get-game-readmes': getGameReadmes,
  'apply-debug-helper': applyDebugHelper,
  'get-profile': getProfile,
  'run-game': runGame,
  'stop-game': stopGame,
  'open-game-directory': openGameDirectory,

  // Settings
  // --------

  'set-settings': setSettings,
  'get-settings': getSettings,

  // Window
  // ------

  'create-window': (params: { [paramName: string]: string }, options?: BrowserWindowConstructorOptions) => {
    createWindow(params as any, options);
  },

  'maximize': (name: string) => {
    const window = windows[name];
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  },

  'minimize': (name: string) => {
    const window = windows[name];
    window.minimize();
  },

  'close': (name: string) => {
    const window = windows[name];
    delete windows[name];
    window.close();
  },

  'hide': (name: string) => {
    const window = windows[name];
    window.hide();
  },

  'quit': () => {
    Object.values(windows).forEach((window) => window.close());
  },

  // File
  // ----

  'read-text-file': readTextFile,
  'write-text-file': writeTextFile,
  'file-size': (file: string) => {
    return statSync(file).size;
  },

  // Misc
  // ----

  'app-version': () => app.getVersion(),
  'join': (...args: string[]) => join(...args),
  'app-data-path': () => app.getPath('appData'),
  'add-download-item': addDownloadItem,
  'open-external': (url: string) => shell.openExternal(url),
  'send-event': sendEvent,
  'resize-tray-menu': (w: number, h: number) => {
    trayMenuSize.x = w;
    trayMenuSize.y = h;
  },
  'open-file-dialog': (name: string, options: OpenDialogSyncOptions) => {
    const window = windows[name];
    return dialog.showOpenDialogSync(window, options);
  },
  'notepad': (path: string) => {
    return execSync(`notepad "${path.replaceAll('/', '\\')}"`);
  },
};

export type MainAPI = typeof mainAPIMap;

export function registerMainAPIs() {
  for (const i of Object.keys(mainAPIMap)) {
    ipcMain.handle(i, (_event, ...args) => {
      return mainAPIMap[i](...args);
    });
  }
}

import { BrowserWindowConstructorOptions, OpenDialogSyncOptions, app, dialog, ipcMain, shell } from 'electron';
import { addLibrary, applyDebugHelper, createManifest, getAllProfiles, getDelFruitProfile, getGameExecutables, getGameReadmes, getInstalledFangameIDs, getManifest, getProfile, getRunningFangameIDs, installGame, modifyDelFruitProfile, openGameDirectory, removeLibrary, runGame, saveManifest, saveProfile, stopGame, uninstallGame } from './utils/library';
import { addDownloadItem, createWindow, hideInsteadCloseMainWindow, trayMenuSize, windows } from '.';
import { join } from 'path';
import { dirSize, readTextFile, writeTextFile } from './utils/fs';
import { sendEvent } from './event';
import { getSettings, setSettings } from './utils/settings';
import { statSync } from 'fs';
import { execSync } from 'child_process';
import { is } from '@electron-toolkit/utils';

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
  'save-profile': saveProfile,
  'get-all-profiles': getAllProfiles,
  'run-game': runGame,
  'stop-game': stopGame,
  'open-game-directory': openGameDirectory,
  'get-delfruit-profile': getDelFruitProfile,
  'modify-delfruit-profile': modifyDelFruitProfile,

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
    window.close();
  },

  'show': (name: string) => {
    const window = windows[name];
    window.show();
  },

  'hide': (name: string) => {
    const window = windows[name];
    window.hide();
  },

  'quit': () => {
    hideInsteadCloseMainWindow.value = false;
    Object.values(windows).forEach((window) => window.close());
  },

  // File
  // ----

  'read-text-file': readTextFile,
  'write-text-file': writeTextFile,
  'file-size': (file: string) => {
    const stat = statSync(file);
    return stat.isDirectory() ? dirSize(file) : stat.size;
  },

  // Misc
  // ----

  'app-version': () => app.getVersion(),
  'join': (...args: string[]) => join(...args),
  'user-data-path': () => app.getPath('userData'),
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
  'is-dev': () => (is.dev && process.env['ELECTRON_RENDERER_URL'] ? true : false),
};

export type MainAPI = typeof mainAPIMap;

export function registerMainAPIs() {
  for (const i of Object.keys(mainAPIMap)) {
    ipcMain.handle(i, async (_event, ...args) => {
      return await mainAPIMap[i](...args);
    });
  }
}

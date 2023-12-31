/**
 * api.ts
 * Define all APIs available to the renderer process.
 *
 * Call an API from the rendering process:
 *   invoke('an-api-name', arg1, arg2...)
 */

import { execFile, execSync } from 'child_process';
import { app, dialog, ipcMain, shell } from 'electron';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { createWindow, downloadContext, processes, tray, trayMenuSize, windows } from '.';

import sevenz from '../../resources/7z.exe?asset&asarUnpack';
import dbghelper from '../../resources/dbghelper.exe?asset&asarUnpack';
import resizer from '../../resources/resizer.exe?asset&asarUnpack';

function getFiles(dir: string, dir2: string, files: string[] = []) {
  const fileList = readdirSync(dir);
  for (const file of fileList) {
    const name = join(dir, file);
    const name2 = dir2 === '' ? file : join(dir2, file);
    if (statSync(name).isDirectory()) {
      getFiles(name, name2, files);
    } else {
      files.push(name2);
    }
  }
  return files;
}

function dirSize(dir: string) {
  const files = readdirSync(dir, { withFileTypes: true });

  const paths = files.map((file) => {
    const path = join(dir, file.name);

    if (file.isDirectory()) return dirSize(path);

    if (file.isFile()) {
      const { size } = statSync(path);

      return size;
    }

    return 0;
  });

  return paths.flat(Infinity).reduce((i: any, size: any) => i + size, 0);
}

export function initMainAPI() {
  // File System
  // -----------

  ipcMain.handle('read-file', (_event, file) => {
    return readFileSync(file, { encoding: 'utf8' });
  });

  ipcMain.handle('write-file', (_event, file, text) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  });

  ipcMain.handle('path-exists', (_event, file) => {
    return existsSync(file);
  });

  ipcMain.handle('create-dir', (_event, dir) => {
    mkdirSync(dir, { recursive: true });
  });

  ipcMain.handle('remove-dir', (_event, dir) => {
    rmSync(dir, { recursive: true, force: true });
  });

  ipcMain.handle('remove-file', (_event, file) => {
    unlinkSync(file);
  });

  ipcMain.handle('read-dir', (_event, dir, recursive) => {
    return recursive ? getFiles(dir, '') : readdirSync(dir);
  });

  ipcMain.handle('is-dir', (_event, dir) => {
    return statSync(dir).isDirectory();
  });

  ipcMain.handle('dir-size', (_event, dir) => {
    return dirSize(dir);
  });

  ipcMain.handle('file-size', (_event, file) => {
    return statSync(file).size;
  });

  ipcMain.handle('open-file-dialog', (_event, name, options) => {
    const window = windows[name];
    return dialog.showOpenDialogSync(window, options);
  });

  ipcMain.handle('get-path', (_event, name) => {
    return app.getPath(name);
  });

  ipcMain.handle('path-resolve', (_event, path) => {
    return resolve(path);
  });

  ipcMain.handle('copy', (_event, src, dist) => {
    return execSync(`copy "${src}" "${dist}"`);
  });

  // Window
  // ------

  ipcMain.handle('maximize', (_event, name) => {
    const window = windows[name];
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
  });

  ipcMain.handle('minimize', (_event, name) => {
    const window = windows[name];
    window.minimize();
  });

  ipcMain.handle('close', (_event, name) => {
    const window = windows[name];
    delete windows[name];
    window.close();
  });

  ipcMain.handle('hide', (_event, name) => {
    const window = windows[name];
    window.hide();
  });

  ipcMain.handle('quit', () => {
    Object.values(windows).forEach((window) => window.close());
  });

  ipcMain.handle('create-window', (_event, params, options) => {
    createWindow(params, options);
  });

  // Tray
  // ----

  ipcMain.handle('display-balloon', (_event, options) => {
    tray.displayBalloon(options);
  });

  ipcMain.handle('resize-tray-menu', (_event, w, h) => {
    // Will be resized when displayed
    trayMenuSize.x = w;
    trayMenuSize.y = h;
  });

  ipcMain.handle('main-show', (_event, action) => {
    const window = windows['main'];
    window.show();
    window.webContents.send('show', action);
  });

  // External Tools
  // --------------

  ipcMain.handle('unzip', (_event, src, dist) => {
    return execSync(`"${sevenz}" x "${src}" -o"${dist}"`);
  });

  ipcMain.handle('dbghelper', (_event, dist) => {
    return execSync(`"${dbghelper}" "${dist}"`, { cwd: dist });
  });

  ipcMain.handle('explorer', (_event, path) => {
    return execSync(`explorer "${path.replaceAll('/', '\\')}"`);
  });

  ipcMain.handle('notepad', (_event, path) => {
    return execSync(`notepad "${path.replaceAll('/', '\\')}"`);
  });

  ipcMain.handle('open-external', (_event, url) => {
    return shell.openExternal(url);
  });

  // Process
  // -------

  ipcMain.handle('run', (_event, id, file, resize) => {
    if (id in processes) {
      execSync(`taskkill /pid ${processes[id].pid} /F /T`);
      delete processes[id];
    }

    const p = execFile(file, { cwd: dirname(file) });

    if (resize) {
      execFile(resizer, [`${p.pid}`, '800', '608']);
    }

    p.on('close', () => {
      delete processes[id];
      windows['main'].webContents.send('process-close', id);
    });
    processes[id] = p;
    windows['main'].webContents.send('process-run', id);
  });

  ipcMain.handle('kill', (_event, id) => {
    if (id in processes) {
      execSync(`taskkill /pid ${processes[id].pid} /F /T`);
    }
  });

  ipcMain.handle('get-running', () => {
    return Object.keys(processes);
  });

  // Config
  // ------

  ipcMain.handle('sync-config-to-main', (event, data) => {
    for (const window of Object.values(windows)) {
      if (window.webContents !== event.sender) {
        window.webContents.send('sync-config-to-renderer', data);
      }
    }
  });

  // Download
  // --------

  ipcMain.handle('download-file', (_event, url, path) => {
    downloadContext.savePath = path;
    windows['main'].webContents.downloadURL(url);
  });

  // Misc
  // ----

  ipcMain.handle('app-version', () => {
    return app.getVersion();
  });
}

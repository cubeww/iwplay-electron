import { execSync } from 'child_process';
import { app, dialog, ipcMain } from 'electron';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { createWindow, windows } from '.';

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
  /////////////////
  // File System //
  /////////////////

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

  ////////////
  // Window //
  ////////////

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

  ipcMain.handle('quit', (_event) => {
    Object.values(windows).forEach((window) => window.close());
  });

  ipcMain.handle('create-window', (_event, type, name, width, height) => {
    createWindow(type, name, width, height);
  });

  /////////////
  // Process //
  /////////////

  ipcMain.handle('exec', (_event, command, options) => {
    return execSync(command, options);
  });
}

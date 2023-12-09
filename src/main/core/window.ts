import { BrowserWindow, ipcMain } from 'electron'

let mainWindow: BrowserWindow = undefined!

export default (_mainWindow: BrowserWindow) => {
  mainWindow = _mainWindow

  ipcMain.handle('window-close', (_event, {}) => mainWindow.close())
  ipcMain.handle('window-maximize', (_event, {}) => (mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize()))
  ipcMain.handle('window-minimize', (_event, {}) => mainWindow.minimize())
}

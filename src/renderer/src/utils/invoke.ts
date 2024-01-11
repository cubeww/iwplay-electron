import log from 'electron-log/renderer';
import { MainAPI } from 'src/main/api';

export function invoke<T extends keyof MainAPI>(name: T, ...args: Parameters<MainAPI[T]>): Promise<ReturnType<MainAPI[T]>> {
  log.info('%cInvoke: ' + name, 'color: #c678dd');
  return window.electron.ipcRenderer.invoke(name, ...args);
}

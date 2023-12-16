import log from 'electron-log/renderer';

export function invoke(channel: string, ...args: any[]) {
  log.info('%cInvoke: ' + channel, 'color: #c678dd');
  return window.electron.ipcRenderer.invoke(channel, ...args);
}

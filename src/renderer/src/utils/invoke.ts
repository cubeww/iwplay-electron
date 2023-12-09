export function invoke(channel: string, args?: any) {
  console.log('ipc invoke: ', channel)
  return window.electron.ipcRenderer.invoke(channel, args)
}

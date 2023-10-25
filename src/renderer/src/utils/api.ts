// 为方便IPC通讯，使用Proxy简化invoke调用
// 例如：
// window.electron.ipcRenderer.invoke('methodName', arg1, arg2, ...)
//     <=>
// api.methodName(arg1, arg2, ...)

import { mainAPI } from 'src/main/mainAPI'

export const api = new Proxy(
  {},
  {
    get(_target, prop, _receiver) {
      return async function (...args: any) {
        return await window.electron.ipcRenderer.invoke(prop as string, ...args)
      }
    }
  }
) as typeof mainAPI

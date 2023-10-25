// 为方便IPC通讯，使用Proxy简化invoke调用
// 例如：
// window.electron.ipcRenderer.invoke('methodName', arg1, arg2, ...)
//     <=>
// api.methodName(arg1, arg2, ...)

import { nanoid } from 'nanoid'
import { mainAPI } from 'src/main/mainAPI'

export const api = new Proxy(
  {},
  {
    get(_target, prop, _receiver) {
      return async function (...args: any) {
        // Experimental: callback converter
        // for (let i = 0; i < args.length; i++) {
        //   if (typeof args[i] === 'function') {
        //     const channel = nanoid()
        //     const handlerCreator = (cb: Function) => {
        //       return function (_event, ...args1: any[]) {
        //         cb(...args1)
        //       }
        //     }
        //     window.electron.ipcRenderer.on(channel, handlerCreator(args[i]))
        //     args[i] = { __type: 'ipcCallback', channel }
        //   }
        // }
        return await window.electron.ipcRenderer.invoke(prop as string, ...args)
      }
    }
  }
) as typeof mainAPI

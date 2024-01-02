/**
 * index.ts
 * Expose the core electron api to the renderer process (such as invoke)
 */

import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

contextBridge.exposeInMainWorld('electron', electronAPI);

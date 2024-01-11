import { invoke } from '@renderer/utils/invoke';

export const APPDATA_PATH = await invoke('app-data-path');
export const APPCACHE_PATH = await invoke('join', APPDATA_PATH, 'appcache');
export const DELFRUIT_CACHE = await invoke('join', APPCACHE_PATH, 'delfruit-fangamelist.json');

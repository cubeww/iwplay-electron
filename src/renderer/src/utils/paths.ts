import { invoke } from '@renderer/utils/invoke';

export const USERDATA_PATH = await invoke('user-data-path');
export const APPCACHE_PATH = await invoke('join', USERDATA_PATH, 'appcache');
export const DELFRUIT_CACHE = await invoke('join', APPCACHE_PATH, 'delfruit-fangamelist.json');
export const TAGGED_CACHE = await invoke('join', APPCACHE_PATH, 'delfruit-taggedlist.json');

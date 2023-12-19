import { join } from 'path-browserify';
import { ref, toRaw } from 'vue';
import { invoke } from './invoke';

type Language = 'english' | '简体中文';

interface AppConfig {
  libraryPaths: string[];
  language: Language;
}

export const appConfig = ref<AppConfig>({
  libraryPaths: [],
  language: '简体中文'
});

const configFile = join(await invoke('get-path', 'userData'), 'iwplay-config.json');

export async function initConfig() {
  try {
    const json = await invoke('read-file', configFile);
    appConfig.value = JSON.parse(json);
  } catch {
    await invoke('write-file', configFile, JSON.stringify(appConfig.value, undefined, 4));
  }

  window.electron.ipcRenderer.on('renderer-sync-config', (_event, data) => {
    appConfig.value = data;
  });
}

export function setConfig<K extends keyof AppConfig>(key: K, value: AppConfig[K]) {
  appConfig.value[key] = value;

  invoke('write-file', configFile, JSON.stringify(appConfig.value, undefined, 4));
  invoke('main-sync-config', toRaw(appConfig.value));
}

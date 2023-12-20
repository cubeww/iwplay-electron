import { mainI18n } from '@renderer/main';
import { invoke } from '@renderer/utils/invoke';
import { join } from 'path-browserify';
import { defineStore } from 'pinia';
import { watch } from 'vue';
import { ref, toRaw } from 'vue';

type Language = 'en' | 'zh';

interface AppConfig {
  libraryPaths: string[];
  language: Language;
}

const configFile = join(await invoke('get-path', 'userData'), 'iwplay-config.json');

export const useConfigStore = defineStore('ConfigStore', () => {
  const init = async () => {
    try {
      const json = await invoke('read-file', configFile);
      cfg.value = JSON.parse(json);
    } catch {
      await invoke('write-file', configFile, JSON.stringify(cfg.value, undefined, 4));
    }
  };

  const cfg = ref<AppConfig>({
    libraryPaths: [],
    language: 'en'
  });

  window.electron.ipcRenderer.on('renderer-sync-config', (_event, data) => {
    cfg.value = data;
  });

  const set = <K extends keyof AppConfig>(key: K, value: AppConfig[K]) => {
    cfg.value[key] = value;

    invoke('write-file', configFile, JSON.stringify(cfg.value, undefined, 4));
    invoke('main-sync-config', toRaw(cfg.value));
  };

  watch(
    () => cfg.value.language,
    (newLanguage) => (mainI18n.global.locale.value = newLanguage)
  );

  return { init, cfg, set };
});

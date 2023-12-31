import { mainI18n } from '@renderer/main';
import { invoke } from '@renderer/utils/invoke';
import { paths } from '@renderer/utils/paths';
import { defineStore } from 'pinia';
import { watch } from 'vue';
import { ref, toRaw } from 'vue';

type Language = 'en' | 'zh';

interface AppConfig {
  libraryPaths: string[];
  language: Language;
}

export const useConfigStore = defineStore('ConfigStore', () => {
  const configFile = paths.config();
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

  window.electron.ipcRenderer.on('sync-config-to-renderer', (_event, data) => {
    cfg.value = data;
  });

  const set = (patch: (cfg: AppConfig) => void) => {
    patch(cfg.value);
    invoke('write-file', configFile, JSON.stringify(cfg.value, undefined, 4));
    invoke('sync-config-to-main', toRaw(cfg.value));
  };

  watch(
    () => cfg.value.language,
    (newLanguage) => (mainI18n.global.locale.value = newLanguage)
  );

  return { init, cfg, set };
});

import { invoke } from '@renderer/utils/invoke';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { AppSettings } from 'src/main/utils/settings';
import { watch } from 'vue';
import { toRaw } from 'vue';
import { listenEvent } from '@renderer/utils/listenEvent';
import { mainI18n } from '@renderer/main';

export const useSettingsStore = defineStore('settings', () => {
  let isUpdating = false;

  const settings = ref({} as AppSettings);

  watch(
    settings,
    (newSettings) => {
      if (!isUpdating) {
        invoke('set-settings', toRaw(newSettings));
      } else {
        isUpdating = false;
      }
    },
    { deep: true },
  );

  watch(
    () => settings.value.language,
    (newLanguage) => {
      mainI18n.global.locale.value = newLanguage;
    },
  );

  const initialize = async () => {
    settings.value = await invoke('get-settings');
    listenEvent('update-settings', (newSettings) => {
      isUpdating = true;
      settings.value = newSettings;
    });
  };

  return { initialize, settings };
});

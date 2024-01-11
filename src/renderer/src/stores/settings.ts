import { invoke } from '@renderer/utils/invoke';
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { type AppSettings } from 'src/main/services/settings';
import { watch } from 'vue';
import { toRaw } from 'vue';
import { listenEvent } from '@renderer/utils/listenEvent';

export const useSettingsStore = defineStore('settings', () => {
  let isUpdating = false;

  const settings = ref({} as AppSettings);

  watch(settings, (newSettings) => {
    if (!isUpdating) {
      invoke('set-settings', toRaw(newSettings));
    } else {
      isUpdating = false;
    }
  });

  const initialize = async () => {
    settings.value = await invoke('get-settings');
    listenEvent('update-settings', (newSettings) => {
      isUpdating = true;
      settings.value = newSettings;
    });
  };

  return { initialize, settings };
});

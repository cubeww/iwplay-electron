import { invoke } from '@renderer/utils/invoke';
import { ref } from 'vue';
import { DelFruitFangameItem, delFruit } from '@renderer/utils/delFruit';
import { defineStore } from 'pinia';
import { DELFRUIT_CACHE } from '@renderer/utils/paths';
import { useSettingsStore } from './settings';
import { listenEvent } from '@renderer/utils/listenEvent';
import { isDev } from '@renderer/main';
import { FangameProfile } from 'src/main/utils/library';

export interface FangameItem {
  id: string;
  name: string;
  isRunning: boolean;
  isInstalled: boolean;
  libraryPath: string;
}

type FetchStatus = 'pending' | 'fetching' | 'ok' | 'error';

export const useLibraryStore = defineStore('library', () => {
  const settingsStore = useSettingsStore();

  const fetchFangameItemsStatus = ref<FetchStatus>('pending');
  const fetchFangameItemsError = ref<string>('');
  const fangameItems = ref<FangameItem[]>([]);

  const loadDelFruitFangameItemsCache = async () => {
    return JSON.parse(await invoke('read-text-file', DELFRUIT_CACHE));
  };

  const saveDelFruitFangameItemsCache = async (items: DelFruitFangameItem[]) => {
    await invoke('write-text-file', DELFRUIT_CACHE, JSON.stringify(items));
  };

  const fetchFangameItems = async (fromDelFruitFirst: boolean) => {
    fetchFangameItemsStatus.value = 'fetching';

    try {
      let delFruitItems: DelFruitFangameItem[];

      try {
        // First method
        if (fromDelFruitFirst) {
          delFruitItems = await delFruit.fetchFangameItems();
          await saveDelFruitFangameItemsCache(delFruitItems);
        } else {
          delFruitItems = await loadDelFruitFangameItemsCache();
        }
      } catch {
        // Second method
        if (fromDelFruitFirst) {
          delFruitItems = await loadDelFruitFangameItemsCache();
        } else {
          delFruitItems = await delFruit.fetchFangameItems();
          await saveDelFruitFangameItemsCache(delFruitItems);
        }
      }
      // Note: If both methods fail, an error is thrown and captured by the outer try

      // Convert DelFruit fangame items to IWPlay fangame items
      const items = delFruitItems as FangameItem[];
      items.forEach((i) => {
        i.isInstalled = false;
        i.isRunning = false;
      });

      // Get installed fangames
      for (const path of settingsStore.settings.libraryPaths) {
        const installedIDs = await invoke('get-installed-fangame-ids', { libraryPath: path });
        for (const id of installedIDs) {
          const index = items.findIndex((item) => item.id === id);
          if (index !== -1) {
            items[index].isInstalled = true;
            items[index].libraryPath = path;

            // Fix manifest if needed
            try {
              await invoke('get-manifest', { libraryPath: path, gameID: id });
            } catch {
              await invoke('create-manifest', { libraryPath: path, gameID: id, gameName: items[index].name });
            }
          }
        }
      }

      // Get running fangames
      const runningIDs: string[] = await invoke('get-running-fangame-ids');
      for (const id of runningIDs) {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
          items[index].isRunning = true;
        }
      }

      fetchFangameItemsStatus.value = 'ok';
      fetchFangameItemsError.value = '';
      fangameItems.value = items;
    } catch (err) {
      fetchFangameItemsStatus.value = 'error';
      fetchFangameItemsError.value = 'Fetch Data Error';
    }
  };

  const fetchFangameProfiles = async () => {
    fangameProfiles.value = await invoke('get-all-profiles');
  };

  const fangameProfiles = ref<{ [gameID: string]: FangameProfile }>({});

  const initialize = () => {
    listenEvent('game-installed', ({ gameID, libraryPath }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) {
          i.isInstalled = true;
          i.libraryPath = libraryPath;
        }
      });
    });

    listenEvent('game-uninstalled', ({ gameID }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) {
          i.isInstalled = false;
        }
      });
    });

    listenEvent('game-run', ({ gameID }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) i.isRunning = true;
      });
    });

    listenEvent('game-close', ({ gameID }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) i.isRunning = false;
      });
    });

    listenEvent('game-profile-updated', ({ gameID, profile }) => {
      fangameProfiles.value[gameID] = profile;
    });

    // Fetch once at start
    fetchFangameItems(!isDev); // Load cache first in development mode to reduce startup time
    fetchFangameProfiles();
  };

  return { initialize, fangameProfiles, fangameItems, fetchFangameItems, fetchFangameItemsStatus, fetchFangameItemsError };
});

import { invoke } from '@renderer/utils/invoke';
import { ref } from 'vue';
import { delFruit } from '@renderer/utils/delFruit';
import { defineStore } from 'pinia';
import { DELFRUIT_CACHE } from '@renderer/utils/paths';
import { useSettingsStore } from './settings';
import { listenEvent } from '@renderer/utils/listenEvent';

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

  const fetchFangameItems = async (refetchFromDelFruit: boolean) => {
    fetchFangameItemsStatus.value = 'fetching';

    try {
      let items: any[] = [];
      let loadCacheSuccessfully = false;
      if (!refetchFromDelFruit) {
        try {
          const cacheData = JSON.parse(await invoke('read-text-file', DELFRUIT_CACHE));
          const difDays = (new Date().getTime() - new Date(cacheData.fetchdate).getTime()) / (1000 * 60 * 60 * 24);
          if (difDays < 1) {
            items = cacheData.list;
            loadCacheSuccessfully = true;
          }
        } catch {
          // Cache not exists or load failed
          loadCacheSuccessfully = false;
        }
      }
      if (!loadCacheSuccessfully) {
        // Fetch fangame list from DelFruit
        items = await delFruit.fetchFangameItems();

        // Write to cache
        await invoke('write-text-file', DELFRUIT_CACHE, JSON.stringify({ fetchdate: new Date(), list: items }));
      }

      items.forEach((i) => {
        i.isInstalled = false;
        i.isRunning = false;
      });

      // Get installed fangames
      for (const path of settingsStore.settings.libraryPaths) {
        const installedIDs = await invoke('get-installed-fangame-ids', { libraryPath: path });
        installedIDs.forEach((id) => {
          const index = items.findIndex((item) => item.id === id);
          if (index !== -1) {
            items[index].isInstalled = true;
            items[index].libraryPath = path;
          }
        });
      }

      // Get running fangames
      const runningIDs: string[] = await invoke('get-running-fangame-ids');
      runningIDs.forEach((id) => {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
          items[index].isRunning = true;
        }
      });

      fetchFangameItemsStatus.value = 'ok';
      fetchFangameItemsError.value = '';
      fangameItems.value = items;
    } catch (err) {
      fetchFangameItemsStatus.value = 'error';
      fetchFangameItemsError.value = (err as Error).message;
    }
  };

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

    // Fetch once at start
    fetchFangameItems(false);
  };

  return { initialize, fangameItems, fetchFangameItems, fetchFangameItemsStatus, fetchFangameItemsError };
});

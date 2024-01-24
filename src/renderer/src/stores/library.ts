import { invoke } from '@renderer/utils/invoke';
import { ref } from 'vue';
import { DelFruitFangameItem, delFruit } from '@renderer/utils/delFruit';
import { defineStore } from 'pinia';
import { DELFRUIT_CACHE } from '@renderer/utils/paths';
import { useSettingsStore } from './settings';
import { listenEvent } from '@renderer/utils/listenEvent';
import { isDev } from '@renderer/main';
import { FangameProfile } from 'src/main/utils/library';
import { computed } from 'vue';

export interface FangameItem {
  id: string;
  name: string;
  running: boolean;
  installed: boolean;
  cleared: boolean;
  favorite: boolean;
  bookmark: boolean;
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
        i.installed = false;
        i.running = false;
        i.favorite = false;
        i.cleared = false;
        i.bookmark = false;
      });

      // Sync delfruit profile
      await syncProfileFromDelFruit();

      // Get installed fangames
      for (const path of settingsStore.settings.libraryPaths) {
        const installedIDs = await invoke('get-installed-fangame-ids', { libraryPath: path });
        for (const id of installedIDs) {
          const index = items.findIndex((item) => item.id === id);
          if (index !== -1) {
            items[index].installed = true;
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
          items[index].running = true;
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

  const fangameProfiles = ref<{ [gameID: string]: FangameProfile | undefined }>({});

  const delFruitUserName = ref<string>();
  const delFruitCookie = ref<string>();
  const delFruitLogged = computed(() => delFruitUserName.value !== undefined);
  const delFruitSynced = ref<boolean>(false);

  const syncProfileFromDelFruit = async () => {
    delFruitSynced.value = false;

    if (!delFruitLogged.value) {
      return;
    }

    try {
      const html = await invoke('get-delfruit-profile', { cookie: delFruitCookie.value! });
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      doc.querySelectorAll('#favorites a').forEach((a) => {
        const id = a.getAttribute('href')!.split('=')[1];
        const idx = fangameItems.value.findIndex((i) => i.id === id);
        if (idx !== -1) {
          fangameItems.value[idx].favorite = true;
        }
      });

      doc.querySelectorAll('#clear a').forEach((a) => {
        const id = a.getAttribute('href')!.split('=')[1];
        const idx = fangameItems.value.findIndex((i) => i.id === id);
        if (idx !== -1) {
          fangameItems.value[idx].cleared = true;
        }
      });

      doc.querySelectorAll('#bookmark a').forEach((a) => {
        const id = a.getAttribute('href')!.split('=')[1];
        const idx = fangameItems.value.findIndex((i) => i.id === id);
        if (idx !== -1) {
          fangameItems.value[idx].bookmark = true;
        }
      });

      delFruitSynced.value = true;
    } catch {
      // Do nothing
    }
  };

  const initialize = () => {
    listenEvent('game-installed', ({ gameID, libraryPath }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) {
          i.installed = true;
          i.libraryPath = libraryPath;
        }
      });
    });

    listenEvent('game-uninstalled', ({ gameID }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) {
          i.installed = false;
        }
      });
    });

    listenEvent('game-run', ({ gameID }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) i.running = true;
      });
    });

    listenEvent('game-close', ({ gameID }) => {
      fangameItems.value.forEach((i) => {
        if (i.id === gameID) i.running = false;
      });
    });

    listenEvent('game-profile-updated', ({ gameID, profile }) => {
      fangameProfiles.value[gameID] = profile;
    });

    // Fetch once at start
    fetchFangameItems(!isDev); // Load cache first in development mode to reduce startup time
    fetchFangameProfiles();
  };

  return { initialize, fangameProfiles, fangameItems, fetchFangameItems, fetchFangameItemsStatus, fetchFangameItemsError, delFruitLogged, delFruitSynced, delFruitUserName, delFruitCookie, syncProfileFromDelFruit };
});

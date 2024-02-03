import { invoke } from '@renderer/utils/invoke';
import { ref } from 'vue';
import { DelFruitFangameItem, delFruit } from '@renderer/utils/delFruit';
import { defineStore } from 'pinia';
import { DELFRUIT_CACHE, TAGGED_CACHE } from '@renderer/utils/paths';
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
  const fangameItemsMap = ref<{ [id: string]: FangameItem }>({});

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
      const map = {};
      items.forEach((i) => {
        i.installed = false;
        i.running = false;
        i.favorite = false;
        i.cleared = false;
        i.bookmark = false;

        map[i.id] = i; // Store all items in map for quick access
      });

      // Get installed fangames
      for (const path of settingsStore.settings.libraryPaths) {
        const installedIDs = await invoke('get-installed-fangame-ids', { libraryPath: path });
        for (const id of installedIDs) {
          const item = map[id];
          if (item) {
            item.installed = true;
            item.libraryPath = path;

            // Fix manifest if needed
            try {
              await invoke('get-manifest', { libraryPath: path, gameID: id });
            } catch {
              await invoke('create-manifest', { libraryPath: path, gameID: id, gameName: item.name });
            }
          }
        }
      }

      // Get running fangames
      const runningIDs: string[] = await invoke('get-running-fangame-ids');
      for (const id of runningIDs) {
        const item = map[id];
        if (item) {
          item.running = true;
        }
      }

      fangameItems.value = items;
      fangameItemsMap.value = map;

      fetchFangameItemsStatus.value = 'ok';
      fetchFangameItemsError.value = '';
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

    if (!delFruitLogged.value) return;
    if (fetchFangameItemsStatus.value !== 'ok') return;

    try {
      const html = await invoke('get-delfruit-profile', { cookie: delFruitCookie.value! });
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      doc.querySelectorAll('#favorites a').forEach((a) => {
        const id = a.getAttribute('href')!.split('=')[1];
        const item = fangameItemsMap.value[id];
        if (item) {
          item.favorite = true;
        }
      });

      doc.querySelectorAll('#clear a').forEach((a) => {
        const id = a.getAttribute('href')!.split('=')[1];
        const item = fangameItemsMap.value[id];
        if (item) {
          item.cleared = true;
        }
      });

      doc.querySelectorAll('#bookmark a').forEach((a) => {
        const id = a.getAttribute('href')!.split('=')[1];
        const item = fangameItemsMap.value[id];
        if (item) {
          item.bookmark = true;
        }
      });

      delFruitSynced.value = true;
    } catch {
      // Do nothing
    }
  };

  const taggedFangameIDSets = ref<{ [tagName: string]: Set<string> }>({});
  const fetchTaggedFangameIDSetsStatus = ref<'pending' | 'fetching' | 'ok' | 'error'>('pending');
  const fetchTaggedFangameIDSetsError = ref('');

  const loadTaggedFangameIDSetsCache = async () => {
    const sets: { [tagName: string]: Set<string> } = JSON.parse(await invoke('read-text-file', TAGGED_CACHE));
    for (const [tagName, ids] of Object.entries(sets)) {
      sets[tagName] = new Set(ids); // Array -> Set
    }
    return sets;
  };

  const saveTaggedFangameIDSetsCache = async (sets: { [tagName: string]: Set<string> }) => {
    await invoke(
      'write-text-file',
      TAGGED_CACHE,
      JSON.stringify(sets, (_, value) => (value instanceof Set ? [...value] : value)), // Set -> Array
    );
  };

  const fetchTaggedFangameIDSets = async (fromDelFruitFirst: boolean) => {
    fetchTaggedFangameIDSetsStatus.value = 'fetching';
    try {
      let sets: { [tagName: string]: Set<string> };

      try {
        // First method
        if (fromDelFruitFirst) {
          sets = {};
          for (const tag of Object.keys(taggedFangameIDSets.value)) {
            sets[tag] = await delFruit.fetchTaggedFangameIDs(tag);
          }
          await saveTaggedFangameIDSetsCache(sets);
        } else {
          sets = await loadTaggedFangameIDSetsCache();
        }
      } catch {
        // Second method
        if (fromDelFruitFirst) {
          sets = await loadTaggedFangameIDSetsCache();
        } else {
          sets = {};
          for (const tag of Object.keys(taggedFangameIDSets.value)) {
            sets[tag] = await delFruit.fetchTaggedFangameIDs(tag);
          }
          await saveTaggedFangameIDSetsCache(sets);
        }
      }

      taggedFangameIDSets.value = sets;
      fetchTaggedFangameIDSetsStatus.value = 'ok';
    } catch (err) {
      fetchTaggedFangameIDSetsStatus.value = 'error';
      fetchTaggedFangameIDSetsError.value = (err as Error).message;
    }
  };

  const addTagSet = async (tagName: string) => {
    fetchTaggedFangameIDSetsStatus.value = 'fetching';
    try {
      taggedFangameIDSets.value[tagName] = await delFruit.fetchTaggedFangameIDs(tagName);
      await saveTaggedFangameIDSetsCache(taggedFangameIDSets.value);
      fetchTaggedFangameIDSetsStatus.value = 'ok';
    } catch (err) {
      fetchTaggedFangameIDSetsStatus.value = 'error';
      fetchFangameItemsError.value = (err as Error).message;
    }
  };

  const removeTagSet = async (tagName: string) => {
    fetchTaggedFangameIDSetsStatus.value = 'fetching';
    try {
      delete taggedFangameIDSets.value[tagName];
      await saveTaggedFangameIDSetsCache(taggedFangameIDSets.value);
      fetchTaggedFangameIDSetsStatus.value = 'ok';
    } catch (err) {
      fetchTaggedFangameIDSetsStatus.value = 'error';
      fetchFangameItemsError.value = (err as Error).message;
    }
  };

  const initialize = () => {
    listenEvent('game-installed', ({ gameID, libraryPath }) => {
      const item = fangameItemsMap.value[gameID];
      if (item) {
        item.installed = true;
        item.libraryPath = libraryPath;
      }
    });

    listenEvent('game-uninstalled', ({ gameID }) => {
      const item = fangameItemsMap.value[gameID];
      if (item) {
        item.installed = false;
        item.libraryPath = '';
      }
    });

    listenEvent('game-run', ({ gameID }) => {
      const item = fangameItemsMap.value[gameID];
      if (item) {
        item.running = true;
      }
    });

    listenEvent('game-close', ({ gameID }) => {
      const item = fangameItemsMap.value[gameID];
      if (item) {
        item.running = false;
      }
    });

    listenEvent('game-profile-updated', ({ gameID, profile }) => {
      fangameProfiles.value[gameID] = profile;
    });

    // Fetch once at start
    fetchFangameItems(!isDev) // Load cache first in development mode to reduce startup time
      .then(() => {
        fetchTaggedFangameIDSets(false);
      })
      .then(() => {
        syncProfileFromDelFruit();
      });
    fetchFangameProfiles();
  };

  return {
    initialize,
    fangameProfiles,
    fangameItems,
    fangameItemsMap,
    fetchFangameItems,
    fetchFangameItemsStatus,
    fetchFangameItemsError,
    delFruitLogged,
    delFruitSynced,
    delFruitUserName,
    delFruitCookie,
    syncProfileFromDelFruit,
    taggedFangameIDSets,
    fetchTaggedFangameIDSets,
    fetchTaggedFangameIDSetsStatus,
    fetchTaggedFangameIDSetsError,
    addTagSet,
    removeTagSet,
  };
});

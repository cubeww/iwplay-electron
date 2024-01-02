import { ContextMenuOptions } from '@renderer/components/ContextMenu.vue';
import { invoke } from '@renderer/utils/invoke';
import { DelFruitFangameItem, delFruit } from '@renderer/utils/delFruit';
import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import { useFetchShallow } from '@renderer/hooks/useFetch';
import { useConfigStore } from './configStore';
import { library } from '@renderer/utils/library';
import PopupViewError from '@renderer/components/PopupViewError.vue';
import PopupViewConfirm from '@renderer/components/PopupViewConfirm.vue';
import { useProcess } from '@renderer/hooks/useProcess';
import { paths } from '@renderer/utils/paths';
import { FangameProfile } from '@renderer/components/LibraryDetailGame.vue';
import { useWebviewDownload } from '@renderer/hooks/useWebviewDownload';
import PopupViewDownload from '@renderer/components/PopupViewDownload.vue';
import { useDownload } from '@renderer/hooks/useDownload';

export type TabName = 'browser' | 'library' | 'user';

export interface BackableState {
  tab: TabName;
  targetBrowserURL?: string;
  fangameItemId?: string;
}

export interface FangameItem {
  id: string;
  name: string;
  isRunning: boolean;
  isInstalled: boolean;
  libraryPath: string;
}

export const useAppStore = defineStore('AppStore', () => {
  const configStore = useConfigStore();

  // Backable State
  // --------------

  const past = ref<BackableState[]>([]);
  const present = ref<BackableState>({
    tab: 'browser',
    targetBrowserURL: 'https://delicious-fruit.com/'
  });
  const future = ref<BackableState[]>([]);

  const shouldLoadURL = ref(false);

  const backable = <T extends (...args: any) => void>(action: T) => {
    return ((...args: any) => {
      future.value = [];
      past.value.push(present.value);
      action(...args);
    }) as unknown as T;
  };

  const toggleTab = backable((tab: TabName) => {
    present.value = { ...present.value, tab };
  });

  const toggleBrowserAndLoadURL = backable((url: string) => {
    present.value = { ...present.value, tab: 'browser', targetBrowserURL: url };
    shouldLoadURL.value = true;
  });

  const recordBrowserURL = backable((url: string) => {
    present.value = { ...present.value, tab: 'browser', targetBrowserURL: url };
  });

  const setShouldLoadURL = (value: boolean) => {
    shouldLoadURL.value = value;
  };

  const back = () => {
    if (past.value.length > 0) {
      future.value.push(present.value);
      present.value = past.value.pop()!;
      if (present.value.tab === 'browser') {
        shouldLoadURL.value = true;
      }
    }
  };

  const forward = () => {
    if (future.value.length > 0) {
      past.value.push(present.value);
      present.value = future.value.pop()!;
      if (present.value.tab === 'browser') {
        shouldLoadURL.value = true;
      }
    }
  };

  // Context Menu
  // ------------

  const contextMenu = ref<ContextMenuOptions>();

  const showContextMenu = (options: ContextMenuOptions) => {
    contextMenu.value = options;
  };

  const hideContextMenu = () => {
    contextMenu.value = undefined;
  };

  // Library
  // -------

  const [fetchFangameItems, fangameItems, fetchFangameItemsStatus, fetchFangameItemsError] = useFetchShallow([], async (forceDownload = false) => {
    const cacheFile = paths.delFruitFangameList();

    let items: any[] = [];

    let loadCacheOK = false;

    if (!forceDownload) {
      // Try to load cache first
      try {
        const cacheData: { fetchdate: string; list: DelFruitFangameItem[] } = JSON.parse(await invoke('read-file', cacheFile));

        const differenceDays = (new Date().getTime() - new Date(cacheData.fetchdate).getTime()) / (1000 * 60 * 60 * 24);

        if (differenceDays < 1) {
          items = cacheData.list;
          loadCacheOK = true;
        }
      } catch (e) {
        loadCacheOK = false;
      }
    }

    if (!loadCacheOK) {
      // Fetch fangame list from DelFruit
      try {
        items = await delFruit.fetchFangameItems();
      } catch {
        throw new Error('Network Error');
      }

      // Write to cache
      await invoke(
        'write-file',
        cacheFile,
        JSON.stringify({
          fetchdate: new Date(),
          list: items
        })
      );
    }

    for (const i of items) {
      i.isInstalled = false;
      i.isRunning = false;
    }

    // Get installed fangames
    for (const path of configStore.cfg.libraryPaths) {
      const installedIDs = await library.getFangameIDsByManifest(path);
      installedIDs.forEach((id) => {
        const index = items.findIndex((item) => item.id === id);
        if (index !== -1) {
          items[index].isInstalled = true;
          items[index].libraryPath = path;
        }
      });
    }

    // Get running fangames
    const runningIDs: string[] = await invoke('get-running');
    runningIDs.forEach((id) => {
      const index = items.findIndex((item) => item.id === id);
      if (index !== -1) {
        items[index].isRunning = true;
      }
    });

    return items as FangameItem[];
  });

  const selectFangameItem = backable((id?: string) => {
    present.value = { ...present.value, tab: 'library', fangameItemId: id };
  });

  interface FangamePlayingStatus {
    playTime: number;
    timer: NodeJS.Timeout;
  }

  const playingFangames: { [id: string]: FangamePlayingStatus } = {};

  // Make sure fangame items are updated on every game process run/close
  useProcess(
    (id) => {
      fetchFangameItems();

      const status = { playTime: 0 } as FangamePlayingStatus;
      status.timer = setInterval(() => {
        status.playTime += 1;
      }, 1000);

      playingFangames[id] = status;
    },
    async (id) => {
      clearInterval(playingFangames[id].timer);

      // Update fangame profile
      const playTime = playingFangames[id].playTime;
      const profileFile = paths.fangameProfile('guest', id);
      const profile: FangameProfile = { lastPlayed: new Date(), playTime: playTime };
      if (await invoke('path-exists', profileFile)) {
        const oldProfile: FangameProfile = JSON.parse(await invoke('read-file', profileFile));
        profile.playTime += oldProfile.playTime;
      }
      await invoke('write-file', profileFile, JSON.stringify(profile));
      delete playingFangames[id];

      fetchFangameItems();
    }
  );

  // Download
  // --------

  const lastVisitedFangameId = ref('');

  const updateLastVisitedFangameId = (id: string) => {
    lastVisitedFangameId.value = id;
  };

  useWebviewDownload((params) => {
    showPopup(PopupViewDownload, { url: params.url, filename: params.filename, filesize: params.filesize, possibleId: lastVisitedFangameId });
  });

  interface DownloadItem {
    url: string;
    received: number;
    size: number;
    status: DownloadStatus;
    libraryPath: string;
    gameId: string;
    filePath: string;
  }

  type DownloadStatus = 'downloading' | 'succeed' | 'failed';

  const downloadItems = ref<DownloadItem[]>([]);

  const addDownloadItem = async (url: string, filename: string, size: number, libraryPath: string, gameId: string) => {
    const index = downloadItems.value.findIndex((i) => i.gameId === gameId && i.status === 'downloading');
    if (index !== -1) {
      throw new Error('The game with the specified ID is already being downloaded! Please cancel it first.');
    }

    const dir = paths.downloading(libraryPath, gameId);
    if (!(await invoke('path-exists', dir))) {
      await invoke('create-dir', dir);
    }

    const downloadPath = (dir + '/' + filename).replaceAll('/', '\\');
    downloadItems.value.push({ gameId, libraryPath, size, url, filePath: downloadPath, received: 0, status: 'downloading' });

    invoke('download-file', url, downloadPath);
  };

  useDownload(
    (url, received) => {
      const index = downloadItems.value.findIndex((i) => i.url === url);
      if (index === -1) {
        console.log('WARNING: A download item has been updated, but it has not entered the download items.');
        return;
      }
      downloadItems.value[index].received = received;
    },
    async (url) => {
      const index = downloadItems.value.findIndex((i) => i.url === url);
      if (index === -1) {
        console.log('WARNING: A download item has been updated, but it has not entered the download items.');
        return;
      }
      downloadItems.value[index].status = 'succeed';

      // Perform installation
      await library.install(downloadItems.value[index].libraryPath, downloadItems.value[index].gameId, downloadItems.value[index].filePath);
      fetchFangameItems();
    },
    (url) => {
      const index = downloadItems.value.findIndex((i) => i.url === url);
      if (index === -1) {
        console.log('WARNING: A download item has been updated, but it has not entered the download items.');
        return;
      }
      downloadItems.value[index].status = 'failed';
    }
  );

  // Popup
  // -----

  const popups = ref<{ component: any; context: any }[]>([]);

  const showPopup = (component: any, context?: any) => {
    popups.value.push({ component: shallowRef(component), context });
  };

  const closePopup = (context: any) => {
    const index = popups.value.findIndex((p) => p.context === context);
    if (index !== -1) {
      popups.value.splice(index, 1);
    }
  };

  const showError = (message: string, ok?: () => void) => {
    showPopup(PopupViewError, { message, ok });
  };

  const showConfirm = (message: string, yes?: () => void, no?: () => void) => {
    showPopup(PopupViewConfirm, { message, yes, no });
  };

  return {
    past,
    future,
    present,
    shouldLoadURL,
    toggleTab,
    toggleBrowserAndLoadURL,
    recordBrowserURL,
    setShouldLoadURL,
    back,
    forward,
    showContextMenu,
    hideContextMenu,
    contextMenu,
    popups,
    showPopup,
    closePopup,
    showError,
    showConfirm,
    fangameItems,
    fetchFangameItems,
    fetchFangameItemsStatus,
    fetchFangameItemsError,
    selectFangameItem,
    updateLastVisitedFangameId,
    downloadItems,
    addDownloadItem
  };
});

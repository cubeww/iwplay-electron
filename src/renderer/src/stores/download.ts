import { defineStore } from 'pinia';
import { ref } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { GameDownloadItem } from 'src/main';
import { listenEvent } from '@renderer/utils/listenEvent';
import { usePopupStore } from './popup';
import PopupViewDownload from '@renderer/components/PopupViewDownload.vue';
import { useNavigateStore } from './navigate';

export const useDownloadStore = defineStore('download', () => {
  const popupStore = usePopupStore();
  const navigateStore = useNavigateStore();
  const downloadItems = ref<GameDownloadItem[]>([]);

  const initialize = () => {
    listenEvent('download-updated', ({ items }) => {
      downloadItems.value = items;
    });

    listenEvent('download-successfully', ({ items, successItem }) => {
      downloadItems.value = items;
      const { filePath, gameID, libraryPath } = successItem;

      // Perform install game
      invoke('install-game', { file: filePath, gameID, libraryPath });
    });

    listenEvent('download-failed', ({ items }) => {
      downloadItems.value = items;
    });

    listenEvent('webview-download', ({ filename, filesize, url }) => {
      popupStore.showPopup(PopupViewDownload, { url, filename, filesize, possibleID: navigateStore.lastVisitedFangameID });
    });
  };

  return { initialize, downloadItems };
});

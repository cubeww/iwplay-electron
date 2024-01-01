import { onMounted, onUnmounted } from 'vue';

export function useDownload(downloadUpdated: (url: string, received: number) => void, downloadSuccessfully: (url: string) => void, downloadFailed: (url: string) => void) {
  let offDownloadUpdated: () => void;
  let offDownloadSuccessfully: () => void;
  let offDownloadFailed: () => void;

  onMounted(() => {
    offDownloadUpdated = window.electron.ipcRenderer.on('download-updated', (_evt, url, received) => {
      downloadUpdated(url, received);
    });
    offDownloadSuccessfully = window.electron.ipcRenderer.on('download-successfully', (_evt, url) => {
      downloadSuccessfully(url);
    });
    offDownloadFailed = window.electron.ipcRenderer.on('download-failed', (_evt, url) => {
      downloadFailed(url);
    });
  });

  onUnmounted(() => {
    offDownloadUpdated();
    offDownloadSuccessfully();
    offDownloadFailed();
  });
}

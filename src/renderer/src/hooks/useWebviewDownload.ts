import { onMounted, onUnmounted } from 'vue';

interface WebviewDownloadParams {
  url: string;
  filename: string;
  filesize: number;
}

export function useWebviewDownload(onWebviewDownload: (params: WebviewDownloadParams) => void) {
  let offWebviewDownload: () => void;

  onMounted(() => {
    offWebviewDownload = window.electron.ipcRenderer.on('webview-download', (_evt, params) => {
      onWebviewDownload(params);
    });
  });

  onUnmounted(() => {
    offWebviewDownload();
  });
}

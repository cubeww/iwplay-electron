import { onMounted, onUnmounted } from 'vue';

export function useProcess(onRun, onClose) {
  let offRun: () => void;
  let offClose: () => void;

  onMounted(async () => {
    offRun = window.electron.ipcRenderer.on('process-run', (_evt, id) => {
      onRun(id);
    });

    offClose = window.electron.ipcRenderer.on('process-close', (_evt, id) => {
      onClose(id);
    });
  });

  onUnmounted(() => {
    offRun();
    offClose();
  });
}

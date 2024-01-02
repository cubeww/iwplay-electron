import { onMounted, onUnmounted } from 'vue';

export function useShow(onShow: (action: string) => void) {
  let offShow: () => void;

  onMounted(async () => {
    offShow = window.electron.ipcRenderer.on('show', (_evt, action) => {
      onShow(action);
    });
  });

  onUnmounted(() => {
    offShow();
  });
}

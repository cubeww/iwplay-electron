import { onMounted, onUnmounted } from 'vue';
import { ref } from 'vue';

export function useMaximize() {
  const isMaximize = ref(false);

  let off: () => void;

  onMounted(async () => {
    off = window.electron.ipcRenderer.on('maximize', (_evt, value) => {
      isMaximize.value = value;
    });
  });

  onUnmounted(() => off());
  return isMaximize;
}

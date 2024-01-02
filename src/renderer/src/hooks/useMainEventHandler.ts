import { onMounted, onUnmounted } from 'vue';

export function useMainEventHandler(eventName: string, handler: (...args: any) => void) {
  let offEvent: () => void;

  onMounted(async () => {
    offEvent = window.electron.ipcRenderer.on(eventName, (_evt, ...args) => {
      handler(...args);
    });
  });

  onUnmounted(() => {
    offEvent();
  });
}

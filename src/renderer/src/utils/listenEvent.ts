import { type EventMap } from 'src/main/event';
import { onUnmounted } from 'vue';
import { onMounted } from 'vue';

/**
 * Listen for IPC events sent from the main process.
 */
export function listenEvent<T extends keyof EventMap>(eventName: T, handler: (options: EventMap[T]) => void) {
  const offEvent = window.electron.ipcRenderer.on(eventName, (_evt, options) => {
    handler(options);
  });
  return offEvent;
}

/**
 * In-Component version of listenEvent, which can auto off event on unmounted.
 * Do not call this function outside the component.
 */
export function useListenEvent<T extends keyof EventMap>(eventName: T, handler: (options: EventMap[T]) => void) {
  let offEvent: () => void;

  onMounted(() => {
    offEvent = window.electron.ipcRenderer.on(eventName, (_evt, options) => {
      handler(options);
    });
  });

  onUnmounted(() => {
    offEvent();
  });
}

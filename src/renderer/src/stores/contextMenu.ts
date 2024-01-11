import { ContextMenuOptions } from '@renderer/components/ContextMenu.vue';
import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useContextMenuStore = defineStore('contextMenu', () => {
  const contextMenu = ref<ContextMenuOptions>();

  const showContextMenu = (options: ContextMenuOptions) => {
    contextMenu.value = options;
  };

  const hideContextMenu = () => {
    contextMenu.value = undefined;
  };

  return { contextMenu, showContextMenu, hideContextMenu };
});

<template>
  <div ref="itemEl" class="app-menu-bar-item" @click="handleClick" @mouseenter="handleEnter">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ContextMenuItemData } from './ContextMenu.vue';
import { useContextMenuStore } from '@renderer/stores/contextMenu';

const props = defineProps<{ items: ContextMenuItemData[] }>();
const itemEl = ref<HTMLDivElement>();
const contextMenuStore = useContextMenuStore();

const showMenu = () => {
  if (!itemEl.value) return;
  const rect = itemEl.value.getBoundingClientRect();
  contextMenuStore.showContextMenu({ x: rect.left + 10, y: rect.bottom, items: props.items, triggerEl: itemEl.value });
};

const handleClick = () => {
  if (contextMenuStore.contextMenu && contextMenuStore.contextMenu.triggerEl === itemEl.value) {
    contextMenuStore.hideContextMenu();
  } else {
    showMenu();
  }
};
const handleEnter = () => {
  if (contextMenuStore.contextMenu && contextMenuStore.contextMenu.triggerEl !== itemEl.value) {
    showMenu();
  }
};
</script>

<style scoped>
.app-menu-bar-item {
  color: #8b929a;
  transition: all 0.1s;
  cursor: pointer;
  padding: 10px;
  font-size: small;
  -webkit-app-region: no-drag;

  &:hover {
    color: white;
  }

  position: relative;
  top: 0;
  left: 0;
}
</style>

<template>
  <div ref="itemEl" class="menu-bar-item" @click="handleClick" @mouseenter="handleEnter">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ContextMenuItemData, useAppStore } from '@renderer/stores/appStore';
import { ref } from 'vue';

const props = defineProps<{ items: ContextMenuItemData[] }>()
const itemEl = ref<HTMLDivElement>(undefined!)
const appStore = useAppStore()

const showMenu = () => {
  const rect = itemEl.value.getBoundingClientRect()
  appStore.showContextMenu({ x: rect.left + 10, y: rect.bottom, items: props.items, triggerEl: itemEl.value })
}

const handleClick = () => {
  if (appStore.contextMenu && appStore.contextMenu.triggerEl === itemEl.value) {
    appStore.hideContextMenu()
  } else {
    showMenu()
  }
}
const handleEnter = () => {
  if (appStore.contextMenu && appStore.contextMenu.triggerEl !== itemEl.value) {
    showMenu()
  }
}
</script>

<style scoped>
.menu-bar-item {
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
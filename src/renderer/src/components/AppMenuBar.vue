<template>
  <div class="app-menu-bar" :class="{ 'can-drag': !hasContextMenu }">
    <AppMenuBarItem :items="menuItems[0]">IWPlay</AppMenuBarItem>
    <AppMenuBarItem :items="menuItems[1]">{{ $t('Help') }}</AppMenuBarItem>
    <ControlButtons />
  </div>
</template>

<script lang="ts" setup>
import AppMenuBarItem from '@renderer/components/AppMenuBarItem.vue';
import ControlButtons from './ControlButtons.vue';

import { computed } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { ContextMenuItemData } from './ContextMenu.vue';
import { useContextMenuStore } from '@renderer/stores/contextMenu';

const contextMenuStore = useContextMenuStore();
const hasContextMenu = computed(() => contextMenuStore.contextMenu !== undefined);

const menuItems: ContextMenuItemData[][] = [
  // IWPlay
  [
    { type: 'text', text: 'Settings', onClick: () => invoke('create-window', { type: 'settings', name: 'settings' }, { width: 800, height: 600 }) }, //
    { type: 'separator' },
    { type: 'text', text: 'Quit', onClick: () => invoke('quit') },
  ],
  // Help
  [
    { type: 'text', text: 'Github', onClick: () => invoke('open-external', `https://github.com/cubeww/iwplay-electron`) }, //
    { type: 'separator' },
    { type: 'text', text: 'About', onClick: () => invoke('create-window', { type: 'about', name: 'about' }, { width: 450, height: 300 }) },
  ],
];
</script>

<style scoped>
.app-menu-bar {
  display: flex;

  &.can-drag {
    -webkit-app-region: drag;
  }
}
</style>

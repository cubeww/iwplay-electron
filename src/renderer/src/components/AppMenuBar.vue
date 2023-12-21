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

import { useAppStore } from '@renderer/stores/appStore';
import { computed } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { ContextMenuItemData } from './ContextMenu.vue';

const appStore = useAppStore();
const hasContextMenu = computed(() => appStore.contextMenu !== undefined);

const menuItems: ContextMenuItemData[][] = [
  // IWPlay
  [{ type: 'text', text: 'Settings', onClick: () => invoke('create-window', 'settings', 'settings', 800, 600) }, { type: 'separator' }, { type: 'text', text: 'Quit', onClick: () => invoke('quit') }],
  // Help
  [{ type: 'text', text: 'Github', onClick: () => {} }, { type: 'separator' }, { type: 'text', text: 'About', onClick: () => {} }]
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

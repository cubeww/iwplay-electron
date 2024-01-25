<template>
  <div class="app-menu-bar" :class="{ 'can-drag': !hasContextMenu }">
    <div class="left">
      <AppMenuBarItem :items="menuItems[0]">IWPlay</AppMenuBarItem>
      <AppMenuBarItem :items="menuItems[1]">{{ $t('Help') }}</AppMenuBarItem>
    </div>
    <div class="right">
      <div v-if="libraryStore.delFruitLogged" class="user">
        <div class="user-logo"></div>
        <div class="user-name">{{ libraryStore.delFruitUserName }}</div>
      </div>
      <ControlButtons />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppMenuBarItem from '@renderer/components/AppMenuBarItem.vue';
import ControlButtons from './ControlButtons.vue';

import { computed } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { ContextMenuItemData } from './ContextMenu.vue';
import { useContextMenuStore } from '@renderer/stores/contextMenu';
import { useLibraryStore } from '@renderer/stores/library';

const contextMenuStore = useContextMenuStore();
const libraryStore = useLibraryStore();
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
  justify-content: space-between;
  &.can-drag {
    -webkit-app-region: drag;
  }
}

.left {
  display: flex;
}

.right {
  display: flex;
  gap: 10px;
}

.user {
  padding-right: 10px;
  margin-top: 5px;
  -webkit-app-region: no-drag;
  min-width: 64px;
  height: 24px;
  border-radius: 2px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  color: #4bb3fd;
  font-size: small;
  background-color: #272d37;
  cursor: pointer;
  transition: all 0.1s;

  &:hover {
    background-color: #213a50;
  }
}

.user-logo {
  width: 24px;
  height: 24px;
  background-image: url('/cherry.png');
  background-repeat: no-repeat;
  background-size: 16px 18px;
  background-position: center;
  border-right: 2px solid #6bccf2;
}

.user-name {
  margin-bottom: 2px;
}
</style>

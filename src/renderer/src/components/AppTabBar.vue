<template>
  <div class="app-tab-bar">
    <div class="browser-button" :class="{ enable: navigateStore.canBack }" @click="navigateStore.back()">
      <BrowserBackIcon />
    </div>
    <div class="browser-button" :class="{ enable: navigateStore.canForward }" @click="navigateStore.forward()">
      <BrowserForwardIcon />
    </div>
    <AppTabBarItem to="browser" :items="menuItems[0]">{{ $t('DELFRUIT') }}</AppTabBarItem>
    <AppTabBarItem to="library">{{ $t('LIBRARY') }}</AppTabBarItem>
    <!-- <AppTabBarItem to="user">Cube</AppTabBarItem> -->
  </div>
</template>

<script lang="ts" setup>
import BrowserBackIcon from '@renderer/icons/BrowserBackIcon.vue';
import BrowserForwardIcon from '@renderer/icons/BrowserForwardIcon.vue';
import AppTabBarItem from './AppTabBarItem.vue';
import { ContextMenuItemData } from './ContextMenu.vue';
import { useNavigateStore } from '@renderer/stores/navigate';

const navigateStore = useNavigateStore();

const menuItems: ContextMenuItemData[][] = [
  // DelFruit
  [
    { type: 'text', text: 'Delicious Fruit', onClick: () => navigateStore.toggleBrowserAndLoadURL('https://delicious-fruit.com/') },
    { type: 'text', text: 'I wanna Wiki', onClick: () => navigateStore.toggleBrowserAndLoadURL('https://www.iwannawiki.com/') },
  ],
];
</script>

<style scoped>
.app-tab-bar {
  display: flex;
  padding-left: 6px;
  align-items: center;
  padding-bottom: 6px;
}

.browser-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  transition: all 0.1s;

  &.enable {
    color: #67707b;
    cursor: pointer;

    &:hover {
      color: #dcdedf;
    }
  }

  &:not(.enable) {
    color: #3d4450;
    cursor: default;
  }
}
</style>

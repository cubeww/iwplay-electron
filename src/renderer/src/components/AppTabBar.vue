<template>
  <div class="app-tab-bar">
    <BrowserBackIcon class="browser-button" :class="{ enable: canBack }" @click="handleBack()" />
    <BrowserForwardIcon class="browser-button" :class="{ enable: canForward }" @click="handleForward()" />
    <AppTabBarItem to="browser" :items="menuItems[0]">{{ $t('DELFRUIT') }}</AppTabBarItem>
    <AppTabBarItem to="library">{{ $t('LIBRARY') }}</AppTabBarItem>
    <!-- <AppTabBarItem to="user">Cube</AppTabBarItem> -->
  </div>
</template>

<script lang="ts" setup>
import BrowserBackIcon from '@renderer/icons/BrowserBackIcon.vue';
import BrowserForwardIcon from '@renderer/icons/BrowserForwardIcon.vue';
import AppTabBarItem from './AppTabBarItem.vue';
import { useAppStore } from '@renderer/stores/appStore';
import { computed } from 'vue';
import { ContextMenuItemData } from './ContextMenu.vue';

const appStore = useAppStore();
const canBack = computed(() => appStore.past.length > 0);
const canForward = computed(() => appStore.future.length > 0);

const menuItems: ContextMenuItemData[][] = [
  // DelFruit
  [
    { type: 'text', text: 'Delicious Fruit', onClick: () => appStore.toggleBrowserAndLoadURL('https://delicious-fruit.com/') },
    { type: 'text', text: 'I wanna Wiki', onClick: () => appStore.toggleBrowserAndLoadURL('https://www.iwannawiki.com/') }
  ]
];

const handleBack = () => {
  if (canBack.value) {
    appStore.back();
  }
};

const handleForward = () => {
  if (canForward.value) {
    appStore.forward();
  }
};
</script>

<style scoped>
.app-tab-bar {
  display: flex;
  padding-left: 6px;
  align-items: center;
  padding-bottom: 6px;
}

.browser-button {
  transition: all 0.1s;
  width: 32px;
  height: 32px;

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

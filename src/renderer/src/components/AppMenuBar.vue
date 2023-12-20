<template>
  <div class="title-bar" :class="{ 'can-drag': !hasContextMenu }">
    <AppMenuBarItem :items="menuItems[0]">IWPlay</AppMenuBarItem>
    <AppMenuBarItem :items="menuItems[1]">{{ $t('Help') }}</AppMenuBarItem>
    <div class="control-buttons">
      <WindowMinimizeIcon class="control-button minimize" @click="invoke('minimize', 'main')" />
      <WindowMaximizeIcon class="control-button maximize" @click="invoke('maximize', 'main')" v-if="!appStore.isMaximize" />
      <WindowRestoreIcon class="control-button maximize" @click="invoke('maximize', 'main')" v-else />
      <WindowCloseIcon class="control-button close" @click="invoke('quit')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import AppMenuBarItem from '@renderer/components/AppMenuBarItem.vue';
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import WindowMaximizeIcon from '@renderer/icons/WindowMaximizeIcon.vue';
import WindowMinimizeIcon from '@renderer/icons/WindowMinimizeIcon.vue';
import WindowRestoreIcon from '@renderer/icons/WindowRestoreIcon.vue';
import { useAppStore } from '@renderer/stores/appStore';
import { computed } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { ContextMenuItemData } from './ContextMenu.vue';
const appStore = useAppStore();
const hasContextMenu = computed(() => appStore.contextMenu !== undefined);

const menuItems: ContextMenuItemData[][] = [
  // IWPlay
  [{ type: 'text', text: 'Settings', onClick: () => invoke('create-window', 'settings', 'settings', 800, 600) }, { type: 'separator' }, { type: 'text', text: 'Quit', onClick: () => invoke('quit') }],
  // 帮助
  [{ type: 'text', text: 'Github', onClick: () => {} }, { type: 'separator' }, { type: 'text', text: 'About', onClick: () => {} }]
];
</script>

<style scoped>
.title-bar {
  display: flex;

  &.can-drag {
    -webkit-app-region: drag;
  }
}

.control-buttons {
  position: absolute;
  right: 0;
  -webkit-app-region: no-drag;
}

.control-button {
  width: 20px;
  padding: 4px 8px;
  transition: all 0.1s;
  color: #788a92;

  &:hover {
    color: white;

    &.minimize,
    &.maximize {
      background-color: #3e4450;
    }

    &.close {
      background-color: #dc322b;
    }
  }
}
</style>

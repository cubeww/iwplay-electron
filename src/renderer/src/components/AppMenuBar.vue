<template>
  <div class="title-bar" :class="{ 'can-drag': !hasContextMenu }">
    <AppMenuBarItem :items="menuItems[0]">IWPlay</AppMenuBarItem>
    <AppMenuBarItem :items="menuItems[1]">帮助</AppMenuBarItem>
    <div class="control-buttons">
      <WindowMinimizeIcon class="control-button minimize" @click="send('minimize')" />
      <WindowMaximizeIcon class="control-button maximize" @click="send('maximize')" />
      <WindowCloseIcon class="control-button close" @click="send('close')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import WindowMaximizeIcon from '@renderer/icons/WindowMaximizeIcon.vue';
import WindowMinimizeIcon from '@renderer/icons/WindowMinimizeIcon.vue';
import AppMenuBarItem from '@renderer/components/AppMenuBarItem.vue'
import { ContextMenuItemData, useAppStore } from '@renderer/stores/appStore';
import { computed } from 'vue';

const send = (message: string) => {
  window.electron.ipcRenderer.send(message)
}

const appStore = useAppStore()
const hasContextMenu = computed(() => appStore.contextMenu !== undefined)

const menuItems: ContextMenuItemData[][] = [
  // IWPlay
  [
    { type: 'text', text: '设置', onClick: () => {} },
    { type: 'separator' },
    { type: 'text', text: '退出', onClick: () => send('close') },
  ],
  // 帮助
  [
    { type: 'text', text: 'Github', onClick: () => { } },
    { type: 'separator' },
    { type: 'text', text: '关于', onClick: () => { } },
  ],
]

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
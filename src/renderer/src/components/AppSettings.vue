<template>
  <div class="settings">
    <div class="control-buttons">
      <WindowMinimizeIcon class="control-button minimize" @click="invoke('minimize', 'settings')" />
      <WindowMaximizeIcon class="control-button maximize" @click="invoke('maximize', 'settings')" v-if="!isMaximize" />
      <WindowRestoreIcon class="control-button maximize" @click="invoke('maximize', 'settings')" v-else />
      <WindowCloseIcon class="control-button close" @click="invoke('close', 'settings')" />
    </div>
    <div class="sidebar"></div>
    <div class="detail"></div>
  </div>
</template>

<script lang="ts" setup>
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import WindowMaximizeIcon from '@renderer/icons/WindowMaximizeIcon.vue';
import WindowMinimizeIcon from '@renderer/icons/WindowMinimizeIcon.vue';
import WindowRestoreIcon from '@renderer/icons/WindowRestoreIcon.vue';

import { invoke } from '@renderer/utils/invoke';
import { onMounted, ref } from 'vue';

const isMaximize = ref(false);

onMounted(async () => {
  window.electron.ipcRenderer.on('maximize', (_evt, value) => {
    isMaximize.value = value;
  });
});
</script>

<style scoped>
.settings {
  width: 100vw;
  height: 100vh;
  display: flex;
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
.sidebar {
  background-color: #2a2d34;
  width: 200px;
}
.detail {
  background-color: #171d25;
  flex-grow: 1;
}
</style>

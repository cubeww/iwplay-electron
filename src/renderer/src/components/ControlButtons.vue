<template>
  <div class="control-buttons">
    <div class="control-button minimize" @click="invoke('minimize', windowName)">
      <WindowMinimizeIcon class="control-button-icon" />
    </div>
    <div v-if="!isMaximize" class="control-button maximize" @click="invoke('maximize', windowName)">
      <WindowMaximizeIcon class="control-button-icon" />
    </div>
    <div v-else class="control-button maximize" @click="invoke('maximize', windowName)">
      <WindowRestoreIcon class="control-button-icon" />
    </div>
    <div class="control-button close" @click="handleClickClose">
      <WindowCloseIcon class="control-button-icon" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import WindowMaximizeIcon from '@renderer/icons/WindowMaximizeIcon.vue';
import WindowMinimizeIcon from '@renderer/icons/WindowMinimizeIcon.vue';
import WindowRestoreIcon from '@renderer/icons/WindowRestoreIcon.vue';

import { invoke } from '@renderer/utils/invoke';
import { windowName } from '@renderer/main';
import { ref } from 'vue';
import { useListenEvent } from '@renderer/utils/listenEvent';

const isMaximize = ref(false);

useListenEvent('maximize', ({ value }) => {
  isMaximize.value = value;
});

const handleClickClose = () => {
  if (windowName === 'main') {
    invoke('hide', windowName);
  } else {
    invoke('close', windowName);
  }
};
</script>

<style scoped>
.control-buttons {
  display: flex;
  -webkit-app-region: no-drag;
}

.control-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
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
.control-button-icon {
  width: 20px;
  height: 20px;
}
</style>

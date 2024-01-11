<template>
  <div class="control-buttons">
    <WindowMinimizeIcon class="control-button minimize" @click="invoke('minimize', windowName)" />
    <WindowMaximizeIcon v-if="!isMaximize" class="control-button maximize" @click="invoke('maximize', windowName)" />
    <WindowRestoreIcon v-else class="control-button maximize" @click="invoke('maximize', windowName)" />
    <WindowCloseIcon class="control-button close" @click="handleClickClose" />
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

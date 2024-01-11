<template>
  <div ref="trayMenuEl" class="tray-menu">
    <div class="item" @click="handleClickToMain('delfruit')">DelFruit</div>
    <div class="item" @click="handleClickToMain('library')">Library</div>
    <div class="separator" />
    <div class="item" @click="invoke('quit')">Quit IWPlay</div>
  </div>
</template>

<script lang="ts" setup>
import { windowName } from '@renderer/main';
import { invoke } from '@renderer/utils/invoke';
import { onMounted, ref } from 'vue';
import { ShowEventOptions } from 'src/main/event';

const trayMenuEl = ref<HTMLDivElement>();

onMounted(() => {
  if (trayMenuEl.value) {
    // Let the window resize to the content size
    invoke('resize-tray-menu', trayMenuEl.value.clientWidth, trayMenuEl.value.clientHeight);
  }
});

const handleClickToMain = (action: ShowEventOptions) => {
  invoke('send-event', 'show', action);
  invoke('hide', windowName);
};
</script>

<style scoped>
.tray-menu {
  width: 100vw;
  min-height: 0;
  box-sizing: border-box;
  padding: 8px;
  overflow: hidden;
  background-color: #3d4450;
  display: flex;
  flex-direction: column;
  font-size: small;
}

.separator {
  width: 100%;
  height: 1px;
  background-color: #696969;
}

.item {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
  color: #d8dadb;
  height: 16px;
  &:hover {
    background-color: #dcdedf;
    color: #3d4450;
  }
}
</style>

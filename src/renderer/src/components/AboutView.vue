<template>
  <div class="about">
    <div class="title-bar">
      <WindowCloseIcon class="close-button" @click="handleClickClose" />
    </div>
    <div class="header">
      <img class="logo" src="/logo.png" alt="" />
      <div class="title">{{ $t('About IWPlay') }}</div>
    </div>
    <div class="row">
      <div class="row-name">{{ $t('Version:') }}</div>
      <div class="row-value">{{ version }}</div>
    </div>
    <div class="row">
      <div class="row-name">{{ $t('Auther:') }}</div>
      <div class="row-value">NyaCube</div>
    </div>

    <img class="discord" src="https://img.shields.io/discord/1187726851855106148?color=%237289DA&label=IWPlay&logo=discord&logoColor=white" alt="" @click="handleClickDiscord" />

    <ButtonPure class="close" @click="handleClickClose">{{ $t('Close') }}</ButtonPure>
  </div>
</template>

<script lang="ts" setup>
import { windowName } from '@renderer/main';
import { invoke } from '@renderer/utils/invoke';
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import ButtonPure from './ButtonPure.vue';
import { ref } from 'vue';
import { onMounted } from 'vue';

const version = ref('');

onMounted(async () => {
  version.value = await invoke('app-version');
});

const handleClickClose = () => {
  invoke('close', windowName);
};

const handleClickDiscord = () => {
  invoke('open-external', 'https://discord.gg/xW4mY652hC');
};
</script>

<style scoped>
.about {
  width: 100vw;
  height: 100vh;
  background-color: #25282e;
  padding: 25px;
  padding-top: 0;
}
.title-bar {
  -webkit-app-region: drag;
  height: 32px;
}

.close-button {
  -webkit-app-region: no-drag;
  position: absolute;
  right: 0;
  width: 20px;
  padding: 4px 8px;
  transition: all 0.1s;
  color: #788a92;

  &:hover {
    color: white;
    background-color: #dc322b;
  }
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.logo {
  margin-right: 20px;
}

.title {
  color: white;
  font-weight: bold;
  font-size: x-large;
}
.row {
  display: flex;
  line-height: 25px;
}
.row-name {
  color: #dcdedf;
}
.row-value {
  color: #b8bcbf;
  margin-left: 8px;
}
.close {
  position: fixed;
  right: 25px;
  bottom: 25px;
}

.discord {
  margin-top: 10px;
  cursor: pointer;
}
</style>

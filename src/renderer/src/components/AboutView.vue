<template>
  <div class="about">
    <div class="title-bar">
      <div class="close-button" @click="handleClickClose">
        <WindowCloseIcon />
      </div>
    </div>
    <div class="content">
      <div class="header">
        <img class="logo" src="/logo.png" alt="" />
        <div class="title">{{ $t('About IWPlay') }}</div>
      </div>

      <div class="fields">
        <div class="field">
          <div class="field-name">{{ $t('Version:') }}</div>
          <div class="field-value">{{ version }}</div>
        </div>

        <div class="field">
          <div class="field-name">{{ $t('Auther:') }}</div>
          <div class="field-value">NyaCube</div>
        </div>
      </div>

      <img class="discord" src="https://img.shields.io/discord/1187726851855106148?color=%237289DA&label=IWPlay&logo=discord&logoColor=white" alt="" @click="handleClickDiscord" />
    </div>

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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  -webkit-app-region: no-drag;
  position: absolute;
  right: 0;
  transition: all 0.1s;
  color: #788a92;

  &:hover {
    color: white;
    background-color: #dc322b;
  }
}
.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.title {
  color: white;
  font-weight: bold;
  font-size: x-large;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field {
  display: flex;
  gap: 8px;
}

.field-name {
  color: #dcdedf;
}

.field-value {
  color: #b8bcbf;
}

.close {
  position: fixed;
  right: 25px;
  bottom: 25px;
}

.discord {
  align-self: flex-start;
  cursor: pointer;
}
</style>

<template>
  <div class="settings">
    <div class="sidebar">
      <div class="sidebar-title">{{ $t('IWPLAY SETTINGS') }}</div>
      <div class="sidebar-content">
        <div class="sidebar-item" :class="{ selected: i === index }" @click="index = i" v-for="(item, i) in sidebarItems">
          <Component :is="item.icon" class="icon" />
          <div>{{ $t(item.title) }}</div>
        </div>
      </div>
    </div>
    <div class="detail">
      <div class="detail-title">{{ $t(sidebarItems[index].title) }}</div>
      <template v-if="index === 0">
        <div class="row">
          <div class="title">{{ $t('IWPlay Language') }}</div>
          <ComboBox :list="languages" :value="appConfig.language" @update="(value) => setConfig('language', value as any)" />
        </div>
      </template>
    </div>
    <div class="drag-area"></div>
    <div class="control-buttons">
      <WindowMinimizeIcon class="control-button minimize" @click="invoke('minimize', 'settings')" />
      <WindowMaximizeIcon class="control-button maximize" @click="invoke('maximize', 'settings')" v-if="!isMaximize" />
      <WindowRestoreIcon class="control-button maximize" @click="invoke('maximize', 'settings')" v-else />
      <WindowCloseIcon class="control-button close" @click="invoke('close', 'settings')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import ComboBox from './ComboBox.vue';

import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import WindowMaximizeIcon from '@renderer/icons/WindowMaximizeIcon.vue';
import WindowMinimizeIcon from '@renderer/icons/WindowMinimizeIcon.vue';
import WindowRestoreIcon from '@renderer/icons/WindowRestoreIcon.vue';

import LibraryIcon from '@renderer/icons/LibraryIcon.vue';
import ComputerIcon from '@renderer/icons/ComputerIcon.vue';

import { invoke } from '@renderer/utils/invoke';
import { onMounted, ref } from 'vue';
import { appConfig, setConfig } from '@renderer/utils/appConfig';

const isMaximize = ref(false);

onMounted(async () => {
  window.electron.ipcRenderer.on('maximize', (_evt, value) => {
    isMaximize.value = value;
  });
});

const sidebarItems = [
  { icon: ComputerIcon, title: 'Interface' },
  { icon: LibraryIcon, title: 'Library' }
];

const languages = ['en', 'zh'];

const index = ref(0);
</script>

<style scoped>
.settings {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.drag-area {
  width: 100vw;
  height: 60px;
  position: absolute;
  -webkit-app-region: drag;
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
  display: flex;
  flex-direction: column;
}
.sidebar-content {
  display: flex;
  flex-direction: column;
}

.sidebar-item {
  display: flex;
  align-items: center;
  height: 24px;
  color: #b8bcbf;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-left: 24px;

  &:hover {
    background-color: #dcdedf;
    cursor: pointer;
    color: #3d4450;
  }

  &.selected {
    background-color: #3d4450;
    color: #ffffff;
  }
}
.sidebar-title {
  color: #1a9fff;
  font-weight: bold;
  padding: 24px;
}
.sidebar-item .icon {
  margin-right: 20px;
  width: 20px;
  height: 20px;
}
.detail {
  background-color: #171d25;
  flex-grow: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  padding-bottom: 24px;
}

.row {
  display: flex;
  justify-content: space-between;
  align-items: center;

  & .title {
    color: #dcdedf;
  }
}
</style>

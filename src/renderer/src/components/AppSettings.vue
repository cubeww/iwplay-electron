<template>
  <div class="app-settings">
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
        <div class="detail-row">
          <div class="detail-row-title">{{ $t('IWPlay Language') }}</div>
          <ComboBox :list="languages" :value="configStore.cfg.language" @update="(value) => configStore.set('language', value as any)" />
        </div>
      </template>
    </div>
    <div class="drag-area"></div>
    <ControlButtons />
  </div>
</template>

<script lang="ts" setup>
import ComboBox from './ComboBox.vue';
import ControlButtons from './ControlButtons.vue';

import LibraryIcon from '@renderer/icons/LibraryIcon.vue';
import ComputerIcon from '@renderer/icons/ComputerIcon.vue';

import { ref } from 'vue';
import { useConfigStore } from '@renderer/stores/configStore';

const configStore = useConfigStore();

const sidebarItems = [
  { icon: ComputerIcon, title: 'Interface' },
  { icon: LibraryIcon, title: 'Library' }
];

const languages = ['en', 'zh'];

const index = ref(0);
</script>

<style scoped>
.app-settings {
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

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-row-title {
  color: #dcdedf;
}
</style>

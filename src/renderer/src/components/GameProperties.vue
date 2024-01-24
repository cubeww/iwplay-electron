<template>
  <div v-if="manifest" class="app-settings">
    <div class="sidebar">
      <div class="sidebar-title">{{ searchParams.get('gameName') }}</div>
      <div class="sidebar-content">
        <div v-for="(item, i) in sidebarItems" :key="i" class="sidebar-item" :class="{ selected: i === index }" @click="index = i">
          <div>{{ $t(item.title) }}</div>
        </div>
      </div>
    </div>
    <div class="detail">
      <div class="detail-title">{{ $t(sidebarItems[index].title) }}</div>
      <template v-if="index === 0">
        <!--  -->
        <!-- General -->
        <!--  -->
        <div class="detail-row column-2">
          <div class="detail-row-title">{{ $t('Startup Path') }}</div>
          <ComboBox v-model="manifest.startupPath" :list="executablePaths" watch-item-remove />
        </div>
        <div class="detail-row column-2">
          <div class="detail-row-title">{{ $t('Debugger Helper') }}</div>
          <ButtonPure @click="handlePatchDebugger">{{ $t('Patch') }}</ButtonPure>
        </div>
        <div class="detail-row column-2">
          <div class="detail-row-title">{{ $t('Resize Window With DPI (Experimental)') }}</div>
          <SwitchButton v-model="manifest.resize" />
        </div>
      </template>
    </div>
    <div class="drag-area"></div>
    <ControlButtons class="control-buttons" />
  </div>
</template>

<script lang="ts" setup>
import ComboBox from './ComboBox.vue';
import ControlButtons from './ControlButtons.vue';
import ButtonPure from './ButtonPure.vue';
import SwitchButton from './SwitchButton.vue';

import { ref } from 'vue';
import { onMounted } from 'vue';
import { searchParams } from '@renderer/main';
import { invoke } from '@renderer/utils/invoke';
import { FangameManifest } from 'src/main/utils/library';
import { watch } from 'vue';
import { toRaw } from 'vue';

const libraryPath = searchParams.get('libraryPath') as string;
const gameID = searchParams.get('id') as string;

const sidebarItems = [{ title: 'General' }];
const index = ref(0);

const manifest = ref<FangameManifest>(undefined!);

let gettingManifest = false;

watch(
  manifest,
  (newManifest) => {
    if (!gettingManifest) {
      invoke('save-manifest', { gameID, libraryPath, manifest: toRaw(newManifest) });
    } else {
      gettingManifest = false;
    }
  },
  { deep: true },
);

const executablePaths = ref<string[]>([]);

const getManifestFromFile = async () => {
  gettingManifest = true;
  manifest.value = await invoke('get-manifest', { gameID, libraryPath });
};

const updateExecutablePaths = async () => {
  executablePaths.value = await invoke('get-game-executables', { gameID, libraryPath });
};

onMounted(async () => {
  await getManifestFromFile();
  await updateExecutablePaths();
});

const handlePatchDebugger = async () => {
  await invoke('apply-debug-helper', { gameID, libraryPath });
  await updateExecutablePaths();
};
</script>

<style scoped>
.app-settings {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.control-buttons {
  position: absolute;
  right: 0;
  top: 0;
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
  flex-shrink: 0;
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

.flex {
  display: flex;
}

.detail-row {
  margin-bottom: 20px;
}

.detail-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
  padding-bottom: 24px;
}

.column-1 {
  display: flex;
  align-items: center;
}

.column-2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.column-stack {
  display: flex;
}

.detail-row-title {
  color: #dcdedf;
}
.description {
  margin-bottom: 10px;
}
</style>

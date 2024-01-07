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
          <ComboBox :list="executablePaths" :value="manifest.startupPath" @update="(value) => updateManifest((m) => (m.startupPath = value))" />
        </div>
        <div class="detail-row column-2">
          <div class="detail-row-title">{{ $t('Debugger Helper') }}</div>
          <ButtonPure @click="handlePatchDebugger">{{ $t('Patch') }}</ButtonPure>
        </div>
        <div class="detail-row column-2">
          <div class="detail-row-title">{{ $t('Resize Window With DPI (Experimental)') }}</div>
          <SwitchButton :value="manifest.resize" @update="(value) => updateManifest((m) => (m.resize = value))" />
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
import ButtonPure from './ButtonPure.vue';
import SwitchButton from './SwitchButton.vue';

import { ref } from 'vue';
import { onMounted } from 'vue';
import { searchParams } from '@renderer/main';
import { FangameManifest, library } from '@renderer/utils/library';
import { invoke } from '@renderer/utils/invoke';
import { paths } from '@renderer/utils/paths';

const libraryPath = searchParams.get('libraryPath') as string;
const id = searchParams.get('id') as string;

const sidebarItems = [{ title: 'General' }];
const index = ref(0);

const manifest = ref<FangameManifest>();
const updateManifest = (patch: (m: FangameManifest) => void) => {
  if (!manifest.value) return;
  patch(manifest.value);
  const manifestPath = paths.manifest(libraryPath, id);
  invoke('write-file', manifestPath, JSON.stringify(manifest.value, null, 4));
};

const executablePaths = ref<string[]>([]);

onMounted(async () => {
  manifest.value = await library.getManifest(libraryPath, id);
  executablePaths.value = await library.getExecutablePaths(paths.gameDir(libraryPath, id));
});

const handlePatchDebugger = async () => {
  const gameDir = paths.gameDir(libraryPath, id);
  await invoke('dbghelper', gameDir);

  // The game's executable file path may have changed, so regenerate the manifest
  await library.createManifest(libraryPath, id);
  manifest.value = await library.getManifest(libraryPath, id);
};
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

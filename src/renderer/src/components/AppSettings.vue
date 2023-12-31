<template>
  <div class="app-settings">
    <div class="sidebar">
      <div class="sidebar-title">{{ $t('IWPLAY SETTINGS') }}</div>
      <div class="sidebar-content">
        <div v-for="(item, i) in sidebarItems" :key="i" class="sidebar-item" :class="{ selected: i === index }" @click="index = i">
          <Component :is="item.icon" class="icon" />
          <div>{{ $t(item.title) }}</div>
        </div>
      </div>
    </div>
    <div class="detail">
      <div class="detail-title">{{ $t(sidebarItems[index].title) }}</div>
      <template v-if="index === 0">
        <!--  -->
        <!-- Interface -->
        <!--  -->
        <div class="detail-row column-2">
          <div class="detail-row-title">{{ $t('IWPlay Language') }}</div>
          <ComboBox :list="languages" :value="configStore.cfg.language" @update="(value) => configStore.set((cfg) => (cfg.language = value as any))" />
        </div>
      </template>
      <template v-if="index === 1">
        <!--  -->
        <!-- Storage -->
        <!--  -->
        <div class="detail-row column-2">
          <div class="detail-row-title">
            {{ $t('Library Paths') }}
          </div>
          <div class="flex">
            <DeleteIcon class="storage-button" @click="handleDeleteLibraryPath" />
            <AddIcon class="storage-button" @click="handleAddLibraryPath" />
          </div>
        </div>
        <div class="detail-row column-1">
          <ComboBox class="storage-combo" :list="configStore.cfg.libraryPaths" :value="libraryPath" @update="(value) => (libraryPath = value)" />
        </div>
        <div class="description">
          {{ $t('The library path is used to store installed fangame files. It is recommended to choose an empty folder with ample remaining space on the hard drive. Example: D:\\IWPlayLibrary') }}
        </div>
        <div class="description">
          {{ $t("You can add multiple library paths at the same time, but it's best to use just one.") }}
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

import ComputerIcon from '@renderer/icons/ComputerIcon.vue';
import DiskIcon from '@renderer/icons/DiskIcon.vue';
import DeleteIcon from '@renderer/icons/DeleteIcon.vue';
import AddIcon from '@renderer/icons/AddIcon.vue';

import { ref } from 'vue';
import { useConfigStore } from '@renderer/stores/configStore';
import { onMounted } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { searchParams, windowName } from '@renderer/main';

const configStore = useConfigStore();

const sidebarItems = [
  { icon: ComputerIcon, title: 'Interface' },
  { icon: DiskIcon, title: 'Storage' }
];

const index = ref(0);
const languages = ['en', 'zh'];

const libraryPath = ref('');

const resetLibraryPath = () => {
  if (configStore.cfg.libraryPaths.length === 0) {
    libraryPath.value = '';
  } else if (libraryPath.value !== '') {
    const currentPathIsDeleted = configStore.cfg.libraryPaths.indexOf(libraryPath.value) === -1;
    if (currentPathIsDeleted) {
      libraryPath.value = configStore.cfg.libraryPaths[0];
    }
  } else {
    libraryPath.value = configStore.cfg.libraryPaths[0];
  }
};

onMounted(() => {
  index.value = sidebarItems.findIndex((i) => i.title === searchParams.get('startTitle'));

  if (index.value === -1) {
    index.value = 0;
  }

  resetLibraryPath();
});

const handleAddLibraryPath = async () => {
  let path = await invoke('open-file-dialog', windowName, {
    properties: ['openDirectory']
  });

  if (!path) {
    return;
  }

  path = await invoke('path-resolve', path[0]);
  const pathLowerCase = path.toLowerCase();

  let exists: string | undefined = undefined;

  for (const p of configStore.cfg.libraryPaths) {
    if ((await invoke('path-resolve', p)).toLowerCase() === pathLowerCase) {
      exists = p;
      break;
    }
  }

  if (!exists) {
    configStore.set((cfg) => cfg.libraryPaths.push(path));
    libraryPath.value = path;
  } else {
    libraryPath.value = exists;
  }
};

const handleDeleteLibraryPath = () => {
  if (libraryPath.value === '') {
    return;
  }

  const index = configStore.cfg.libraryPaths.indexOf(libraryPath.value);

  configStore.set((cfg) => cfg.libraryPaths.splice(index, 1));

  resetLibraryPath();
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
  margin-bottom: 10px;
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

.storage-combo {
  width: 100%;
  flex-grow: 1;
}

.storage-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  background-color: #292e36;
  padding: 4px;
  transition: all 0.3s;
  cursor: pointer;
  flex-shrink: 0;
  border-radius: 4px;
  margin-right: 10px;

  &:nth-last-child(1) {
    margin-right: 0;
  }

  &:hover {
    background-color: #464d58;
  }
}

.description {
  margin-bottom: 10px;
}
</style>

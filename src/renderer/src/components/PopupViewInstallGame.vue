<template>
  <PopupView @close-popup="emit('closePopup')">
    <PopupTitle>{{ $t('Install') }}</PopupTitle>
    <PopupSeparator />
    <div>{{ context.name }} (ID: {{ context.id }})</div>
    <PopupSeparator />
    <div class="row">
      <ButtonGradient style="width: 120px" color1="#4ade80" color2="#16a34a" @click="handleSelectGameFile">{{ $t('Select File') }}</ButtonGradient>
      <ButtonGradient style="width: 120px" color1="#4ade80" color2="#16a34a" @click="handleSelectGameFolder">{{ $t('Select Folder') }}</ButtonGradient>
    </div>
    <template v-if="filename">
      <div class="bold">{{ $t('File Name: ') }} {{ filename }}</div>
      <div class="bold">{{ $t('File Size: ') }} {{ filesizeStr }}</div>
    </template>
    <template v-else>
      <div class="bold">{{ $t('No Game File Selected') }}</div>
    </template>
    <PopupSeparator />
    <div class="install-to-row">
      <div class="bold white">{{ $t('INSTALL TO: ') }}</div>
      <div class="settings-button" @click="handleClickSettings">
        <SettingsIcon />
      </div>
    </div>
    <div v-if="settingsStore.settings.libraryPaths.length === 0" class="warning-message">
      {{ $t('Library path not added! Please click the settings button in the upper right corner to add one.') }}
    </div>
    <div v-for="(path, index) in settingsStore.settings.libraryPaths" :key="index" class="library-path-item" :class="{ selected: selectedLibraryPath === path }" @click="selectedLibraryPath = path">
      <DiskIcon />
      {{ path }}
    </div>
    <div v-if="installStatus === 'installing'" class="installing-row"><LoadingIcon :size="32" />{{ $t('INSTALLING...') }}</div>
    <div class="bottom">
      <ButtonGradient class="bottom-button" :enabled="filename !== '' && installStatus !== 'installing' && selectedLibraryPath !== ''" @click="handleInstall">{{ $t('Install') }}</ButtonGradient>
      <ButtonPure class="bottom-button" @click="emit('closePopup')">{{ $t('Cancel') }}</ButtonPure>
    </div>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import PopupSeparator from './PopupSeparator.vue';
import ButtonGradient from './ButtonGradient.vue';
import ButtonPure from './ButtonPure.vue';
import LoadingIcon from '@renderer/icons/LoadingIcon.vue';
import SettingsIcon from '@renderer/icons/SettingsIcon.vue';
import DiskIcon from '@renderer/icons/DiskIcon.vue';
import { invoke } from '@renderer/utils/invoke';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { onMounted } from 'vue';
import { useSettingsStore } from '@renderer/stores/settings';
import { usePopupStore } from '@renderer/stores/popup';

export interface InstallPopupContext {
  id: string;
  name: string;
}

const props = defineProps<{ context: InstallPopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const settingsStore = useSettingsStore();
const popupStore = usePopupStore();

const filename = ref('');
const filesize = ref(0);

const i18n = useI18n();

const installStatus = ref<'pending' | 'installing' | 'error' | 'ok'>('pending');

const selectedLibraryPath = ref('');

onMounted(() => {
  if (settingsStore.settings.libraryPaths.length > 0) {
    selectedLibraryPath.value = settingsStore.settings.libraryPaths[0];
  }
});

const handleSelectGameFile = async () => {
  const f = await invoke('open-file-dialog', 'main', {
    title: i18n.t('Select Game File'),
    filters: [
      { name: 'Compress Files', extensions: ['zip', 'rar', '7z'] },
      { name: 'Executable File', extensions: ['exe'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (typeof f === 'object' && typeof f[0] === 'string') {
    filename.value = f[0];
    filesize.value = await invoke('file-size', filename.value);
  }
};

const handleSelectGameFolder = async () => {
  const f = await invoke('open-file-dialog', 'main', {
    title: i18n.t('Select Game Folder'),
    properties: ['openDirectory'],
  });

  if (typeof f === 'object' && typeof f[0] === 'string') {
    filename.value = f[0];
    filesize.value = await invoke('file-size', filename.value);
  }
};

const handleInstall = async () => {
  installStatus.value = 'installing';
  try {
    await invoke('install-game', {
      file: filename.value,
      gameName: props.context.name,
      gameID: props.context.id,
      libraryPath: selectedLibraryPath.value,
    });
    emit('closePopup');
  } catch (err) {
    popupStore.showError((err as Error).message);
    installStatus.value = 'error';
  }
};

const filesizeStr = computed(() => (filesize.value / 1048576.0).toFixed(2) + ' MB');

const handleClickSettings = () => {
  emit('closePopup');
  invoke('create-window', { type: 'settings', name: 'settings', startTitle: 'Storage' }, { width: 800, height: 600 });
};
</script>

<style scoped>
.title {
  font-size: x-large;
  color: white;
  font-weight: bold;
}

.install-to-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  padding-bottom: 8px;
}
.bottom {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.bottom-button {
  width: 120px;
}

.row {
  display: flex;
  gap: 10px;
}

.bold {
  font-weight: bold;
}

.white {
  color: white;
}

.settings-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #3d4450;
  border-radius: 4px;
  transition: all 0.1s;
  color: #dfe3e6;
  cursor: pointer;

  &:hover {
    background-color: #464d58;
    color: white;
  }
}

.library-path-item {
  display: flex;
  align-items: center;
  padding: 10px;
  padding-top: 5px;
  padding-bottom: 5px;
  background-color: #3d4450;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  gap: 10px;

  &:hover {
    background-color: #67707b;
  }

  &.selected {
    background-color: #1a9fff;
  }
}

.installing-row {
  display: flex;
  padding: 10px;
}

.warning-message {
  line-height: 32px;
  color: yellow;
}
</style>

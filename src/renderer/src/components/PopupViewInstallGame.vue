<template>
  <PopupView @closePopup="emit('closePopup')">
    <PopupTitle>{{ $t('Install') }}</PopupTitle>
    <PopupSeparator />
    <div>{{ context.name }} (ID: {{ context.id }})</div>
    <PopupSeparator />
    <ButtonGradient style="width: 120px" @click="handleSelectZip" color1="#4ade80" color2="#16a34a">{{ $t('Select ZIP') }}</ButtonGradient>
    <template v-if="filename">
      <div class="bold">{{ $t('File Name: ') }} {{ filename }}</div>
      <div class="bold">{{ $t('File Size: ') }} {{ filesizeStr }}</div>
    </template>
    <template v-else>
      <div class="bold">{{ $t('No ZIP Selected') }}</div>
    </template>
    <PopupSeparator />
    <div class="install-to-row">
      <div class="bold white">{{ $t('INSTALL TO: ') }}</div>
      <SettingsIcon class="settings-button" @click="handleClickSettings" />
    </div>
    <div class="warning-message" v-if="configStore.cfg.libraryPaths.length === 0">
      {{ $t('Library path not added! Please click the settings button in the upper right corner to add one.') }}
    </div>
    <div class="library-path-item" v-for="path in configStore.cfg.libraryPaths" :class="{ selected: selectedLibraryPath === path }" @click="selectedLibraryPath = path">
      <DiskIcon class="library-path-item-icon" />
      {{ path }}
    </div>
    <div class="installing-row" v-if="installStatus === 'installing'"><LoadingIcon :size="32" />{{ $t('INSTALLING...') }}</div>
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
import { useConfigStore } from '@renderer/stores/configStore';
import { onMounted } from 'vue';

export interface InstallPopupContext {
  id: string;
  name: string;
}

defineProps<{ context: InstallPopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const configStore = useConfigStore();

const filename = ref('');
const filesize = ref(0);

const i18n = useI18n();

const installStatus = ref<'pending' | 'installing' | 'error'>('pending');

const selectedLibraryPath = ref('');

onMounted(() => {
  if (configStore.cfg.libraryPaths.length > 0) {
    selectedLibraryPath.value = configStore.cfg.libraryPaths[0];
  }
});

const handleSelectZip = async () => {
  const f = await invoke('open-file-dialog', 'main', {
    title: i18n.t('Select Game ZIP'),
    filters: [
      { name: 'Compress Files', extensions: ['zip', 'rar', '7z'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (typeof f === 'object' && typeof f[0] === 'string') {
    filename.value = f[0];
    filesize.value = await invoke('file-size', filename.value);
  }
};

const handleInstall = () => {
  installStatus.value = 'installing';
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
  margin-top: 16px;
}
.bottom-button {
  width: 120px;
  margin-left: 16px;
}

.bold {
  font-weight: bold;
}

.white {
  color: white;
}

.settings-button {
  padding: 4px;
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
  margin-bottom: 4px;

  &:hover {
    background-color: #67707b;
  }

  &.selected {
    background-color: #1a9fff;
  }
}

.library-path-item-icon {
  margin-right: 10px;
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

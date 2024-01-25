<template>
  <PopupView @close-popup="emit('closePopup')">
    <PopupTitle>{{ $t('Download And Install') }}</PopupTitle>
    <PopupSeparator />
    <div>{{ $t('File Name: ') }} {{ context.filename }}</div>
    <div>{{ $t('File Size: ') }} {{ (context.filesize / 1048576.0).toFixed(2) }} MB</div>
    <div class="bold white">{{ $t('TARGET FANGAME DELFRUIT ID:') }}</div>
    <div class="target">
      <div class="target-input-row">
        <input v-model="targetFangameId" placeholder="Input Fangame ID" class="target-input" type="text" />
        <div class="target-input-buttons">
          <div class="refresh-button" :class="{ enable: libraryStore.fetchFangameItemsStatus !== 'fetching' }" @click="handleClickRefresh">
            <RefreshIcon :class="{ rotate: libraryStore.fetchFangameItemsStatus === 'fetching' }" />
          </div>
          <div class="settings-button" @click="handleClickHelpID">
            <HelpIcon />
          </div>
        </div>
      </div>
      <div class="target-result" :class="{ valid: targetFangameValid }">
        {{ targetFangameValid ? targetFangameName : $t('NO RESULT') }}
      </div>
    </div>
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
    <div class="bottom">
      <ButtonGradient class="bottom-button" :enabled="selectedLibraryPath !== '' && targetFangameValid" @click="handleClickInstall">{{ $t('Install') }}</ButtonGradient>
      <ButtonPure class="bottom-button" @click="emit('closePopup')">{{ $t('Cancel') }}</ButtonPure>
    </div>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import PopupSeparator from './PopupSeparator.vue';
import SettingsIcon from '@renderer/icons/SettingsIcon.vue';
import DiskIcon from '@renderer/icons/DiskIcon.vue';
import HelpIcon from '@renderer/icons/HelpIcon.vue';
import ButtonGradient from './ButtonGradient.vue';
import ButtonPure from './ButtonPure.vue';
import PopupViewMessage from './PopupViewMessage.vue';
import RefreshIcon from '@renderer/icons/RefreshIcon.vue';

import { onMounted, ref } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { computed } from 'vue';
import { useLibraryStore } from '@renderer/stores/library';
import { useSettingsStore } from '@renderer/stores/settings';
import { usePopupStore } from '@renderer/stores/popup';

export interface DownloadPopupContext {
  url: string;
  filename: string;
  filesize: number;
  possibleID: string;
}

const props = defineProps<{ context: DownloadPopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const libraryStore = useLibraryStore();
const settingsStore = useSettingsStore();
const popupStore = usePopupStore();

const selectedLibraryPath = ref('');
const targetFangameId = ref(props.context.possibleID);

const targetFangameName = computed(() => {
  const item = libraryStore.fangameItems.find((i) => i.id === targetFangameId.value);
  return item ? item.name : '';
});

const targetFangameValid = computed(() => targetFangameName.value !== '');

onMounted(() => {
  if (settingsStore.settings.libraryPaths.length > 0) {
    selectedLibraryPath.value = settingsStore.settings.libraryPaths[0];
  }
});

const handleClickSettings = () => {
  emit('closePopup');
  invoke('create-window', { type: 'settings', name: 'settings', startTitle: 'Storage' }, { width: 800, height: 600 });
};

const handleClickHelpID = () => {
  popupStore.showPopup(PopupViewMessage, {
    title: 'ABOUT DELFRUIT ID',
    message: `Fangame's DELFRUIT ID can be found at the URL of the Delicious Fruit game details page, for example: "https://delicious-fruit.com/ratings/game_details.php?id=14681" The DELFRUIT ID of this game is 14681.`,
  });
};

const handleClickRefresh = () => {
  if (libraryStore.fetchFangameItemsStatus !== 'fetching') {
    libraryStore.fetchFangameItems(true);
  }
};

const downloadGame = async () => {
  invoke('add-download-item', {
    filename: props.context.filename,
    gameID: targetFangameId.value,
    gameName: targetFangameName.value,
    libraryPath: selectedLibraryPath.value,
    size: props.context.filesize,
    url: props.context.url,
  });
  emit('closePopup');
};

const handleClickInstall = () => {
  if (libraryStore.fangameItems.findIndex((i) => i.id === targetFangameId.value && i.installed) !== -1) {
    popupStore.showConfirm('The current fangame is already installed. If you continue, the existing fangame will be moved to the "backup" folder first. Are you sure you want to do this?', () => downloadGame());
  } else {
    downloadGame();
  }
};
</script>

<style scoped>
.bold {
  font-weight: bold;
}

.white {
  color: white;
}

.install-to-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  padding-bottom: 8px;
}

.settings-button {
  display: flex;
  justify-content: center;
  align-items: center;
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

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.refresh-button {
  width: 24px;
  height: 24px;
  padding: 4px;
  background-color: #3d4450;
  border-radius: 4px;
  transition: all 0.1s;
  color: #dfe3e6;

  &.enable {
    cursor: pointer;
  }

  &.enable:hover {
    background-color: #464d58;
    color: white;
  }
}

.rotate {
  animation: rotating 2s linear infinite;
}

.bottom {
  display: flex;
  justify-content: center;
  gap: 16px;
}
.bottom-button {
  width: 120px;
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

.warning-message {
  line-height: 32px;
  color: yellow;
}
.target-input-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 4px;
  padding-bottom: 8px;
}

.target-input-buttons {
  display: flex;
  gap: 8px;
}

.target-input {
  background-color: #222429;
  border: 0;
  color: #dfe3e6;
  padding: 8px;
  border-radius: 4px;

  &:focus {
    outline: none;

    &::-webkit-input-placeholder {
      color: #6f7074;
    }
  }
}

.target-result {
  color: #b8bcbf;
  &.valid {
    color: white;
  }
}
</style>

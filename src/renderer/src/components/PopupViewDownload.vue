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
        <HelpIcon class="settings-button" @click="handleClickHelpID" />
      </div>
      <div class="target-result" :class="{ valid: targetFangameValid }">
        {{ targetFangameValid ? targetFangameName : $t('NO RESULT') }}
      </div>
    </div>
    <div class="install-to-row">
      <div class="bold white">{{ $t('INSTALL TO: ') }}</div>
      <SettingsIcon class="settings-button" @click="handleClickSettings" />
    </div>
    <div v-if="configStore.cfg.libraryPaths.length === 0" class="warning-message">
      {{ $t('Library path not added! Please click the settings button in the upper right corner to add one.') }}
    </div>
    <div v-for="(path, index) in configStore.cfg.libraryPaths" :key="index" class="library-path-item" :class="{ selected: selectedLibraryPath === path }" @click="selectedLibraryPath = path">
      <DiskIcon class="library-path-item-icon" />
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
import { useConfigStore } from '@renderer/stores/configStore';
import { onMounted, ref } from 'vue';
import { invoke } from '@renderer/utils/invoke';
import { computed } from 'vue';
import { useAppStore } from '@renderer/stores/appStore';

export interface DownloadPopupContext {
  url: string;
  filename: string;
  filesize: number;
  possibleId: string;
}

const props = defineProps<{ context: DownloadPopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const appStore = useAppStore();
const configStore = useConfigStore();

const selectedLibraryPath = ref('');
const targetFangameId = ref(props.context.possibleId);

const targetFangameName = computed(() => {
  const item = appStore.fangameItems.find((i) => i.id === targetFangameId.value);
  return item ? item.name : '';
});

const targetFangameValid = computed(() => targetFangameName.value !== '');

onMounted(() => {
  if (configStore.cfg.libraryPaths.length > 0) {
    selectedLibraryPath.value = configStore.cfg.libraryPaths[0];
  }
});

const handleClickSettings = () => {
  emit('closePopup');
  invoke('create-window', { type: 'settings', name: 'settings', startTitle: 'Storage' }, { width: 800, height: 600 });
};

const handleClickHelpID = () => {
  appStore.showPopup(PopupViewMessage, {
    title: 'ABOUT DELFRUIT ID',
    message: `Fangame's DELFRUIT ID can be found at the URL of the Delicious Fruit game details page, for example: "https://delicious-fruit.com/ratings/game_details.php?id=14681" The DELFRUIT ID of this game is 14681.`
  });
};

const downloadGame = async () => {
  try {
    await appStore.addDownloadItem(props.context.url, props.context.filename, props.context.filesize, selectedLibraryPath.value, targetFangameId.value);
    emit('closePopup');
  } catch (err) {
    appStore.showError((err as Error).message);
  }
};

const handleClickInstall = () => {
  if (appStore.fangameItems.findIndex((i) => i.id === targetFangameId.value && i.isInstalled) !== -1) {
    appStore.showConfirm('The current fangame is already installed. If you continue, the existing fangame will be uninstalled first (save files may be lost !!!). Are you sure you want to do this?', () => downloadGame());
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

.bottom {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.bottom-button {
  width: 120px;
  margin-left: 16px;
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

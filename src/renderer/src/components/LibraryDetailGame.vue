<template>
  <div class="library-detail-game" @scroll="handleScroll">
    <div class="game-title">
      {{ item.name }}
    </div>
    <div class="content">
      <div class="header">
        <ButtonGradient v-if="!item.isInstalled" class="header-button" @click="handleClickInstall"> <InstallGameIcon />{{ $t('INSTALL') }}</ButtonGradient>
        <ButtonGradient v-if="item.isInstalled && !item.isRunning" color1="#4ade80" color2="#16a34a" class="header-button" @click="handleClickPlay"> <PlayIcon />{{ $t('PLAY') }}</ButtonGradient>
        <ButtonGradient v-if="item.isInstalled && item.isRunning" class="header-button" @click="handleClickStop"> <WindowCloseIcon />{{ $t('STOP') }}</ButtonGradient>
        <div class="header-item">
          <div class="header-item-title">{{ $t('LAST PLAYED') }}</div>
          <div class="header-item-content">
            {{ $d(new Date(), 'short') }}
          </div>
        </div>
        <div class="header-item">
          <div class="header-item-title">{{ $t('PLAY TIME') }}</div>
          <div class="header-item-content">{{ '0.0' + $t(' hours') }}</div>
        </div>
        <div v-if="item.isInstalled" class="header-toolbox">
          <DeleteIcon class="header-toolbox-button" @click="handleClickDelete" />
          <SettingsIcon class="header-toolbox-button" />
        </div>
      </div>
      <div class="nav">
        <div class="nav-button" @click="handleToDelFruit">{{ $t('DelFruit Page') }}</div>
        <div class="nav-button" :class="{ disabled: !hasDownloadLink }" @click="handleToDownload">{{ $t('Download Page') }}</div>
        <div v-if="item.isInstalled" class="nav-button" @click="handleToGameDirectory">{{ $t('Game Directory') }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { FangameItem, useAppStore } from '@renderer/stores/appStore';
import { ref } from 'vue';
import InstallGameIcon from '@renderer/icons/InstallGameIcon.vue';
import ButtonGradient from './ButtonGradient.vue';
import SettingsIcon from '@renderer/icons/SettingsIcon.vue';
import PopupViewInstallGame from './PopupViewInstallGame.vue';
import PlayIcon from '@renderer/icons/PlayIcon.vue';
import DeleteIcon from '@renderer/icons/DeleteIcon.vue';
import { library } from '@renderer/utils/library';
import { invoke } from '@renderer/utils/invoke';
import { useFetch } from '@renderer/hooks/useFetch';
import { DelFruitFangameDetail, delFruit } from '@renderer/utils/delFruit';
import { watch } from 'vue';
import { computed } from 'vue';
import { join } from 'path-browserify';
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';

const props = defineProps<{ item: FangameItem }>();

const [fetchDetails, details, fetchDetailsStatus, fetchDetailsError] = useFetch({} as DelFruitFangameDetail, () => {
  return delFruit.fetchFangameDetail(props.item.id);
});

watch(
  props,
  () => {
    fetchDetails();
  },
  { immediate: true }
);

const hasDownloadLink = computed(() => fetchDetailsStatus.value === 'ok' && details.value.downloadLink);

const appStore = useAppStore();
const backgroundY = ref(0);

const handleScroll = (e: any) => {
  backgroundY.value = -e.target.scrollTop / 3;
};

const handleToDelFruit = () => {
  appStore.toggleBrowserAndLoadURL('https://delicious-fruit.com/ratings/game_details.php?id=' + props.item.id);
};

const handleClickInstall = () => {
  appStore.showPopup(PopupViewInstallGame, { id: props.item.id, name: props.item.name });
};

const handleClickPlay = async () => {
  const manifest = await library.getManifest(props.item.libraryPath, props.item.id);
  const exePath = join(library.getGamePath(props.item.libraryPath, props.item.id), manifest.startupPath).replaceAll('/', '\\');

  invoke('run', props.item.id, '"' + exePath + '"');
};

const handleClickStop = () => {
  invoke('kill', props.item.id);
};

const handleClickDelete = () => {
  appStore.showConfirm('Are you sure you want to uninstall this fangame? This will delete all game files, possibly even SAVE files!', async () => {
    try {
      await library.uninstall(props.item.libraryPath, props.item.id);
    } catch (err) {
      appStore.showError((err as Error).message);
    }
    appStore.fetchFangameItems();
  });
};

const handleToDownload = () => {
  if (hasDownloadLink.value) {
    appStore.toggleBrowserAndLoadURL(details.value.downloadLink);
  }
};

const handleToGameDirectory = () => {
  invoke('exec', `explorer "${library.getGamePath(props.item.libraryPath, props.item.id).replaceAll('/', '\\')}"`);
};
</script>

<style scoped>
.library-detail-game {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-grow: 1;
  overflow-y: scroll;

  background: url('/game-detail.png');
  background-repeat: no-repeat;
  background-position-y: v-bind(backgroundY + 'px');

  &::-webkit-scrollbar {
    width: 10px;
    background: #1f2226;
  }

  &::-webkit-scrollbar-thumb {
    background: #606774;
    border-radius: 5px;
    background-clip: content-box;
    border: 2px solid transparent;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #7b8392;
    border-radius: 5px;
    background-clip: content-box;
    border: 2px solid transparent;
  }

  &::-webkit-scrollbar-thumb:active {
    background-clip: content-box;
    border: 1px solid transparent;
  }
}

.game-title {
  box-sizing: border-box;
  padding-bottom: 10px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  text-align: center;
  word-wrap: break-word;
  font-size: 40px;
  height: 220px;
  font-weight: 900;
  color: #353535;
  -webkit-text-stroke: white 1px;
  flex-shrink: 0;
}

.content {
  backdrop-filter: blur(8px) saturate(180%);
  background-color: rgba(0, 0, 0, 0.17);
  flex-grow: 1;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
}

.header-button {
  height: 20px !important;
  width: 100px !important;
}

.header {
  display: flex;
  align-items: center;
}

.header-item {
  display: flex;
  flex-direction: column;
  margin-left: 20px;
}

.header-item-title {
  color: #8c9696;
  font-size: 15px;
}

.header-item-content {
  color: #606a6b;
  font-size: 13px;
}

.header-toolbox {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.header-toolbox-button {
  display: flex;
  width: 32px;
  height: 32px;
  background-color: rgba(255, 255, 255, 0.05);
  margin-left: 10px;
  padding: 5px;
  box-sizing: border-box;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.1s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 1);
  }
}

.nav {
  display: flex;
  align-items: center;
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  height: 24px;
  padding: 8px;
}

.nav-button {
  margin-left: 20px;
  margin-right: 20px;
  transition:
    color 0.1s,
    background-color 0.25s;
  padding: 4px;
  cursor: pointer;
  font-size: 15px;

  &:not(.disabled):hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }

  &.disabled {
    color: gray;
    cursor: default;
    background-color: none;
  }
}
</style>

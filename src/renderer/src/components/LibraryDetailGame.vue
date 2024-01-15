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
        <div v-if="profile" class="header-item">
          <div class="header-item-title">{{ $t('LAST PLAYED') }}</div>
          <div class="header-item-content">
            {{ $d(profile.lastPlayed, 'short') }}
          </div>
        </div>
        <div v-if="profile" class="header-item">
          <div class="header-item-title">{{ $t('PLAY TIME') }}</div>
          <div class="header-item-content">
            {{ playTime + $t(profile.playTime >= 3600 ? ' hours' : ' minutes') }}
          </div>
        </div>
        <div v-if="item.isInstalled" class="header-toolbox">
          <div class="header-toolbox-button" @click="handleClickDelete">
            <DeleteIcon />
          </div>
          <div class="header-toolbox-button" @click="handleClickProperties">
            <SettingsIcon />
          </div>
        </div>
      </div>
      <div class="nav">
        <div class="nav-button" @click="handleToDelFruit">{{ $t('DelFruit Page') }}</div>
        <div class="nav-button" :class="{ disabled: !hasDownloadLink }" @click="handleToDownload">{{ $t('Download Page') }}</div>
        <div v-if="item.isInstalled" class="nav-button" @click="handleToGameDirectory">{{ $t('Game Directory') }}</div>
      </div>
      <div v-for="(rm, index) of readmeList" class="readme" :key="index">
        <div class="readme-title">
          {{ rm.name }}
        </div>
        <div class="readme-content" @click="handleClickReadme(rm.path)">
          {{ rm.content }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import InstallGameIcon from '@renderer/icons/InstallGameIcon.vue';
import ButtonGradient from './ButtonGradient.vue';
import SettingsIcon from '@renderer/icons/SettingsIcon.vue';
import PopupViewInstallGame from './PopupViewInstallGame.vue';
import PlayIcon from '@renderer/icons/PlayIcon.vue';
import DeleteIcon from '@renderer/icons/DeleteIcon.vue';
import { invoke } from '@renderer/utils/invoke';
import { watch } from 'vue';
import { computed } from 'vue';
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import { FangameItem, useLibraryStore } from '@renderer/stores/library';
import { useNavigateStore } from '@renderer/stores/navigate';
import { FangameReadme } from 'src/main/utils/library';
import { DelFruitFangameDetail, delFruit } from '@renderer/utils/delFruit';
import { usePopupStore } from '@renderer/stores/popup';

const navigateStore = useNavigateStore();
const popupStore = usePopupStore();
const libraryStore = useLibraryStore();

const props = defineProps<{ item: FangameItem }>();

const profile = computed(() => libraryStore.fangameProfiles[props.item.id]);
const playTime = computed(() => {
  if (!profile.value) return 0;
  const t = profile.value.playTime;
  return t < 3600 ? Math.ceil(t / 60) : (t / 3600.0).toFixed(1);
});

const readmeList = ref<FangameReadme[]>([]);

const fetchReadmes = async () => {
  readmeList.value = [];
  if (!props.item.isInstalled) return;
  readmeList.value = await invoke('get-game-readmes', { gameID: props.item.id, libraryPath: props.item.libraryPath });
};

const detail = ref<DelFruitFangameDetail>();
const fetchDetailStatus = ref<'pending' | 'fetching' | 'ok' | 'error'>('pending');
const fetchDetail = async () => {
  detail.value = undefined;
  try {
    fetchDetailStatus.value = 'fetching';
    detail.value = await delFruit.fetchFangameDetail(props.item.id);
  } catch {
    fetchDetailStatus.value = 'error';
  }
};

watch(
  props,
  () => {
    fetchReadmes();
    fetchDetail();
  },
  { immediate: true },
);

const hasDownloadLink = computed(() => detail.value && detail.value.downloadLink);

const backgroundY = ref(0);

const handleScroll = (e: any) => {
  backgroundY.value = -e.target.scrollTop / 3;
};

const handleToDelFruit = () => {
  navigateStore.toggleBrowserAndLoadURL('https://delicious-fruit.com/ratings/game_details.php?id=' + props.item.id);
};

const handleClickInstall = () => {
  popupStore.showPopup(PopupViewInstallGame, { id: props.item.id, name: props.item.name });
};

const handleClickPlay = async () => {
  await invoke('run-game', { gameID: props.item.id, libraryPath: props.item.libraryPath });
};

const handleClickStop = async () => {
  await invoke('stop-game', { gameID: props.item.id });
};

const handleClickDelete = () => {
  popupStore.showConfirm('Are you sure you want to uninstall this fangame? This will delete all game files, possibly even SAVE files!', async () => {
    await invoke('uninstall-game', { gameID: props.item.id, libraryPath: props.item.libraryPath });
  });
};

const showGameProperties = () => {
  invoke(
    'create-window',
    {
      type: 'gameprop',
      name: props.item.id,
      id: props.item.id,
      gameName: props.item.name,
      libraryPath: props.item.libraryPath,
    },
    { width: 800, height: 600 },
  );
};

const handleClickProperties = () => {
  showGameProperties();
};

const handleToDownload = () => {
  if (hasDownloadLink.value) {
    navigateStore.updateLastVisitedFangameId(props.item.id);
    navigateStore.toggleBrowserAndLoadURL(detail.value!.downloadLink);
  }
};

const handleToGameDirectory = () => {
  invoke('open-game-directory', { gameID: props.item.id, libraryPath: props.item.libraryPath });
};

const handleClickReadme = (path: string) => {
  invoke('notepad', path);
};
</script>

<style scoped>
.library-detail-game {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: hidden;

  background: url('/game-detail.png');
  background-repeat: repeat-y;
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
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.05);
  margin-left: 10px;
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
  margin-bottom: 20px;
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

.readme {
  background-color: #343940;
  border: 1px solid #1a9af5;
  margin-bottom: 10px;
  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
}

.readme-title {
  color: white;
  background: rgb(255, 149, 96);
  background: linear-gradient(90deg, rgba(255, 149, 96, 1) 0%, rgba(25, 157, 251, 1) 0%, rgba(28, 109, 170, 1) 5%, rgba(28, 84, 131, 1) 100%);
  padding: 4px;
  padding-left: 10px;
}

.readme-content {
  color: #8e9395;
  padding: 10px;
  text-shadow: 1px 1px 2px black;
  white-space: pre-line;
  cursor: pointer;
}
</style>

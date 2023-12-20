<template>
  <div class="library-detail-game" @scroll="handleScroll">
    <div class="game-title">
      {{ item.name }}
    </div>
    <div class="panel">
      <div class="panel-header-row">
        <ButtonGradient class="install-button"> <InstallGameIcon />{{ $t('INSTALL') }}</ButtonGradient>
        <div class="profile-col">
          <div class="label">{{ $t('LAST PLAYED') }}</div>
          <div class="content">
            {{ $d(new Date(), 'short') }}
          </div>
        </div>
        <div class="profile-col">
          <div class="label">{{ $t('PLAY TIME') }}</div>
          <div class="content">{{ '10.1' + $t(' hours') }}</div>
        </div>
        <div class="toolbox">
          <SettingsIcon class="button" />
        </div>
      </div>
      <div class="panel-link-row">
        <div class="link-button" @click="handleToDelFruit">{{ $t('DelFruit Page') }}</div>
        <div class="link-button">{{ $t('Download Page') }}</div>
        <div class="link-button">{{ $t('Game Directory') }}</div>
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

const props = defineProps<{ item: FangameItem }>();

const appStore = useAppStore();
const backgroundY = ref(0);

const handleScroll = (e: any) => {
  backgroundY.value = -e.target.scrollTop / 3;
};

const handleToDelFruit = () => {
  appStore.toggleBrowserAndLoadURL('https://delicious-fruit.com/ratings/game_details.php?id=' + props.item.id);
};
</script>

<style scoped>
.library-detail-game {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-grow: 1;
  overflow-y: scroll;

  background: url('src/images/game-detail.png');
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

.panel {
  backdrop-filter: blur(8px) saturate(180%);
  background-color: rgba(0, 0, 0, 0.17);
  flex-grow: 1;
  padding: 10px;
  padding-left: 20px;
  padding-right: 20px;
}

.install-button {
  height: 20px !important;
  width: 100px !important;
}

.panel-header-row {
  display: flex;
  align-items: center;
}

.profile-col {
  display: flex;
  flex-direction: column;
  margin-left: 20px;

  & .label {
    color: #8c9696;
    font-size: 15px;
  }

  & .content {
    color: #606a6b;
    font-size: 13px;
  }
}

.toolbox {
  display: flex;
  align-items: center;
  margin-left: auto;

  & .button {
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
}

.panel-link-row {
  display: flex;
  align-items: center;
  margin-top: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  height: 24px;
  padding: 8px;
}

.link-button {
  margin-left: 20px;
  margin-right: 20px;
  transition:
    color 0.1s,
    background-color 0.25s;
  padding: 4px;
  cursor: pointer;
  font-size: 15px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
}
</style>

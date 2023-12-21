<template>
  <div class="app-footer">
    <div class="button" @click="handleAddGame">
      <AddGameIcon class="button-image" />
      {{ $t('Add a Game') }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import AddGameIcon from '@renderer/icons/AddGameIcon.vue';
import { useAppStore } from '@renderer/stores/appStore';
import PopupViewInstallGame, { InstallPopupContext } from './PopupViewInstallGame.vue';

const appStore = useAppStore();

const handleAddGame = () => {
  appStore.showPopup(PopupViewInstallGame, { id: '114514', name: 'I Wanna Be The Beast' } as InstallPopupContext);
};
</script>

<style scoped>
.app-footer {
  display: flex;
  flex-shrink: 0;
  height: 48px;
  border-top: 1px solid #303641;
  align-items: center;
  box-sizing: border-box;
  padding: 10px;
}

.button {
  display: flex;
  align-items: center;
  font-size: small;
  color: #8b929a;
  transition: all 0.1s;

  &:hover {
    color: white;
    cursor: pointer;
  }
}

.button-image {
  width: 20px;
  margin-right: 8px;
}
</style>

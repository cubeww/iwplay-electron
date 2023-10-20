<template>
  <div class="app" :class="{ border: !appStore.isMaximize }">
    <AppMenuBar />
    <AppTabBar />
    <ViewBrowser />
    <ViewLibrary />
    <ViewUser />
    <AppFooter />
    <ContextMenu v-if="appStore.contextMenu" :options="appStore.contextMenu" :hide="appStore.hideContextMenu" />
  </div>
</template>

<script lang="ts" setup>
import AppMenuBar from './components/AppMenuBar.vue';
import AppTabBar from './components/AppTabBar.vue';
import ViewBrowser from './components/ViewBrowser.vue';
import ViewLibrary from './components/ViewLibrary.vue';
import ViewUser from './components/ViewUser.vue';
import AppFooter from './components/AppFooter.vue';
import ContextMenu from './components/ContextMenu.vue';
import { useAppStore } from './stores/appStore';
import { onMounted, onUnmounted } from 'vue';

const appStore = useAppStore()

let removeMessageListener: () => void

onMounted(() => {
  removeMessageListener = window.electron.ipcRenderer.on('message', (_, msg) => {
    if (msg.type === 'maximize') {
      appStore.isMaximize = true
    } else if (msg.type === 'unmaximize') {
      appStore.isMaximize = false
    }
  })
})

onUnmounted(() => {
  removeMessageListener()
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  position: absolute;
  background-color: #171d25;
  box-sizing: border-box;
  overflow: hidden;

  &.border {
    border: 1px solid #4c4e54;
  }
}
</style>
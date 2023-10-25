<template>
  <div class="app" :class="{ border: !appStore.isMaximize }">
    <AppMenuBar />
    <AppTabBar />
    <ViewBrowser />
    <ViewLibrary />
    <ViewUser />
    <AppFooter />
    <ContextMenu v-if="appStore.contextMenu"
      :options="appStore.contextMenu"
      :hide="appStore.hideContextMenu" />
    <PopupViewInstallGame />
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
import { onMounted } from 'vue';
import { libraryUtil } from './utils/libraryUtil';
import { api } from './utils/api';
import { join } from 'path-browserify';
import { stderr, stdout } from 'process';
import PopupViewInstallGame from './components/PopupViewInstallGame.vue';
const appStore = useAppStore()

onMounted(async () => {
  window.electron.ipcRenderer.on('maximize', (_evt, value) => {
    appStore.isMaximize = value
  })

  const lib = 'D:/IWPlayLibrary'

  // libraryUtil.install(lib, '11451419', "D:/Downloads/I Wanna Kill The Junko v1.00a.zip")
  // libraryUtil.createManifest(lib, '11451419')
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
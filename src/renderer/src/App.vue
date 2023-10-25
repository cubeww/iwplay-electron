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
const appStore = useAppStore()

onMounted(async () => {
  window.electron.ipcRenderer.on('maximize', (_evt, value) => {
    appStore.isMaximize = value
  })

  // const lib = 'D:/IWPlayLibrary'
  // await libraryUtil.createAllManifest(lib)
  const toUnzip = "D:/Downloads/I Wanna Remember The Memorial Games2 Ver1.1.zip"
  const dist = 'D:/dude'

  window.electron.ipcRenderer.on('zip', (_, error, stdout, stderr) => {
    console.log(error);
    console.log(stderr);
    console.log(stdout);
  })

  api.exec(`"resources/7z.exe" x "${toUnzip}" -o"${dist}"`, 'zip')

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
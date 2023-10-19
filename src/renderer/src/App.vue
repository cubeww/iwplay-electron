<template>
  <div class="app">
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
const appStore = useAppStore()
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  position: absolute;
  background-color: #171d25;
  border: 1px solid #4c4e54;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
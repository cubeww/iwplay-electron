<template>
  <div class="app">
    <AppMenuBar />
    <AppTabBar />
    <TabViewBrowser />
    <TabViewLibrary />
    <TabViewUser />
    <AppFooter />
    <PopupViewSlot />
    <ContextMenuSlot />
  </div>
</template>

<script lang="ts" setup>
import AppMenuBar from './components/AppMenuBar.vue';
import AppTabBar from './components/AppTabBar.vue';
import TabViewBrowser from './components/TabViewBrowser.vue';
import TabViewLibrary from './components/TabViewLibrary.vue';
import TabViewUser from './components/TabViewUser.vue';
import AppFooter from './components/AppFooter.vue';
import PopupViewSlot from './components/PopupViewSlot.vue';
import ContextMenuSlot from './components/ContextMenuSlot.vue';
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
}
</style>

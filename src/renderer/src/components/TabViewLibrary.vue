<template>
  <TabView name="library" class="view-library">
    <LibrarySidebar :style="{ width: sidebarWidth + 'px' }" />
    <div class="resize-slider" @mousedown="handleSliderMouseDown" />
    <LibraryDetailGame v-if="item" :item="item" />
    <LibraryDetailHome v-else />
  </TabView>
</template>

<script lang="ts" setup>
import TabView from './TabView.vue';
import LibrarySidebar from './LibrarySidebar.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import LibraryDetailGame from './LibraryDetailGame.vue';
import LibraryDetailHome from './LibraryDetailHome.vue';
import { useLibraryStore } from '@renderer/stores/library';
import { useNavigateStore } from '@renderer/stores/navigate';

const libraryStore = useLibraryStore();
const navigateStore = useNavigateStore();

const item = computed(() => (navigateStore.state.fangameItemID ? libraryStore.fangameItemsMap[navigateStore.state.fangameItemID] : undefined));

onMounted(() => {
  window.addEventListener('mouseup', handleWindowMouseUp);
  window.addEventListener('mousemove', handleWindowMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mouseup', handleWindowMouseUp);
  window.removeEventListener('mousemove', handleWindowMouseMove);
});

const resizing = ref(false);
const sidebarWidth = ref(100);

const handleSliderMouseDown = () => {
  resizing.value = true;
};

const handleWindowMouseUp = () => {
  resizing.value = false;
};

const handleWindowMouseMove = (e: MouseEvent) => {
  if (resizing.value) {
    sidebarWidth.value = e.pageX;
  }
};
</script>

<style scoped>
.view-library {
  display: flex;
  flex-direction: row;
  margin-top: 10px;
}

.resize-slider {
  width: 3px;
  background-color: #17191b;
  cursor: w-resize;
  flex-grow: 0;
  flex-shrink: 0;

  &:hover {
    background-color: #333741;
  }
}
</style>

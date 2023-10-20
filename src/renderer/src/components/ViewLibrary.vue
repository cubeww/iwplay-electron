<template>
  <TabView name="library" class="library">
    <LibrarySidebar :style="{ width: sidebarWidth + 'px' }" />
    <div class="resize-slider" @mousedown="handleSliderMouseDown" />
    <LibraryDetail />
  </TabView>
</template>

<script lang="ts" setup>
import TabView from './TabView.vue';
import LibrarySidebar from './LibrarySidebar.vue';
import LibraryDetail from './LibraryDetail.vue';
import { onMounted, onUnmounted, ref } from 'vue';

onMounted(() => {
  window.addEventListener('mouseup', handleWindowMouseUp)
  window.addEventListener('mousemove', handleWindowMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', handleWindowMouseUp)
  window.removeEventListener('mousemove', handleWindowMouseMove)
})

const resizing = ref(false)
const sidebarWidth = ref(100)

const handleSliderMouseDown = () => {
  resizing.value = true
}

const handleWindowMouseUp = () => {
  resizing.value = false
}

const handleWindowMouseMove = (e: MouseEvent) => {
  if (resizing.value) {
    sidebarWidth.value = e.pageX
  }
}
</script>

<style scoped>
.library {
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
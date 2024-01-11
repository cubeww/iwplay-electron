<template>
  <div class="app-footer">
    <div class="button" @click="handleAddGame">
      <AddGameIcon class="button-image" />
      {{ $t('Add a Game') }}
    </div>

    <div v-if="downloadingCount > 0" class="download">
      <div class="download-title">
        <div class="download-title-left">Downloading {{ downloadingCount }} item(s)</div>
        <div class="download-title-right">{{ downloadingProgress }}%</div>
      </div>
      <div class="download-progress">
        <div class="download-progress-blue" :style="{ width: downloadingProgress + '%' }"></div>
      </div>
    </div>

    <div class="friends">
      <!-- TODO -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import AddGameIcon from '@renderer/icons/AddGameIcon.vue';
import { useDownloadStore } from '@renderer/stores/download';
import { useNavigateStore } from '@renderer/stores/navigate';
import { computed } from 'vue';

const downloadStore = useDownloadStore();
const navigateStore = useNavigateStore();

const downloadingItems = computed(() => downloadStore.downloadItems.filter((i) => i.status === 'downloading'));
const downloadingCount = computed(() => downloadingItems.value.length);
const downloadingProgress = computed(() => {
  if (downloadingCount.value === 0) return 0;
  const cur = downloadingItems.value[0].received;
  const total = downloadingItems.value[0].size;
  return Math.round((cur / total) * 100.0);
});

const handleAddGame = () => {
  navigateStore.toggleTab('library');
};
</script>

<style scoped>
.app-footer {
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
  height: 48px;
  border-top: 1px solid #303641;
  align-items: center;
  box-sizing: border-box;
  padding: 10px;
  font-size: 12px;

  -webkit-app-region: drag;
}

.button {
  display: flex;
  align-items: center;
  color: #8b929a;
  transition: all 0.1s;

  &:hover {
    color: white;
    cursor: pointer;
  }

  -webkit-app-region: no-drag;
}

.button-image {
  width: 20px;
  margin-right: 8px;
}

.download {
  width: 300px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.download-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.download-progress {
  background-color: black;
  width: 100%;
  height: 3px;
  border-radius: 2px;
  overflow: hidden;
}

.download-progress-blue {
  height: 100%;
  background-color: #3badff;
}

.friends {
  width: 100px;
}
</style>

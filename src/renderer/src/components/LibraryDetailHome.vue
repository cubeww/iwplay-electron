<template>
  <div ref="itemsEl" class="library-detail-home">
    <div class="shadow"></div>
    <div class="list">
      <div class="list-header">
        <div class="list-title">
          {{ $t('Recent Games') }}
        </div>
        <div class="list-hr" />
        <LeftArrowIcon class="list-button left" :class="{ active: canPrevPage }" @click="handlePrevPage" />
        <LeftArrowIcon class="list-button right" :class="{ active: canNextPage }" @click="handleNextPage" />
      </div>
      <div class="list-items" :style="{ transform: `translateX(-${offsetX}px)` }">
        <div v-for="(item, i) in recentItems" :key="i" class="list-item">
          <div class="list-item-title">{{ item.date }}</div>
          <div class="list-item-content" @click="handleToItem(item)">{{ item.gameName }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import LeftArrowIcon from '@renderer/icons/LeftArrowIcon.vue';
import { useLibraryStore } from '@renderer/stores/library';
import { useNavigateStore } from '@renderer/stores/navigate';
import moment, { Moment } from 'moment';
import { onUnmounted, ref } from 'vue';
import { onMounted } from 'vue';
import { computed } from 'vue';

const libraryStore = useLibraryStore();
const navigateStore = useNavigateStore();

const itemsEl = ref<HTMLDivElement>();
const showCount = ref(5);
const startIndex = ref(0);

const offsetX = computed(() => {
  return startIndex.value * 150.0;
});

const canNextPage = computed(() => {
  return startIndex.value < recentItems.value.length - showCount.value;
});

const canPrevPage = computed(() => {
  return startIndex.value !== 0;
});

const handleNextPage = () => {
  startIndex.value += showCount.value;
  if (startIndex.value > recentItems.value.length - showCount.value) {
    startIndex.value = recentItems.value.length - showCount.value;
  }
};

const handlePrevPage = () => {
  startIndex.value -= showCount.value;
  if (startIndex.value < 0) {
    startIndex.value = 0;
  }
};

interface HomeGameItem {
  gameID: string;
  gameName: string;
  date: string;
  moment: Moment;
}

const handleWindowResize = () => {
  if (!itemsEl.value) return;
  showCount.value = Math.max(5, Math.ceil(itemsEl.value.clientWidth / 150.0));
};

onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
});

const handleToItem = (item: HomeGameItem) => {
  navigateStore.selectFangameItem(item.gameID);
};

const recentItems = computed(() => {
  const items: HomeGameItem[] = [];
  const todayMoment = moment();
  for (const gameID of Object.keys(libraryStore.fangameProfiles)) {
    const item = libraryStore.fangameItems.find((i) => i.id === gameID);
    if (!item) continue;

    const gameName = item.name;

    // Calculate date string
    const lastPlayedMoment = moment(libraryStore.fangameProfiles[gameID].lastPlayed);

    let date: string;
    const dayDiff = todayMoment.diff(lastPlayedMoment, 'day');
    const weekDiff = todayMoment.diff(lastPlayedMoment, 'week');

    if (dayDiff === 0) {
      date = 'Today';
    } else if (weekDiff === 0) {
      date = 'This Week';
    } else if (weekDiff === 1) {
      date = '1 week ago';
    } else if (weekDiff <= 4) {
      date = `${weekDiff} weeks ago`;
    } else {
      date = lastPlayedMoment.format('MMMM YYYY');
    }
    items.push({ date, gameID, gameName, moment: lastPlayedMoment });
  }

  // Sort by date
  items.sort((a, b) => b.moment.unix() - a.moment.unix());

  // Remove repeat date string
  for (let i = 1, j = 0; i < items.length; i++) {
    if (items[i].date === items[j].date) {
      items[i].date = '';
    } else {
      j = i;
    }
  }

  return items;
});
</script>

<style scoped>
.library-detail-home {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-grow: 1;
  overflow-y: scroll;
  overflow-x: hidden;
  background-color: #282d35;
  padding: 20px;

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

.shadow {
  position: absolute;
  top: 0;
  right: 0;
  width: 20px;
  height: 100%;
  background: linear-gradient(to left, #1f2226, rgba(255, 255, 255, 0));
  z-index: 100;
}

.list-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.list-hr {
  height: 2px;
  background-color: #31363c;
  flex-grow: 1;
  margin-right: 10px;
}

.list-title {
  color: #cccccc;
  margin-right: 20px;
}

.list-button {
  margin-right: 16px;
  color: #51555b;

  &.right {
    transform: scaleX(-1);
  }

  &.active {
    color: #d4d5d6;
    cursor: pointer;
    &:hover {
      color: #fff;
    }
  }
}

.list-items {
  display: flex;
  transition: all 0.5s;
}

.list-item {
  margin-right: 20px;
}

.list-item-title {
  height: 16px;
  color: #6a6d72;
  font-size: small;
  margin-bottom: 10px;
}

.list-item-content {
  width: 130px;
  height: 180px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  background:
    linear-gradient(to bottom, rgba(122, 133, 144, 0.5) 0%, rgba(19, 35, 51, 0.66) 80%),
    radial-gradient(at top center, rgba(255, 255, 255, 0.8) 0%, rgba(0, 0, 0, 0.4) 80%) #989898;
  background-blend-mode: multiply, multiply;

  transition: all 0.5s;

  color: white;
  box-sizing: border-box;
  padding: 20px;
  text-align: center;
  text-shadow: 1px 1px 1px black;
  font-size: 15px;

  &:hover {
    transform: scale(1.04);
    box-shadow: rgba(0, 0, 0, 0.35) 0px 10px 15px;
  }
}

.list-item-content::before {
  content: '';
  position: absolute;
  top: -110%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to left, rgba(212, 212, 212, 0.2) 90%, rgba(255, 255, 255, 0));
  transform: skew(60deg);
  transition: all 0.5s;
}

.list-item-content:hover::before {
  top: -85%;
}
</style>

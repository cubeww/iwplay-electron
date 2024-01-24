<template>
  <div class="library-sidebar">
    <div class="header">
      <button class="header-home-button" :class="{ active: isInHome }" @click="handleToHome">
        <div class="home-button-bg"></div>
        {{ $t('HOME') }}
      </button>
      <button class="header-refresh-button" :class="{ enable: libraryStore.fetchFangameItemsStatus !== 'fetching' }" @click="libraryStore.fetchFangameItems(true)">
        <RefreshIcon :class="{ rotate: libraryStore.fetchFangameItemsStatus === 'fetching' }" />
      </button>
    </div>
    <div class="search">
      <div class="search-icon" @click="searchInputEl?.focus">
        <SearchIcon />
      </div>
      <input ref="searchInputEl" v-model="searchText" class="search-input" :placeholder="$t('Search by Name')" type="text" />
      <button class="search-filter-button" :class="{ show: showFilter, has: hasFilter }" @click="showFilter = !showFilter">
        <FilterIcon />
      </button>
      <div class="filter" :class="{ show: showFilter }">
        <div class="filter-occluder"></div>
        <div class="filter-content">
          <div class="filter-title">{{ $t('STATE') }}</div>
          <CheckBox v-model="filters.installed" class="filter-check-box" :value="false" :label="$t('Installed')" />
          <CheckBox v-model="filters.running" class="filter-check-box" :value="false" :label="$t('Running')" />
          <template v-if="libraryStore.delFruitSynced">
            <div class="filter-title">{{ $t('DELFRUIT') }}</div>
            <CheckBox v-model="filters.favorite" class="filter-check-box" :value="false" :label="$t('Favorite')" />
            <CheckBox v-model="filters.uncleared" class="filter-check-box" :value="false" :label="$t('Uncleared')" />
            <CheckBox v-model="filters.cleared" class="filter-check-box" :value="false" :label="$t('Cleared')" />
            <CheckBox v-model="filters.bookmark" class="filter-check-box" :value="false" :label="$t('Bookmark')" />
          </template>
        </div>
      </div>
    </div>
    <div v-show="libraryStore.fetchFangameItemsStatus === 'ok'" class="fangame-list-with-scroll" @scroll="handleScroll">
      <div class="fangame-list-with-height" :style="{ height: filteredItems.length * itemHeight + 'px' }">
        <div v-for="(item, index) in displayItems" :key="index" class="fangame-list-item" :class="{ select: navigateStore.state.fangameItemID === item.id, installed: item.installed, running: item.running }" :style="{ transform: `translateY(${translateY}px)` }" @click="navigateStore.selectFangameItem(item.id)">
          {{ item.name }}
          <template v-if="item.running">
            <div style="color: #a9a9a9">&nbsp;-&nbsp;</div>
            <div style="color: #7cb927">Running</div>
          </template>
        </div>
      </div>
    </div>
    <div v-show="libraryStore.fetchFangameItemsStatus === 'error'" class="fangame-list-error">
      {{ libraryStore.fetchFangameItemsError }}
      <ButtonPure @click="libraryStore.fetchFangameItems(true)">{{ $t('Retry') }}</ButtonPure>
    </div>
  </div>
</template>

<script lang="ts" setup>
import RefreshIcon from '@renderer/icons/RefreshIcon.vue';
import SearchIcon from '@renderer/icons/SearchIcon.vue';
import FilterIcon from '@renderer/icons/FilterIcon.vue';
import ButtonPure from './ButtonPure.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import CheckBox from './CheckBox.vue';
import { useLibraryStore } from '@renderer/stores/library';
import { useNavigateStore } from '@renderer/stores/navigate';
import { watchEffect } from 'vue';

const libraryStore = useLibraryStore();
const navigateStore = useNavigateStore();

const itemHeight = 25; // px

const searchInputEl = ref<HTMLInputElement>();
const searchText = ref('');

const displayCount = ref(36);
const scrollTop = ref(0);

const showFilter = ref(false);

const filters = ref({
  // STATE
  installed: false,
  running: false,
  // DELFRUIT
  favorite: false,
  uncleared: false,
  cleared: false,
  bookmark: false,
});

watchEffect(() => {
  if (!libraryStore.delFruitSynced) {
    filters.value.cleared = false;
    filters.value.uncleared = false;
    filters.value.bookmark = false;
    filters.value.favorite = false;
  }
});

const hasFilter = computed(() => {
  for (const i of Object.values(filters.value)) {
    if (i) {
      return true;
    }
  }
  return false;
});

onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
  handleWindowResize();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize);
});

const handleWindowResize = () => {
  displayCount.value = (window.innerHeight / itemHeight) | 0;
};

const startIndex = computed(() => {
  return (scrollTop.value / itemHeight) | 0;
});

const searchItems = computed(() => {
  if (searchText.value === '') {
    return libraryStore.fangameItems;
  } else {
    return libraryStore.fangameItems.filter((i) => i.name.toLowerCase().includes(searchText.value.toLowerCase()));
  }
});

const filteredItems = computed(() => {
  return searchItems.value.filter((i) => {
    if (filters.value.installed && !i.installed) return false;
    if (filters.value.running && !i.running) return false;
    if (filters.value.cleared && !i.cleared) return false;
    if (filters.value.uncleared && i.cleared) return false;
    if (filters.value.favorite && !i.favorite) return false;
    if (filters.value.bookmark && !i.bookmark) return false;

    return true;
  });
});

const displayItems = computed(() => {
  return filteredItems.value.slice(startIndex.value, startIndex.value + displayCount.value);
});

const translateY = computed(() => {
  return startIndex.value * itemHeight;
});

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLDivElement).scrollTop;
};

const handleToHome = () => {
  navigateStore.selectFangameItem(undefined);
};

const isInHome = computed(() => !navigateStore.state.fangameItemID);
</script>

<style scoped>
.library-sidebar {
  display: flex;
  flex-direction: column;
  background-color: #252930;
  min-width: 260px;
  max-width: 50%;
  flex-grow: 0;
  flex-shrink: 0;
}

.header {
  display: flex;
  height: 40px;
  background-color: #1f1f21;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
}

.header-home-button {
  position: relative;
  margin: 3px;
  margin-left: 6px;
  margin-right: 3px;
  border: 0;
  background-color: #25272d;
  color: #8f8f8f;
  border-radius: 2px;
  flex-grow: 1;
  text-align: left;
  padding-left: 10px;
  align-items: center;
  cursor: pointer;
  transition: all 0.1s;

  &:hover,
  &.active {
    background-color: #3e4047;
    color: white;
  }
}

.home-button-bg {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url('/player-fall.png');
  background-repeat: no-repeat;
  background-position: 130px -34px;
  opacity: 0.1;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

.header-refresh-button {
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4c4d50;
  margin: 3px;
  margin-left: 0px;
  margin-right: 6px;
  border: 0;
  background-color: #25272d;
  border-radius: 2px;
  flex-shrink: 0;
  width: 36px;
  text-align: left;
  cursor: pointer;
  transition: all 0.1s;

  &.enable:hover {
    color: white;
    background-color: #3e4047;
  }
}

.rotate {
  animation: rotating 2s linear infinite;
}

.search {
  position: relative;
  height: 36px;
  display: flex;
  align-items: center;
  margin: 6px;
  background-color: #222429;
  border-radius: 2px;
}

.search-input {
  align-self: stretch;
  flex-grow: 1;
  background-color: transparent;
  border: 0;
  color: #dfe3e6;

  &::-webkit-input-placeholder {
    color: transparent;
    transition: all 0.2s;
  }

  &:hover {
    &::-webkit-input-placeholder {
      color: #434549;
    }
  }

  &:focus {
    outline: none;

    &::-webkit-input-placeholder {
      color: #6f7074;
    }
  }
}

.search-icon {
  width: 36px;
  display: flex;
  align-self: stretch;
  align-items: center;
  justify-content: center;
  color: #808080;
  cursor: text;
}

.search-filter-button {
  display: flex;
  justify-items: center;
  align-items: center;
  background-color: transparent;
  border: 0;
  border-radius: 2px;
  color: #808080;
  width: 36px;
  align-self: stretch;
  transition: all 0.1s;
  cursor: pointer;

  &:hover {
    background-color: #3e4047;
  }

  &.show {
    background-color: #3e4047;
  }

  &.has {
    color: #26b7ff;
  }
}

.fangame-list-with-scroll {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  overflow-y: scroll;
  flex-grow: 1;
  flex-basis: 0;

  &::-webkit-scrollbar {
    width: 10px;
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

  &:not(:hover) {
    &::-webkit-scrollbar-thumb {
      background: transparent;
    }
  }
}

.fangame-list-with-height {
  flex-shrink: 0;
}

.fangame-list-item {
  padding-left: 48px;
  color: #9097a4;
  cursor: pointer;
  flex-shrink: 0;
  height: 25px;
  display: flex;
  align-items: center;
  font-size: small;

  overflow: hidden;
  white-space: nowrap;

  &:hover {
    background-color: #323a4b;
  }

  &.select {
    background-color: #3e4e69;
  }

  &.installed {
    color: white;
  }

  &.running {
    color: #aafa31;
  }
}

.fangame-list-error {
  display: flex;
  padding-top: 50%;
  align-items: center;
  flex-grow: 1;
  flex-direction: column;
}

.filter {
  position: absolute;
  left: calc(100% + 6px);
  top: calc(100% - 36px);
  z-index: 100;
  width: 200px;
  background-color: #4c515a;
  box-sizing: border-box;

  transition: all 0.2s;
  transform: scale(0);
  transform-origin: 0 0;

  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;

  box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;

  &.show {
    transform: scale(1);
  }
}

.filter-occluder {
  position: absolute;
  left: -8px;
  background-color: #4c515a;
  width: 8px;
  height: 36px;
}

.filter-content {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  color: #d3d6d7;
}

.filter-title {
  color: #26b7ff;
  font-weight: bold;
  margin-bottom: 8px;
}

.filter-check-box {
  margin-bottom: 8px;
}
</style>

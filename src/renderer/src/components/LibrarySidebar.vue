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
          <div class="filter-col">
            <div class="filter-title">{{ $t('STATE') }}</div>
            <CheckBox v-model="filters.installed" :value="false" :label="$t('Installed')" />
            <CheckBox v-model="filters.running" :value="false" :label="$t('Running')" />
            <template v-if="libraryStore.delFruitSynced">
              <div class="filter-title">{{ $t('PROFILE') }}</div>
              <CheckBox v-model="filters.favorite" :value="false" :label="$t('Favorite')" />
              <CheckBox v-model="filters.uncleared" :value="false" :label="$t('Uncleared')" />
              <CheckBox v-model="filters.cleared" :value="false" :label="$t('Cleared')" />
              <CheckBox v-model="filters.bookmark" :value="false" :label="$t('Bookmark')" />
            </template>
          </div>
          <div class="filter-col">
            <div class="filter-tag-title">
              <div class="filter-title">{{ $t('TAG') }}</div>
              <Tooltip :text="$t('Refresh Tagged Fangames (Slow!)')">
                <div class="filter-tag-refresh" :class="{ enable: libraryStore.fetchTaggedFangameIDSetsStatus !== 'fetching' }" @click="handleRefreshTag">
                  <RefreshIcon :class="{ rotate: libraryStore.fetchTaggedFangameIDSetsStatus === 'fetching' }"></RefreshIcon>
                </div>
              </Tooltip>
            </div>
            <div v-for="(tag, i) in Object.keys(filters.tags)" :key="i" class="filter-tag-row">
              <CheckBox v-model="filters.tags[tag]" :disabled="libraryStore.fetchTaggedFangameIDSetsStatus !== 'ok'" :value="false" :label="tag" />
              <div v-if="libraryStore.fetchTaggedFangameIDSetsStatus === 'ok'" class="filter-remove-tag-button">
                <WindowCloseIcon class="filter-remove-icon" @click="handleRemoveTag(tag)"></WindowCloseIcon>
              </div>
            </div>
            <input :disabled="libraryStore.fetchTaggedFangameIDSetsStatus !== 'ok'" class="filter-add-tag-input" type="text" placeholder="Add Tag (Enter)" @keydown="handleAddTag" />
          </div>
        </div>
      </div>
    </div>
    <div v-show="libraryStore.fetchFangameItemsStatus === 'ok'" class="fangame-list-with-scroll" @scroll="handleScroll">
      <div class="fangame-list-with-height" :style="{ height: filteredItems.length * itemHeight + 'px' }">
        <div v-for="(item, index) in displayItems" :key="index" class="fangame-list-item" :class="{ select: navigateStore.state.fangameItemID === item.id, installed: item.installed, running: item.running, cleared: item.cleared }" :style="{ transform: `translateY(${translateY}px)` }" @click="navigateStore.selectFangameItem(item.id)">
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
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

import CheckBox from './CheckBox.vue';
import Tooltip from './Tooltip.vue';
import { useLibraryStore } from '@renderer/stores/library';
import { useNavigateStore } from '@renderer/stores/navigate';
import { watchEffect } from 'vue';
import { watch } from 'vue';

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
  // PROFILE
  favorite: false,
  uncleared: false,
  cleared: false,
  bookmark: false,
  // TAG
  tags: {} as { [tagName: string]: boolean },
});

watch(
  () => libraryStore.taggedFangameIDSets,
  (newList) => {
    // Add missing tags in store
    for (const tag of Object.keys(newList)) {
      if (!(tag in filters.value.tags)) {
        filters.value.tags[tag] = false;
      }
    }
    // Remove redundant tags in filter
    for (const tag of Object.keys(filters.value.tags)) {
      if (!(tag in newList)) {
        delete filters.value.tags[tag];
      }
    }
  },
  { immediate: true, deep: true },
);

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

    // Tag filter
    for (const [tagName, enable] of Object.entries(filters.value.tags)) {
      if (enable && !libraryStore.taggedFangameIDSets[tagName].has(i.id)) return false;
    }

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

const handleAddTag = (ev: KeyboardEvent) => {
  if (ev.key === 'Enter') {
    const tagName = (ev.target as HTMLInputElement).value.trim().replaceAll(' ', '+');
    if (!(tagName in libraryStore.taggedFangameIDSets)) {
      (ev.target as HTMLInputElement).value = '';
      (ev.target as HTMLInputElement).blur();
      libraryStore.addTagSet(tagName);
    }
  }
};

const handleRemoveTag = (tagName: string) => {
  libraryStore.removeTagSet(tagName);
};

const handleRefreshTag = () => {
  if (libraryStore.fetchTaggedFangameIDSetsStatus !== 'fetching') {
    libraryStore.fetchTaggedFangameIDSets(true);
  }
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
  padding: 4px;
  gap: 4px;
  height: 32px;
  background-color: #171d25;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.3);
}

.header-home-button {
  position: relative;
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
  border: 0;
  background-color: #25272d;
  border-radius: 2px;
  flex-shrink: 0;
  width: 32px;
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
  height: 32px;
  display: flex;
  align-items: center;
  margin: 4px;
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
  width: 32px;
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
  width: 32px;
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

  &.cleared {
    color: #f2e47b;
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
  top: calc(100% - 32px);
  z-index: 100;
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
  height: 32px;
}

.filter-content {
  display: flex;
  gap: 32px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 16px;
  color: #d3d6d7;
}

.filter-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-title {
  color: #26b7ff;
  font-weight: bold;
}

.filter-tag-title {
  display: flex;
  justify-content: space-between;
}

.filter-tag-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.filter-remove-tag-button {
  display: flex;
  flex-direction: row-reverse;
  flex-grow: 1;
  opacity: 0;
  &:hover {
    opacity: 1;
  }
}

.filter-remove-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.filter-add-tag-input {
  width: 128px;
  height: 16px;
  padding: 8px;
  margin-left: 16px;
  background-color: #393d43;
  border: 0;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
  color: #d3d6d7;

  &:hover {
    background-color: #1e1f23;
  }

  &:focus {
    outline: none;
    background-color: #ffffff;
    color: #0e141b;
  }
}

.filter-tag-refresh {
  width: 20px;
  height: 20px;
  display: flex;
  &.enable {
    cursor: pointer;
  }
  &:hover {
    color: white;
  }
}
</style>

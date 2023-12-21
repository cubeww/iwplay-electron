<template>
  <div class="library-sidebar">
    <div class="header">
      <button class="header-home-button" :class="{ active: isInHome }" @click="handleToHome">{{ $t('HOME') }}</button>
      <button class="header-refresh-button" :class="{ enable: fetchStatus !== 'fetching' }" @click="fetchItems(true)">
        <RefreshIcon :class="{ rotate: fetchStatus === 'fetching' }" />
      </button>
    </div>
    <div class="search">
      <div class="search-icon" @click="searchInputEl.focus">
        <SearchIcon />
      </div>
      <input class="search-input" v-model="searchText" ref="searchInputEl" :placeholder="$t('Search by Name')" type="text" />
      <button class="search-filter-button">
        <FilterIcon />
      </button>
    </div>
    <div class="fangame-list-with-scroll" v-show="fetchStatus === 'ok'" @scroll="handleScroll">
      <div class="fangame-list-with-height" :style="{ height: searchItems.length * itemHeight + 'px' }">
        <div v-for="item in displayItems" class="fangame-list-item" :class="{ select: appStore.present.fangameItem === item }" :style="{ transform: `translateY(${translateY}px)` }" @click="appStore.selectFangameItem(item)">
          {{ item.name }}
        </div>
      </div>
    </div>
    <div class="fangame-list-error" v-show="fetchStatus === 'error'">
      {{ appStore.fetchFangameItemsError }}
      <ButtonPure @click="fetchItems(true)">{{ $t('Retry') }}</ButtonPure>
    </div>
  </div>
</template>

<script lang="ts" setup>
import RefreshIcon from '@renderer/icons/RefreshIcon.vue';
import SearchIcon from '@renderer/icons/SearchIcon.vue';
import FilterIcon from '@renderer/icons/FilterIcon.vue';
import ButtonPure from './ButtonPure.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAppStore } from '@renderer/stores/appStore';

const itemHeight = 25; // px

const searchInputEl = ref<HTMLInputElement>(undefined!);
const searchText = ref('');

const displayCount = ref(36);
const scrollTop = ref(0);

const appStore = useAppStore();

const fetchStatus = computed(() => appStore.fetchFangameItemsStatus);
const fetchItems = appStore.fetchFangameItems;

onMounted(() => {
  window.addEventListener('resize', handleWindowResize);
  handleWindowResize();

  fetchItems(false);
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
    return appStore.fangameItems;
  } else {
    return appStore.fangameItems.filter((i) => i.name.toLowerCase().includes(searchText.value.toLowerCase()));
  }
});

const displayItems = computed(() => {
  return searchItems.value.slice(startIndex.value, startIndex.value + displayCount.value);
});

const translateY = computed(() => {
  return startIndex.value * itemHeight;
});

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLDivElement).scrollTop;
};

const handleToHome = () => {
  appStore.selectFangameItem(undefined);
};

const isInHome = computed(() => !appStore.present.fangameItem);
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
}

.fangame-list-error {
  display: flex;
  padding-top: 50%;
  align-items: center;
  flex-grow: 1;
  flex-direction: column;
}
</style>

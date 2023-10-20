<template>
  <div class="library-sidebar">
    <div class="header">
      <button class="home-button">
        主页
      </button>
      <button class="refresh-button">
        <RefreshIcon />
      </button>
    </div>
    <div class="search-box">
      <div class="search-icon" @click="searchInputEl.focus">
        <SearchIcon />
      </div>
      <input class="search-input" v-model="searchText" ref="searchInputEl" placeholder="按名称搜索" type="text">
      <button class="search-filter-button">
        <FilterIcon />
      </button>
    </div>
    <div class="fangame-list" @scroll="handleScroll">
      <div class="fangame-items-wrapper" :style="{ height: items.length * itemHeight + 'px' }">
        <div class="fangame-item" :style="{
          transform: `translateY(${translateY}px)`
        }" v-for="item in displayItems">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import RefreshIcon from '@renderer/icons/RefreshIcon.vue';
import SearchIcon from '@renderer/icons/SearchIcon.vue';
import FilterIcon from '@renderer/icons/FilterIcon.vue';
import { computed, onMounted, onUnmounted, ref } from 'vue';

const itemHeight = 25 // px

const searchInputEl = ref<HTMLInputElement>(undefined!)
const searchText = ref('')

const items = ref<{ name: string }[]>([])
const displayCount = ref(36)
const scrollTop = ref(0)

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
  handleWindowResize()

  const ls: any = []
  for (let i = 0; i < 10000; i++) {
    ls.push({ name: 'I wanna be the  ' + i })
  }
  items.value = ls
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})

const handleWindowResize = () => {
  displayCount.value = (window.innerHeight / itemHeight) | 0
}

const startIndex = computed(() => {
  return (scrollTop.value / itemHeight) | 0
})

const searchItems = computed(() => {
  if (searchText.value === '') {
    return items.value
  } else {
    return items.value.filter(i => i.name.toLowerCase().includes(searchText.value.toLowerCase()))
  }
})

const displayItems = computed(() => {
  return searchItems.value.slice(startIndex.value, startIndex.value + displayCount.value)
})

const translateY = computed(() => {
  return startIndex.value * itemHeight
})

const handleScroll = (e: Event) => {
  scrollTop.value = (e.target as HTMLDivElement).scrollTop
}

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

.home-button {
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

  &:hover {
    background-color: #3e4047;
    color: white;
  }
}

.refresh-button {
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

  &:hover {
    color: white;
    background-color: #3e4047;
  }
}

.search-box {
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

.fangame-list {
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

.fangame-items-wrapper {
  flex-shrink: 0;
}

.fangame-item {
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
}
</style>
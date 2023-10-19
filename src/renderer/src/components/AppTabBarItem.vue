<template>
  <div class="tab-bar-item" :class="{ selected }" @click="appStore.toggleTab(to)">
    <slot />
    <div class="underline" :class="{ selected }" />
  </div>
</template>

<script lang="ts" setup>
import { TabName, useAppStore } from '@renderer/stores/appStore';
import { computed } from 'vue';

const props = defineProps<{ to: TabName }>()

const appStore = useAppStore()
const selected = computed(() => props.to === appStore.present.tab)

</script>

<style scoped>
.tab-bar-item {
  position: relative;
  font-size: large;
  margin-left: 10px;
  margin-right: 10px;
  transition: all 0.1s;
  cursor: pointer;

  &.selected {
    color: #419bfe;
  }

  &:not(.selected) {
    color: #dbddde;

    &:hover {
      color: #fff;
    }
  }
}

.underline {
  position: absolute;
  width: 0;
  height: 3px;
  border-radius: 1.5px;
  background-color: #1a9fff;
  transition: all 0.1s;
  left: 50%;
  transform: translateX(-50%);

  &.selected {
    width: 100%;
  }
}
</style>
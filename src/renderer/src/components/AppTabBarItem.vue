<template>
  <div ref="tabBarItemEl" class="app-tab-bar-item" :class="{ selected }" @click="handleClick" @mouseenter="handleMouseEnter">
    <slot />
    <div class="underline" :class="{ selected }" />
    <div class="placeholder"></div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { ContextMenuItemData } from './ContextMenu.vue';
import { TabName, useNavigateStore } from '@renderer/stores/navigate';
import { useContextMenuStore } from '@renderer/stores/contextMenu';

const props = defineProps<{ to: TabName; items?: ContextMenuItemData[] }>();

const navigateStore = useNavigateStore();
const selected = computed(() => props.to === navigateStore.state.tab);

const contextMenuStore = useContextMenuStore();

const tabBarItemEl = ref<HTMLDivElement>();

const handleClick = () => {
  navigateStore.toggleTab(props.to);
};

const handleMouseEnter = () => {
  if (!tabBarItemEl.value) return;
  if (!props.items) return;
  const rect = tabBarItemEl.value.getBoundingClientRect();
  contextMenuStore.showContextMenu({ x: rect.left, y: rect.bottom + 8, items: props.items, triggerEl: tabBarItemEl.value, outsideAutoClose: true });
};
</script>

<style scoped>
.app-tab-bar-item {
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

.placeholder {
  position: absolute;
  width: 100%;
  height: 10px;
}
</style>

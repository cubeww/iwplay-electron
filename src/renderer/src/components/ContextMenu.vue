<template>
  <div class="context-menu" ref="contextMenuEl">
    <ContextMenuContent :x="options.x" :y="options.y" :items="options.items" :hide="hide" />
  </div>
</template>

<script lang="ts" setup>
import ContextMenuContent from './ContextMenuContent.vue';
import { onMounted, onUnmounted, ref } from 'vue';

export interface ContextMenuOptions {
  x: number;
  y: number;
  items: ContextMenuItemData[];
  triggerEl: HTMLElement;
  outsideAutoClose?: boolean;
}

export type ContextMenuItemData = ContextMenuItemText | ContextMenuItemSeparator | ContextMenuItemSubMenu;

export interface ContextMenuItemText {
  type: 'text';
  text: string;
  onClick: () => void;
}

export interface ContextMenuItemSeparator {
  type: 'separator';
}

export interface ContextMenuItemSubMenu {
  type: 'submenu';
  text: string;
  submenu: ContextMenuItemData[];
}

const props = defineProps<{
  options: ContextMenuOptions;
  hide: () => void;
}>();

const contextMenuEl = ref<HTMLDivElement>(undefined!);

onMounted(() => {
  window.addEventListener('mousedown', handleWindowClick);
  window.addEventListener('mousemove', handleWindowMouseMove);
});

onUnmounted(() => {
  window.removeEventListener('mousedown', handleWindowClick);
  window.removeEventListener('mousemove', handleWindowMouseMove);
});

const handleWindowClick = (e: MouseEvent) => {
  // When clicking outside the context menu, hide the menu.
  const el = e.target as HTMLDivElement;
  if (props.options.triggerEl.contains(el)) return;
  if (contextMenuEl.value.contains(el)) return;
  props.hide();
};

const handleWindowMouseMove = (e: MouseEvent) => {
  // (Optional) Hide the menu when the mouse is moved out of it.
  if (!props.options.outsideAutoClose) return;
  const el = e.target as HTMLDivElement;
  if (props.options.triggerEl.contains(el)) return;
  if (contextMenuEl.value.contains(el)) return;
  props.hide();
};
</script>

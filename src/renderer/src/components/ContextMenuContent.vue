<template>
  <div class="context-menu-content" :style="{ left: x + 'px', top: y + 'px' }">
    <div v-for="(item, index) in items" :key="index">
      <div v-if="item.type === 'text'" class="item-text" @mouseenter="handleEnterOthers" @click="handleClickText(item.onClick)">{{ $t(item.text) }}</div>
      <hr v-if="item.type === 'separator'" class="item-separator" @mouseenter="handleEnterOthers" />
      <div v-if="item.type === 'submenu'" class="item-submenu" @mouseenter="handleEnterSubMenu">
        {{ $t(item.text) }}
        <MenuRightIcon class="item-submenu-right" />
        <ContextMenuContent v-if="enterSubMenu" :x="subMenuX" :y="subMenuY" :items="item.submenu" :hide="hide" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

import MenuRightIcon from '@renderer/icons/MenuRightIcon.vue';
import { ContextMenuItemData } from './ContextMenu.vue';

const props = defineProps<{ x: number; y: number; hide: () => void; items: ContextMenuItemData[] }>();

const enterSubMenu = ref(false);
const subMenuX = ref(0);
const subMenuY = ref(0);

const handleClickText = (onClick: () => void) => {
  onClick();
  props.hide();
};

const handleEnterOthers = () => {
  enterSubMenu.value = false;
};

const handleEnterSubMenu = (e: MouseEvent) => {
  enterSubMenu.value = true;

  const rect = (e.target as HTMLDivElement).getBoundingClientRect();
  subMenuX.value = rect.right;
  subMenuY.value = rect.top;
};
</script>

<style scoped>
.context-menu-content {
  position: fixed;
  background-color: #3d4450;
  z-index: 100;
  font-size: small;
}

.item-text,
.item-submenu {
  position: relative;
  display: flex;
  align-items: center;
  color: #dcdedf;
  padding: 8px 20px;
  cursor: pointer;

  &:hover {
    background-color: #dcdedf;
    color: #3d4450;
  }
}

.item-separator {
  border: 0;
  border-top: 1px solid #67707b;
  margin: 0;
}

.item-submenu-right {
  position: absolute;
  right: 0;
}
</style>

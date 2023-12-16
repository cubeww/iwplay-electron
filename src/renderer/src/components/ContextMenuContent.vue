<template>
  <div class="context-menu-content" :style="{ left: x + 'px', top: y + 'px' }">
    <template v-for="item in items">
      <div class="item-text" v-if="item.type === 'text'" @mouseenter="handleEnterOthers" @click="handleClickText(item.onClick)">{{ item.text }}</div>
      <hr class="item-separator" v-if="item.type === 'separator'" @mouseenter="handleEnterOthers" />
      <div class="item-submenu" v-if="item.type === 'submenu'" @mouseenter="handleEnterSubMenu">
        {{ item.text }}
        <MenuRightIcon class="item-submenu-right" />
        <ContextMenuContent :x="subMenuX" :y="subMenuY" :items="item.submenu" :hide="hide" v-if="enterSubMenu" />
      </div>
    </template>
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

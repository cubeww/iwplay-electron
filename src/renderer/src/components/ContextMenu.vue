<template>
  <div class="context-menu" ref="contextMenuEl" :style="{ left: x + 'px', top: y + 'px' }">
    <template v-for="item in items">
      <div class="item-text" v-if="item.type === 'text'" @mouseenter="handleEnterOthers" @click="handleClickText(item.onClick)">{{ item.text }}</div>
      <hr class="item-separator" v-if="item.type === 'separator'" @mouseenter="handleEnterOthers">
      <div class="item-submenu" v-if="item.type === 'submenu'" @mouseenter="handleEnterSubmenu">
        {{ item.text }}
        <MenuRightIcon class="item-submenu-right" />
        <ContextMenu :is-submenu="true" :x="submenuX" :y="submenuY" :items="item.submenu" v-if="enterSubmenu" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ContextMenuItemData, useAppStore } from '@renderer/stores/appStore';
import { onMounted, onUnmounted, ref } from 'vue';
import MenuRightIcon from '@renderer/icons/MenuRightIcon.vue'

const props = defineProps<{ items: ContextMenuItemData[], x: number, y: number, isSubmenu?: boolean }>()

const appStore = useAppStore()
const enterSubmenu = ref(false)
const contextMenuEl = ref<HTMLDivElement>(undefined!)

const submenuX = ref(0)
const submenuY = ref(0)

onMounted(() => {
  window.addEventListener('mousedown', handleWindowClick)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleWindowClick)
})

const handleWindowClick = (e: MouseEvent) => {
  const el = e.target as HTMLDivElement
  if (!props.isSubmenu && el.className !== 'menu-bar-item' && !contextMenuEl.value.contains(el)) {
    appStore.hideContextMenu()
  }
}

const handleClickText = (onClick: () => void) => {
  onClick()
  appStore.hideContextMenu()
}

const handleEnterOthers = () => {
  enterSubmenu.value = false
}

const handleEnterSubmenu = (e: MouseEvent) => {
  enterSubmenu.value = true

  const rect = (e.target as HTMLDivElement).getBoundingClientRect()
  submenuX.value = rect.right
  submenuY.value = rect.top
}

</script>

<style scoped>
.context-menu {
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
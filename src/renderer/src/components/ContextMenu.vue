<template>
  <div class="context-menu" ref="contextMenuEl" :style="{ left: x + 'px', top: y + 'px' }">
    <template v-for="item in items">
      <div class="item-text" v-if="item.type === 'text'" @mouseenter="handleEnterOthers" @click="handleClickText(item.onClick)">{{ item.text }}</div>
      <hr class="item-separator" v-if="item.type === 'separator'" @mouseenter="handleEnterOthers">
      <div class="item-submenu" v-if="item.type === 'submenu'" @mouseenter="handleEnterSubmenu">
        {{ item.text }}
        <MenuRightIcon class="item-submenu-right" />
        <ContextMenu :is-submenu="true" :x="submenuX" :y="submenuY" :items="item.submenu" :hide="hide" v-if="enterSubmenu" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ContextMenuItemData } from '@renderer/stores/appStore';
import { onMounted, onUnmounted, ref } from 'vue';
import MenuRightIcon from '@renderer/icons/MenuRightIcon.vue'

const props = defineProps<{
  isSubmenu?: boolean
  x?: number,
  y?: number,
  items?: ContextMenuItemData[],
  triggerEl?: HTMLElement,
  outsideAutoClose?: boolean,
  hide: () => void,
}>()

const enterSubmenu = ref(false)
const contextMenuEl = ref<HTMLDivElement>(undefined!)

const submenuX = ref(0)
const submenuY = ref(0)

onMounted(() => {
  if (!props.isSubmenu) {
    window.addEventListener('mousedown', handleWindowClick)
    window.addEventListener('mousemove', handleWindowMouseMove)
  }
})

onUnmounted(() => {
  if (!props.isSubmenu) {
    window.removeEventListener('mousedown', handleWindowClick)
    window.removeEventListener('mousemove', handleWindowMouseMove)
  }
})

const handleWindowClick = (e: MouseEvent) => {
  const el = e.target as HTMLDivElement

  if (props.triggerEl!.contains(el))
    return

  if (contextMenuEl.value.contains(el))
    return

  props.hide()
}

const handleClickText = (onClick: () => void) => {
  onClick()
  props.hide()
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

const handleWindowMouseMove = (e: MouseEvent) => {
  if (!props.outsideAutoClose)
    return

  const el = e.target as HTMLDivElement

  if (props.triggerEl!.contains(el))
    return

  if (contextMenuEl.value.contains(el))
    return

  props.hide()
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
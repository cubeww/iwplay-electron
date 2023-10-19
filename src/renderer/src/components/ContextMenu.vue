<template>
  <div class="context-menu" ref="contextMenuEl">
    <ContextMenuContent :x="options.x" :y="options.y" :items="options.items" :hide="hide" />
  </div>
</template>

<script lang="ts" setup>
import ContextMenuContent from './ContextMenuContent.vue';

import { ContextMenuOptions } from '@renderer/stores/appStore';
import { onMounted, onUnmounted, ref } from 'vue';

const props = defineProps<{
  options: ContextMenuOptions,
  hide: () => void,
}>()

const contextMenuEl = ref<HTMLDivElement>(undefined!)

onMounted(() => {
  window.addEventListener('mousedown', handleWindowClick)
  window.addEventListener('mousemove', handleWindowMouseMove)
})

onUnmounted(() => {
  window.removeEventListener('mousedown', handleWindowClick)
  window.removeEventListener('mousemove', handleWindowMouseMove)
})

const handleWindowClick = (e: MouseEvent) => {
  // 点击菜单外面时 隐藏菜单
  const el = e.target as HTMLDivElement

  if (props.options.triggerEl.contains(el))
    return

  if (contextMenuEl.value.contains(el))
    return

  props.hide()
}

const handleWindowMouseMove = (e: MouseEvent) => {
  // （可选）移出菜单时 隐藏菜单
  if (!props.options.outsideAutoClose)
    return

  const el = e.target as HTMLDivElement

  if (props.options.triggerEl.contains(el))
    return

  if (contextMenuEl.value.contains(el))
    return

  props.hide()
}

</script>
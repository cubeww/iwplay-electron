<template>
  <ContextMenu v-if="contextMenuStore.contextMenu" :options="contextMenuStore.contextMenu" :hide="contextMenuStore.hideContextMenu" />
</template>

<script lang="ts" setup>
import ContextMenu from './ContextMenu.vue';
import { useContextMenuStore } from '@renderer/stores/contextMenu';

const contextMenuStore = useContextMenuStore();
</script>

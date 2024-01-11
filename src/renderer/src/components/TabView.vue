<template>
  <div v-show="show" class="tab-view">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { TabName, useNavigateStore } from '@renderer/stores/navigate';
import { computed } from 'vue';

const navigateStore = useNavigateStore();
const props = defineProps<{ name: TabName }>();

const show = computed(() => navigateStore.state.tab === props.name);
</script>

<style scoped>
.tab-view {
  flex-grow: 1;
  flex-direction: column;
  display: flex;
  min-height: 0;
}
</style>

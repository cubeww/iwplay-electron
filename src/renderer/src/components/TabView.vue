<template>
  <div class="tab-view" v-show="show">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { TabName, useAppStore } from '@renderer/stores/appStore';
import { computed } from 'vue';

const appStore = useAppStore()
const props = defineProps<{ name: TabName }>()

const show = computed(() => appStore.present.tab === props.name)
</script>

<style scoped>
.tab-view {
  flex-grow: 1;
  flex-direction: column;
  display: flex;
}
</style>
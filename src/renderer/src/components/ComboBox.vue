<template>
  <div class="combo">
    <div class="combo-button" @click="showList = !showList">
      {{ value }}
      <ArrowVIcon class="icon" />
    </div>

    <div class="combo-list" ref="comboListEl" v-show="showList">
      <div class="combo-list-item" @click="handleClickItem(item)" v-for="item in list">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArrowVIcon from '@renderer/icons/ArrowVIcon.vue';
import { onMounted, onUnmounted, ref } from 'vue';

defineProps<{ list: string[]; value: string }>();
const emit = defineEmits<{ update: [value: string] }>();

const showList = ref(false);
const comboListEl = ref<HTMLDivElement>(undefined!);

onMounted(() => {
  window.addEventListener('mousedown', handleMouseDown);
});

onUnmounted(() => {
  window.removeEventListener('mousedown', handleMouseDown);
});

const handleMouseDown = (e: MouseEvent) => {
  if (!comboListEl.value.contains(e.target as HTMLDivElement)) {
    showList.value = false;
  }
};

const handleClickItem = (item: string) => {
  emit('update', item);
  showList.value = false;
};
</script>

<style scoped>
.combo {
  position: relative;
  color: #dbdfe2;
}

.combo-button {
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: #292e36;
  border-radius: 4px;
  padding-left: 16px;
  padding-right: 10px;
  padding-top: 8px;
  padding-bottom: 8px;
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    background-color: #464d58;
  }
}

.combo .icon {
  transform: rotate(180deg);
  color: #189cff;
  margin-left: 4px;
}

.combo-list {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background-color: #373c44;
  min-width: 100px;
  padding: 10px;
}

.combo-list-item {
  height: 40px;
  line-height: 40px;
  padding-left: 10px;
  cursor: pointer;

  &:hover {
    background-color: #3e444d;
  }
}
</style>

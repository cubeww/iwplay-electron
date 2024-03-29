<template>
  <div class="combo-box">
    <div class="button" @click="showList = !showList">
      <div class="button-text">{{ modelValue }}</div>
      <ArrowVIcon class="button-arrow" />
    </div>

    <div v-show="showList" ref="comboListEl" class="combo-list">
      <div v-for="(item, i) in list" :key="i" class="combo-list-item" @click="selectItem(item, i)">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ArrowVIcon from '@renderer/icons/ArrowVIcon.vue';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const props = defineProps<{ list: string[]; modelValue: string | undefined; index?: number; watchItemAdd?: boolean; watchItemRemove?: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: string | undefined]; 'update:index': [index: number] }>();

const showList = ref(false);
const comboListEl = ref<HTMLDivElement>();

watch(
  () => props.list,
  (newList, oldList) => {
    // List item added
    if (props.watchItemAdd && newList.length > oldList.length) {
      selectItem(newList[newList.length - 1], newList.length - 1);
    }

    // List item removed
    if (props.watchItemRemove && props.modelValue !== undefined && newList.indexOf(props.modelValue) === -1) {
      if (newList.length === 0) {
        selectItem(undefined, -1);
      } else {
        selectItem(newList[0], 0);
      }
    }
  },
);

onMounted(() => {
  window.addEventListener('mousedown', handleMouseDown);

  if (props.modelValue === undefined && props.list.length > 0) {
    selectItem(props.list[0], 0);
  }
});

onUnmounted(() => {
  window.removeEventListener('mousedown', handleMouseDown);
});

const handleMouseDown = (e: MouseEvent) => {
  if (!comboListEl.value) return;
  if (!comboListEl.value.contains(e.target as HTMLDivElement)) {
    showList.value = false;
  }
};

const selectItem = (item: string | undefined, index: number) => {
  emit('update:modelValue', item);
  if (props.index !== undefined) {
    emit('update:index', index);
  }
  showList.value = false;
};
</script>

<style scoped>
.combo-box {
  position: relative;
  color: #dbdfe2;
}

.button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

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

.button-text {
  word-break: break-all;
  overflow: hidden;
}

.button-arrow {
  transform: rotate(180deg);
  color: #189cff;
  flex-shrink: 0;
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
  line-height: 32px;
  padding-left: 10px;
  cursor: pointer;

  &:hover {
    background-color: #3e444d;
  }
}
</style>

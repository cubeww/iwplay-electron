<template>
  <div class="switch-button" :class="{ active: modelValue }" @click="emit('update:modelValue', !modelValue)">
    <div class="circle" :class="{ active: modelValue }"></div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<style scoped>
.switch-button {
  width: 40px;
  height: 24px;
  border-radius: 12px;
  background-color: #3a3f45;
  cursor: pointer;
  transition: all 0.1s;

  &.active {
    background-color: #1a9fff;
  }
}
.circle {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: #fff;
  transition: all 0.1s;

  &.active {
    transform: translateX(16px);
  }
}
</style>

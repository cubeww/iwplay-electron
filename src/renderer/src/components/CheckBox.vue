<template>
  <label class="check-box">
    <input class="builtin-input" type="checkbox" v-model="model" :value="value" />
    <div class="input">
      <CheckIcon class="check-icon" :class="{ show: modelValue }" />
    </div>
    <span>{{ label }}</span>
  </label>
</template>

<script lang="ts" setup>
import { computed, defineEmits } from 'vue';
import CheckIcon from '@renderer/icons/CheckIcon.vue';
const props = defineProps<{
  modelValue: boolean;
  value: boolean;
  label: string;
}>();
const emit = defineEmits(['update:modelValue']);
const model = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    emit('update:modelValue', value);
  }
});
</script>

<style scoped>
.check-box {
  display: flex;
  align-items: center;
  color: #d3d6d7;
  cursor: pointer;
  font-weight: 300;
}
.builtin-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.input {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: #383b42;
  margin-right: 8px;
  box-shadow:
    rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
    rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
    rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #1c97ff;
  opacity: 0;
  transition: all 0.2s;

  &.show {
    opacity: 1;
  }
}
</style>

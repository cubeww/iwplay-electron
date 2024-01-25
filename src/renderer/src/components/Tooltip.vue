<template>
  <div class="tooltip" @mouseover="handleMouseOver" @mouseout="handleMouseOut">
    <slot></slot>
    <div class="tooltip-box" :class="{ show }">
      {{ text }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

withDefaults(defineProps<{ text: string; x?: number }>(), { x: 0 });

const show = ref(false);

let timeout: NodeJS.Timeout;

const handleMouseOver = () => {
  timeout = setTimeout(() => {
    show.value = true;
  }, 500);
};

const handleMouseOut = () => {
  clearTimeout(timeout);
  show.value = false;
};
</script>

<style scoped>
.tooltip {
  position: relative;
}

.tooltip-box {
  position: absolute;
  top: calc(100% + 10px);
  left: v-bind(x + 'px');
  pointer-events: none;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
  background-color: #696773;
  color: #d6d7dd;
  opacity: 0;
  transition: all 0.3s;
  border-radius: 4px;
  padding: 8px;
  font-size: small;
  &.show {
    opacity: 1;
  }
}
</style>

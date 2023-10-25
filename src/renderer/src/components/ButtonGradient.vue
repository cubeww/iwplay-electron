<template>
  <div class="gradient-button">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

withDefaults(defineProps<{ color1?: string, color2?: string }>(),
  { color1: '#47bfff', color2: '#235dcf' })

</script>

<style scoped>
.gradient-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: fit-content;
  font-weight: lighter;
  color: #dfe3e6;
  padding: 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s;
  background: linear-gradient(to right, v-bind(color1), v-bind(color2));
  background-size: 150% 100%;
  background-position: 100%;

  &:hover {
    background-position: 0;
  }
}
</style>
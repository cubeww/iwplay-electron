<template>
  <div class="popup-background" />
  <div class="popup-wrapper">
    <div class="close-button" @click="emit('closePopup')">
      <WindowCloseIcon />
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
withDefaults(defineProps<{ width?: number; color1?: string; color2?: string }>(), { width: 600, color1: '#00ccff', color2: '#3366ff' });
const emit = defineEmits<{ closePopup: [] }>();
</script>

<style scoped>
.popup-background {
  position: fixed;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
}

.popup-wrapper {
  display: flex;
  flex-direction: column;

  color: #b8bcbf;

  min-width: v-bind(width + 'px');
  min-height: 0;

  box-sizing: border-box;
  padding: 24px;

  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  border-top: 2px solid transparent;
  border-image: linear-gradient(to right, v-bind(color1), v-bind(color2));
  border-image-slice: 1;

  background: linear-gradient(to right bottom, #343941, #25282e);

  line-height: 32px;
}

.close-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 0;
  color: #788a92;
  position: absolute;
  right: 8px;
  top: 8px;
  cursor: pointer;

  &:hover {
    color: white;
  }
}
</style>

<template>
  <div class="popup-background" />
  <div class="popup-wrapper">
    <WindowCloseIcon class="close-button" />
    <slot />
  </div>
</template>

<script lang="ts" setup>
import WindowCloseIcon from '@renderer/icons/WindowCloseIcon.vue';
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

  min-width: 600px;
  min-height: 400px;

  box-sizing: border-box;
  padding: 24px;

  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  border-top: 2px solid transparent;
  border-image: linear-gradient(to right, #00ccff, #3366ff);
  border-image-slice: 1;

  background: linear-gradient(to right bottom, #343941, #25282e);
}

.close-button {
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
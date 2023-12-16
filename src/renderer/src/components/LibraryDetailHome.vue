<template>
  <div class="library-detail-home"></div>
</template>

<script lang="ts" setup></script>

<style scoped>
.library-detail-home {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex-grow: 1;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    width: 10px;
    background: #1f2226;
  }

  &::-webkit-scrollbar-thumb {
    background: #606774;
    border-radius: 5px;
    background-clip: content-box;
    border: 2px solid transparent;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #7b8392;
    border-radius: 5px;
    background-clip: content-box;
    border: 2px solid transparent;
  }

  &::-webkit-scrollbar-thumb:active {
    background-clip: content-box;
    border: 1px solid transparent;
  }
}
</style>

<template>
  <div class="footer">
    <div class="footer-button">
      <AddGameIcon class="footer-button-image" />
      添加游戏
    </div>
  </div>
</template>

<script lang="ts" setup>

import AddGameIcon from '@renderer/icons/AddGameIcon.vue'

</script>

<style scoped>
.footer {
  display: flex;
  flex-shrink: 0;
  height: 48px;
  border-top: 1px solid #303641;
  align-items: center;
  box-sizing: border-box;
  padding: 10px;
}

.footer-button {
  display: flex;
  align-items: center;
  font-size: small;
  color: #8b929a;
  transition: all 0.1s;

  &:hover {
    color: white;
    cursor: pointer;
  }
}

.footer-button-image {
  width: 20px;
  margin-right: 8px;
}
</style>
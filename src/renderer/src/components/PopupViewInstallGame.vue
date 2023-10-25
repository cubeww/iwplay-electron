<template>
  <PopupView>
    <PopupTitle>安装</PopupTitle>
    <PopupSeparator />
    <div>I Wanna Kill The Kamilia 3 (ID: 123456)</div>
    <PopupSeparator />
    <ButtonGradient style="width: 120px;" color1="#4ade80" color2="#15803d">选择压缩包</ButtonGradient>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import PopupSeparator from './PopupSeparator.vue';
import ButtonGradient from './ButtonGradient.vue';
</script>

<style scoped>
.title {
  font-size: x-large;
  color: white;
  font-weight: bold;
}
</style>
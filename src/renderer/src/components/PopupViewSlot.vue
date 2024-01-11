<template>
  <Component :is="popup.component" v-for="(popup, index) in popupStore.popups" :key="index" :context="popup.context" @close-popup="popupStore.closePopup(popup.context)" />
</template>

<script lang="ts" setup>
import { usePopupStore } from '@renderer/stores/popup';

const popupStore = usePopupStore();
</script>

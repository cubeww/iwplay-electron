<template>
  <PopupView :width="450" color1="#ff0000" color2="#b90000" @close-popup="handleOK">
    <PopupTitle>{{ $t('Error') }}</PopupTitle>
    <div class="error-message">{{ $t(context.message) }}</div>
    <ButtonPure class="ok-button" @click="handleOK">{{ $t('OK') }}</ButtonPure>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import ButtonPure from './ButtonPure.vue';

export interface ErrorPopupContext {
  message: string;
  ok?: () => void;
}

const props = defineProps<{ context: ErrorPopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const handleOK = () => {
  if (props.context.ok) {
    props.context.ok();
  }
  emit('closePopup');
};
</script>

<style scoped>
.error-message {
  user-select: text;
}

.ok-button {
  margin: 0 auto;
  width: 64px;
}
</style>

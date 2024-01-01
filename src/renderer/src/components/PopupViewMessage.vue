<template>
  <PopupView :width="450" @close-popup="handleOk">
    <PopupTitle>{{ $t(context.title) }}</PopupTitle>
    <div class="message">{{ $t(context.message) }}</div>
    <div class="buttons">
      <ButtonPure class="button" @click="handleOk">{{ $t('OK') }}</ButtonPure>
    </div>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import ButtonPure from './ButtonPure.vue';

export interface MessagePopupContext {
  message: string;
  title: string;
  ok?: () => void;
}

const props = defineProps<{ context: MessagePopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const handleOk = () => {
  if (props.context.ok) {
    props.context.ok();
  }
  emit('closePopup');
};
</script>

<style scoped>
.message {
  margin-bottom: 20px;
}

.button {
  width: 64px;
  margin-right: 10px;
}

.buttons {
  display: flex;
  justify-content: center;
}
</style>

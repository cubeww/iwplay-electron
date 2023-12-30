<template>
  <PopupView :width="450" @close-popup="handleNo">
    <PopupTitle>{{ $t('Confirm') }}</PopupTitle>
    <div class="confirm-message">{{ $t(context.message) }}</div>
    <div class="buttons">
      <ButtonPure class="button" @click="handleYes">{{ $t('YES') }}</ButtonPure>
      <ButtonPure class="button" @click="handleNo">{{ $t('NO') }}</ButtonPure>
    </div>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import ButtonPure from './ButtonPure.vue';

export interface ConfirmPopupContext {
  message: string;
  yes?: () => void;
  no?: () => void;
}

const props = defineProps<{ context: ConfirmPopupContext }>();
const emit = defineEmits<{ closePopup: [] }>();

const handleYes = () => {
  if (props.context.yes) {
    props.context.yes();
  }
  emit('closePopup');
};

const handleNo = () => {
  if (props.context.no) {
    props.context.no();
  }
  emit('closePopup');
};
</script>

<style scoped>
.confirm-message {
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

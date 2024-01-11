import { shallowRef } from 'vue';
import { ref } from 'vue';

import PopupViewError from '@renderer/components/PopupViewError.vue';
import PopupViewConfirm from '@renderer/components/PopupViewConfirm.vue';
import { defineStore } from 'pinia';

interface PopupInstance {
  component: any;
  context: any;
}

export const usePopupStore = defineStore('popup', () => {
  const popups = ref<PopupInstance[]>([]);

  const showPopup = (component: any, context?: any) => {
    popups.value.push({ component: shallowRef(component), context });
  };

  const closePopup = (context: any) => {
    const index = popups.value.findIndex((p) => p.context === context);
    if (index !== -1) {
      popups.value.splice(index, 1);
    }
  };

  const showError = (message: string, ok?: () => void) => {
    showPopup(PopupViewError, { message, ok });
  };

  const showConfirm = (message: string, yes?: () => void, no?: () => void) => {
    showPopup(PopupViewConfirm, { message, yes, no });
  };

  return { popups, showPopup, closePopup, showError, showConfirm };
});

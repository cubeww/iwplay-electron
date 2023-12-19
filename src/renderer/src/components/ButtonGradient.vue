<template>
  <ButtonBase class="button-gradient" :enabled="enabled" @click="emit('click')">
    <slot />
  </ButtonBase>
</template>

<script lang="ts" setup>
import ButtonBase from './ButtonBase.vue';

withDefaults(
  defineProps<{
    enabled?: boolean;
    color1?: string;
    color2?: string;
  }>(),
  {
    enabled: true,
    color1: '#3a9bed',
    color2: '#235dcf'
  }
);

const emit = defineEmits<{ click: [] }>();
</script>

<style scoped>
.button-gradient {
  background: linear-gradient(to right, v-bind(color1), v-bind(color2));
  background-size: 150% 100%;
  background-position: 100%;

  &:hover {
    background-position: 0;
  }
}
</style>

<template>
  <ButtonBase class="button-gradient" :enabled="enabled" :onClick="onClick">
    <slot />
  </ButtonBase>
</template>

<script lang="ts" setup>
import ButtonBase from './ButtonBase.vue';

withDefaults(
  defineProps<{
    onClick?: () => void;
    enabled?: boolean;
    color1?: string;
    color2?: string;
  }>(),
  {
    onClick: undefined,
    enabled: true,
    color1: '#3a9bed',
    color2: '#235dcf'
  }
);
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

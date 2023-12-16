<template>
  <ButtonBase class="button-pure" :enabled="enabled" :onClick="onClick">
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
    color1: '#3d4450',
    color2: '#464d58'
  }
);
</script>

<style scoped>
.button-pure {
  background-color: v-bind(color1);

  &:hover {
    background-color: v-bind(color2);
  }
}
</style>

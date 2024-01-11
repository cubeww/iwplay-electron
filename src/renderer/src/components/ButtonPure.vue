<template>
  <ButtonBase class="button-pure" :enabled="enabled" @click="emit('click')">
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
    color1: '#3d4450',
    color2: '#464d58',
  },
);

const emit = defineEmits<{ click: [] }>();
</script>

<style scoped>
.button-pure {
  background-color: v-bind(color1);

  &:hover {
    background-color: v-bind(color2);
  }
}
</style>

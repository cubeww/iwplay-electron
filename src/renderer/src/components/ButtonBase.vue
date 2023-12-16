<template>
  <div class="button-base" :class="{ enabled }" @click="handleClick">
    <slot />
  </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    onClick?: () => void;
    enabled?: boolean;
  }>(),
  {
    onClick: undefined,
    enabled: true
  }
);

const handleClick = () => {
  if (props.enabled && props.onClick) {
    props.onClick();
  }
};
</script>

<style scoped>
.button-base {
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
  height: fit-content;
  font-weight: lighter;
  color: #dfe3e6;
  padding: 8px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.3s;
  line-height: normal;

  &:not(.enabled) {
    border: 1px solid #424850;
    background: transparent;
    cursor: auto;
  }
}
</style>

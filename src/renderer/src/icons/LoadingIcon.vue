<template>
  <div class="loading-icon">
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
    <div></div>
  </div>
</template>

<script lang="ts" setup>

defineProps<{ size: number }>()

</script>

<style scoped>
@keyframes lds-spinner {
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.loading-icon {
  color: official;
  display: inline-block;
  position: relative;
  width: v-bind(size + 'px');
  height: v-bind(size + 'px');
  margin-left: 8px;
  margin-right: 8px;

  & div {
    transform-origin: v-bind(size / 2 + 'px') v-bind(size / 2 + 'px');
    animation: lds-spinner 0.8s linear infinite;

    &:after {
      content: ' ';
      display: block;
      position: absolute;
      top: v-bind(size * 0.0375 + 'px');
      left: v-bind(size * 0.4625 + 'px');
      width: v-bind(size * 0.075 + 'px');
      height: v-bind(size * 0.225 + 'px');
      border-radius: 20%;
      background: #aeb2b6;
    }
  }

  :nth-child(1) {
    transform: rotate(0deg);
    animation-delay: -0.7s;
  }

  :nth-child(2) {
    transform: rotate(45deg);
    animation-delay: -0.6s;
  }

  :nth-child(3) {
    transform: rotate(90deg);
    animation-delay: -0.5s;
  }

  :nth-child(4) {
    transform: rotate(135deg);
    animation-delay: -0.4s;
  }

  :nth-child(5) {
    transform: rotate(180deg);
    animation-delay: -0.3s;
  }

  :nth-child(6) {
    transform: rotate(225deg);
    animation-delay: -0.2s;
  }

  :nth-child(7) {
    transform: rotate(270deg);
    animation-delay: -0.1s;
  }

  :nth-child(8) {
    transform: rotate(315deg);
    animation-delay: -0s;
  }


}
</style>
<template>
  <PopupView :close="close">
    <PopupTitle>安装</PopupTitle>
    <PopupSeparator />
    <div>{{ context.name }} (ID: {{ context.id }})</div>
    <PopupSeparator />
    <ButtonGradient style="width: 120px" :onClick="handleSelectZip" color1="#4ade80" color2="#16a34a">选择压缩包</ButtonGradient>
    <template v-if="filename">
      <div><b>文件名：</b>{{ filename }}</div>
      <div><b>文件大小：</b>{{ filesizeStr }}</div>
    </template>
    <template v-else>
      <div><b>未选择游戏压缩包文件</b></div>
    </template>
    <PopupSeparator />
    <div v-if="installStatus === 'installing'" style="display: flex"><LoadingIcon :size="32" />安装中...</div>
    <div class="bottom">
      <ButtonGradient class="bottom-button" :enabled="filename !== '' && installStatus !== 'installing'" :onClick="handleInstall">安装</ButtonGradient>
      <ButtonPure class="bottom-button" :onClick="close">取消</ButtonPure>
    </div>
  </PopupView>
</template>

<script lang="ts" setup>
import PopupView from './PopupView.vue';
import PopupTitle from './PopupTitle.vue';
import PopupSeparator from './PopupSeparator.vue';
import ButtonGradient from './ButtonGradient.vue';
import ButtonPure from './ButtonPure.vue';
import LoadingIcon from '@renderer/icons/LoadingIcon.vue';
import { invoke } from '@renderer/utils/invoke';
import { computed, ref } from 'vue';

export interface InstallPopupContext {
  id: string;
  name: string;
}

defineProps<{ close: () => void; context: InstallPopupContext }>();

const filename = ref('');
const filesize = ref(0);

const installStatus = ref<'pending' | 'installing' | 'error'>('pending');

const handleSelectZip = async () => {
  const f = await invoke('open-file-dialog', 'main', {
    title: '选择游戏压缩包',
    filters: [
      { name: 'Compress Files', extensions: ['zip', 'rar', '7z'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (typeof f === 'object' && typeof f[0] === 'string') {
    filename.value = f[0];
    filesize.value = await invoke('file-size', filename.value);
  }
};

const handleInstall = () => {
  installStatus.value = 'installing';
};

const filesizeStr = computed(() => (filesize.value / 1048576.0).toFixed(2) + ' MB');
</script>

<style scoped>
.title {
  font-size: x-large;
  color: white;
  font-weight: bold;
}

.bottom {
  display: flex;
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
}

.bottom-button {
  width: 120px;
  margin-left: 16px;
}
</style>

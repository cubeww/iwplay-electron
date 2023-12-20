<template>
  <PopupView :close="close">
    <PopupTitle>{{ $t('Install') }}</PopupTitle>
    <PopupSeparator />
    <div>{{ context.name }} (ID: {{ context.id }})</div>
    <PopupSeparator />
    <ButtonGradient style="width: 120px" @click="handleSelectZip" color1="#4ade80" color2="#16a34a">{{ $t('Select ZIP') }}</ButtonGradient>
    <template v-if="filename">
      <div>
        <b>
          {{ $t('File Name: ') }} </b
        >{{ filename }}
      </div>
      <div>
        <b>
          {{ $t('File Size: ') }}
        </b>
        {{ filesizeStr }}
      </div>
    </template>
    <template v-else>
      <div><b>{{ $t('No ZIP Selected') }}</b></div>
    </template>
    <PopupSeparator />
    <div v-if="installStatus === 'installing'" style="display: flex"><LoadingIcon :size="32" />{{ $t("Installing") }}</div>
    <div class="bottom">
      <ButtonGradient class="bottom-button" :enabled="filename !== '' && installStatus !== 'installing'" @click="handleInstall">{{ $t('Install') }}</ButtonGradient>
      <ButtonPure class="bottom-button" @click="close">{{ $t('Cancel') }}</ButtonPure>
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
import { useI18n } from 'vue-i18n';

export interface InstallPopupContext {
  id: string;
  name: string;
}

defineProps<{ close: () => void; context: InstallPopupContext }>();

const filename = ref('');
const filesize = ref(0);

const i18n = useI18n()

const installStatus = ref<'pending' | 'installing' | 'error'>('pending');

const handleSelectZip = async () => {
  const f = await invoke('open-file-dialog', 'main', {
    title: i18n.t('Select Game ZIP'),
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

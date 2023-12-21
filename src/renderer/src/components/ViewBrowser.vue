<template>
  <TabView name="browser">
    <div class="url-bar">
      <RefreshIcon class="url-bar-refresh-button" v-if="!loading" @click="webviewEl.reload()"></RefreshIcon>
      <div class="url-box">
        <LoadingIcon class="url-box-loading-icon" :size="14" v-if="loading" />
        <div class="url-box-text">{{ url }}</div>
      </div>
    </div>
    <webview ref="webviewEl" style="flex-grow: 1" src="https://delicious-fruit.com/" nodeintegration />
  </TabView>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import TabView from './TabView.vue';
import RefreshIcon from '@renderer/icons/RefreshIcon.vue';
import LoadingIcon from '@renderer/icons/LoadingIcon.vue';
import { useAppStore } from '@renderer/stores/appStore';

const appStore = useAppStore();

const loading = ref(true);
const url = ref('https://delicious-fruit.com/');
const webviewEl: any = ref();

const webviewCSS = `
  ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }

  ::-webkit-scrollbar-track {
    background: #000;
  }

  ::-webkit-scrollbar-thumb {
    background: #434953; 
    border-radius: 5px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #606774;
  }

  ::-webkit-scrollbar-corner {
    background: #202020;
  }
`;

onMounted(() => {
  webviewEl.value.addEventListener('did-navigate', handleDidNavigate);
  webviewEl.value.addEventListener('did-start-loading', handleDidStartLoading);
  webviewEl.value.addEventListener('did-stop-loading', handleDidStopLoading);
  webviewEl.value.addEventListener('will-navigate', handleWillNavigate);
  webviewEl.value.addEventListener('ipc-message', handleIpcMessage);
});

onUnmounted(() => {
  webviewEl.value.removeEventListener('did-navigate', handleDidNavigate);
  webviewEl.value.removeEventListener('did-start-loading', handleDidStartLoading);
  webviewEl.value.removeEventListener('did-stop-loading', handleDidStopLoading);
  webviewEl.value.removeEventListener('will-navigate', handleWillNavigate);
  webviewEl.value.removeEventListener('ipc-message', handleIpcMessage);
});

watchEffect(() => {
  if (appStore.shouldLoadURL) {
    appStore.setShouldLoadURL(false);
    webviewEl.value.loadURL(appStore.present.targetBrowserURL);
  }
});

const handleDidNavigate = (event: any) => {
  webviewEl.value.insertCSS(webviewCSS);
  url.value = event.url;
};

const handleDidStopLoading = () => {
  loading.value = false;

  webviewEl.value.executeJavaScript(`
    // Prevent website from opening new page
    document.querySelectorAll('a').forEach(a => a.removeAttribute('target'))
    
    // Get mouse input and use it to close the context menu if needed
    document.addEventListener('mousedown', () => {
      window.electron.ipcRenderer.sendToHost('mousedown')
    })
  `);
};

const handleDidStartLoading = () => {
  loading.value = true;
};

const handleWillNavigate = (event: any) => {
  // **NOT** trigger in LoadURL
  if (event.url !== appStore.present.targetBrowserURL) {
    appStore.recordBrowserURL(event.url);
  }
};

const handleIpcMessage = (event: any) => {
  if (event.channel === 'mousedown') {
    appStore.hideContextMenu();
  }
};
</script>

<style scoped>
.url-bar {
  display: flex;
  padding-bottom: 4px;
  align-items: center;
  height: 20px;
  border-bottom: 1.5px solid #1e252d;
}

.url-bar-refresh-button {
  margin-left: 10px;
  width: 20px;
  transition: all 0.1s;
  cursor: pointer;
  border-radius: 10px;
  padding-left: 4px;
  padding-right: 4px;
  color: #67707b;
  flex-shrink: 0;

  &:hover {
    color: #b8bcbf;
    background-color: #23262e;
  }
}

.url-box {
  display: flex;
  align-items: center;
  overflow: hidden;

  font-size: x-small;
  border-radius: 10px;
  margin-left: 4px;
  padding: 2px;
  padding-left: 8px;
  padding-right: 16px;
  cursor: pointer;
  color: #626b76;
  transition: all 0.25s;

  &:hover {
    background-color: #23262e;
    color: #b8bcbf;
  }
}

.url-box-loading-icon {
  flex-shrink: 0;
}

.url-box-text {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>

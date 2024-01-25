<template>
  <TabView name="browser">
    <div class="url-bar">
      <div v-if="!loading" class="url-bar-refresh-button" @click="webviewEl?.reload()">
        <RefreshIcon />
      </div>
      <div class="url-box">
        <LoadingIcon v-if="loading" class="url-box-loading-icon" :size="14" />
        <div class="url-box-text">{{ url }}</div>
      </div>
    </div>
    <webview ref="webviewEl" style="flex-grow: 1" src="https://delicious-fruit.com/" allowpopups disablewebsecurity nodeintegration />
  </TabView>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watchEffect } from 'vue';
import TabView from './TabView.vue';
import RefreshIcon from '@renderer/icons/RefreshIcon.vue';
import LoadingIcon from '@renderer/icons/LoadingIcon.vue';
import { WebviewTag } from 'electron';
import { useNavigateStore } from '@renderer/stores/navigate';
import { useContextMenuStore } from '@renderer/stores/contextMenu';
import { useLibraryStore } from '@renderer/stores/library';

const navigateStore = useNavigateStore();
const contextMenuStore = useContextMenuStore();
const libraryStore = useLibraryStore();

const loading = ref(true);
const url = ref('https://delicious-fruit.com/');
const webviewEl = ref<WebviewTag>();

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
  if (!webviewEl.value) return;
  webviewEl.value.addEventListener('did-navigate', handleDidNavigate);
  webviewEl.value.addEventListener('did-start-loading', handleDidStartLoading);
  webviewEl.value.addEventListener('did-stop-loading', handleDidStopLoading);
  webviewEl.value.addEventListener('will-navigate', handleWillNavigate);
  webviewEl.value.addEventListener('ipc-message', handleIpcMessage);
});

onUnmounted(() => {
  if (!webviewEl.value) return;
  webviewEl.value.removeEventListener('did-navigate', handleDidNavigate);
  webviewEl.value.removeEventListener('did-start-loading', handleDidStartLoading);
  webviewEl.value.removeEventListener('did-stop-loading', handleDidStopLoading);
  webviewEl.value.removeEventListener('will-navigate', handleWillNavigate);
  webviewEl.value.removeEventListener('ipc-message', handleIpcMessage);
});

watchEffect(() => {
  if (!webviewEl.value) return;
  if (navigateStore.shouldLoadURL && navigateStore.state.targetBrowserURL) {
    navigateStore.setShouldLoadURL(false);
    webviewEl.value.loadURL(navigateStore.state.targetBrowserURL);
  }
});

const handleDidNavigate = (event: any) => {
  if (!webviewEl.value) return;
  webviewEl.value.insertCSS(webviewCSS);
  url.value = event.url;

  const prefix = 'https://delicious-fruit.com/ratings/game_details.php?id=';
  const index = event.url.indexOf(prefix);
  if (index !== -1) {
    const id = event.url.substring(index + prefix.length);
    navigateStore.updateLastVisitedFangameId(id);
  }

  if (event.url.substring(0, 27) === 'https://delicious-fruit.com') {
    webviewEl.value.executeJavaScript(`
  window.electron.ipcRenderer.sendToHost('user',
  {
    username: document.querySelector('#header p').childNodes[0].textContent.trim(),
    cookie: document.cookie,
  }  
  )
  `);
  }
};

const handleDidStopLoading = () => {
  if (!webviewEl.value) return;
  loading.value = false;

  // Get mouse input and use it to close the context menu if needed
  webviewEl.value.executeJavaScript(`
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
  if (event.url !== navigateStore.state.targetBrowserURL) {
    navigateStore.recordBrowserURL(event.url);
  }
};

const handleIpcMessage = (event: any) => {
  if (event.channel === 'mousedown') {
    contextMenuStore.hideContextMenu();
  }
  if (event.channel === 'user') {
    const options = event.args[0];
    if (options.username && libraryStore.delFruitUserName !== options.username) {
      libraryStore.delFruitUserName = options.username;
      libraryStore.delFruitCookie = options.cookie;
      libraryStore.syncProfileFromDelFruit();
    }
  }
};
</script>

<style scoped>
.url-bar {
  display: flex;
  padding-bottom: 4px;
  padding-left: 10px;
  gap: 4px;
  align-items: center;
  height: 20px;
  border-bottom: 1.5px solid #1e252d;
}

.url-bar-refresh-button {
  display: flex;
  justify-content: center;
  align-items: center;
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

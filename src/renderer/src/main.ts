/**
 * main.ts
 * Entry point for all renderer processes.
 * Different components will be entered based on searchParams.type.
 */

import './main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import log from 'electron-log/renderer';

import App from './App.vue';
import AppSettings from './components/AppSettings.vue';
import { createI18n } from 'vue-i18n';

import zh from './i18n/zh';
import en from './i18n/en';

import GameProperties from './components/GameProperties.vue';
import TrayMenu from './components/TrayMenu.vue';
import AboutView from './components/AboutView.vue';

import { useSettingsStore } from './stores/settings';
import { useDownloadStore } from './stores/download';
import { useNavigateStore } from './stores/navigate';
import { useLibraryStore } from './stores/library';
import { usePopupStore } from './stores/popup';

export const searchParams = new URLSearchParams(window.location.search);
export const windowType = searchParams.get('type') as string;
export const windowName = searchParams.get('name') as string;

const windowTypeToComponentMap = {
  main: App,
  settings: AppSettings,
  gameprop: GameProperties,
  traymenu: TrayMenu,
  about: AboutView,
};

export const mainI18n = createI18n({
  legacy: false,
  locale: 'en',
  formatFallbackMessages: true,
  missingWarn: false,
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    },
    zh: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    },
  },
  messages: {
    zh,
    en,
  },
});

const pinia = createPinia();

pinia.use(({ store }) => {
  store.$onAction((e) => {
    log.info(`%c${store.$id}: ` + e.name, 'color: #51ad59');
  });
});

const app = createApp(windowTypeToComponentMap[windowType]);
app.use(pinia);
app.use(mainI18n);

await useSettingsStore().initialize();

if (windowName === 'main') {
  useNavigateStore().initialize();
  useDownloadStore().initialize();
  useLibraryStore().initialize();

  const popupStore = usePopupStore();

  window.addEventListener('error', (ev) => {
    popupStore.showError(ev.message);
  });

  window.addEventListener('unhandledrejection', (ev) => {
    popupStore.showError((ev.reason as Error).message);
  });
}

app.mount('#app');

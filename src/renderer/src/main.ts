import './main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import log from 'electron-log/renderer';

import App from './App.vue';
import AppSettings from './components/AppSettings.vue';
import { createI18n } from 'vue-i18n';

import zh from './i18n/zh';
import en from './i18n/en';
import { useConfigStore } from './stores/configStore';

const searchParams = new URLSearchParams(window.location.search);
const windowType = searchParams.get('type') as string;

const typeToComponentMap = {
  main: App,
  settings: AppSettings
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
        day: 'numeric'
      }
    },
    zh: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    },
  },
  messages: {
    zh,
    en
  }
});

const pinia = createPinia();

pinia.use(({ store }) => {
  store.$onAction((e) => {
    log.info(`%c${store.$id}: ` + e.name, 'color: #51ad59');
  });
});

const app = createApp(typeToComponentMap[windowType]);
app.use(pinia);
app.use(mainI18n);

const configStore = useConfigStore();
await configStore.init();

app.mount('#app');

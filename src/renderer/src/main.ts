import './main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import log from 'electron-log/renderer';

import App from './App.vue';
import AppSettings from './components/AppSettings.vue';
import { initConfig } from './utils/appConfig';
import { createI18n } from 'vue-i18n';

import zh from './i18n/zh'
import en from './i18n/en'

const searchParams = new URLSearchParams(window.location.search);
const windowType = searchParams.get('type') as string;

const typeToComponentMap = {
  main: App,
  settings: AppSettings
};

await initConfig()

const pinia = createPinia();

pinia.use(({ store }) => {
  store.$onAction((e) => {
    log.info('%cStore: ' + e.name, 'color: #51ad59');
  });
});

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    zh,
    en,
  }
})

const app = createApp(typeToComponentMap[windowType]);
app.use(pinia);
app.use(i18n)
app.mount('#app');

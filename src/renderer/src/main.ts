import './main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';

import log from 'electron-log/renderer';

import App from './App.vue';
import AppSettings from './components/AppSettings.vue';
import { initConfig } from './utils/appConfig';

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

const app = createApp(typeToComponentMap[windowType]);
app.use(pinia);
app.mount('#app');

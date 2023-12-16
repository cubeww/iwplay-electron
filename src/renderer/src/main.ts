import { createApp } from 'vue';
import App from './App.vue';
import './main.css';
import { createPinia } from 'pinia';
import log from 'electron-log/renderer';

const pinia = createPinia();

// Log the store actions
pinia.use(({ store }) => {
  store.$onAction((e) => {
    log.info('%cStore: ' + e.name, 'color: #51ad59');
  });
});

const app = createApp(App);
app.use(pinia);

createApp(App).mount('#app');

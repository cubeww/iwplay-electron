import { createApp } from 'vue'
import App from './App.vue'
import './main.css'
import { createPinia } from 'pinia'
import { PiniaLogger } from 'pinia-logger'

const pinia = createPinia()
pinia.use(
  PiniaLogger({
    expanded: true,
    // disabled: process.env.mode === 'production'
  })
)

const app = createApp(App)
app.use(pinia)

createApp(App).mount('#app')

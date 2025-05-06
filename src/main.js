import '@/assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { setupI18n } from './components/i18n/i18n.js'

setupI18n().then((i18n) => {
  const app = createApp(App)
  app.use(i18n)
  app.mount('#app')
})

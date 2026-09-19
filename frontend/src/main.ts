import '@fontsource-variable/sofia-sans/index.css'
import '@fontsource-variable/sofia-sans-condensed/index.css'
import '@fontsource-variable/sofia-sans-extra-condensed/index.css'
import '@/assets/tokens.css'
import '@/assets/base.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from '@/App.vue'
import { bootstrapTelegram } from '@/composables/useTelegram'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  window.Telegram.WebApp.expand()
}

app.use(createPinia())
app.use(router)

bootstrapTelegram()

const authStore = useAuthStore()
authStore.restoreSession().finally(() => {
  app.mount('#app')
})

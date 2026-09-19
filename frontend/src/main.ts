import '@fontsource/onest/400.css'
import '@fontsource/onest/500.css'
import '@fontsource/onest/600.css'
import '@fontsource/onest/700.css'
import '@fontsource/newsreader/300.css'
import '@fontsource/newsreader/400.css'
import '@fontsource/newsreader/500.css'
import '@fontsource/newsreader/300-italic.css'
import '@fontsource/newsreader/400-italic.css'
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
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    }

app.use(createPinia())
app.use(router)

bootstrapTelegram()

const authStore = useAuthStore()
authStore.restoreSession().finally(() => {
  app.mount('#app')
})

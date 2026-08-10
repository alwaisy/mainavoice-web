import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app.vue'
import router from './router'
import './assets/css/base.css'

// ─── Apply theme BEFORE Vue mounts to prevent flash ───────────────────────────
// Reads maina_theme_mode from localStorage immediately on script parse.
// 'light' → no class, 'dark' → add .dark, 'system' → follow OS preference.
;(function applyThemeEarly() {
  const stored = localStorage.getItem('maina_theme_mode') || 'system'
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const shouldDark
    = stored === 'dark' || (stored === 'system' && prefersDark)
  if (shouldDark) {
    document.documentElement.classList.add('dark')
  }
  else {
    document.documentElement.classList.remove('dark')
  }
})()

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')

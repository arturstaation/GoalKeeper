import { createApp, ref } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import './styles/main.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from './App.vue'

const vuetify = createVuetify({ components, directives, icons: { defaultSet: 'mdi' } })

export const THEME_KEY = 'gk_theme'
export const isDark = ref(false)

export function applyTheme(theme: 'theme-dark' | 'theme-light') {
  const html = document.documentElement
  html.classList.remove('theme-dark', 'theme-light')
  html.classList.add(theme)
}

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) as 'theme-dark' | 'theme-light' | null
  if (saved) {
    applyTheme(saved)
    isDark.value = saved === 'theme-dark'
  } else {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
    applyTheme(prefersDark ? 'theme-dark' : 'theme-light')
    isDark.value = prefersDark
  }
}

export function toggleTheme() {
  const next = isDark.value ? 'theme-light' : 'theme-dark'
  applyTheme(next)
  isDark.value = !isDark.value
  localStorage.setItem(THEME_KEY, next)
}

initTheme()

createApp(App).use(vuetify).mount('#app')
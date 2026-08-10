import { LazyStore } from '@tauri-apps/plugin-store'
import { defineStore } from 'pinia'

// Robust environment check
const isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__

// Only create the store instance if we are actually in Tauri
let tauriStore: LazyStore | null = null
if (isTauri) {
  try {
    tauriStore = new LazyStore('settings.json')
  }
  catch (e) {
    console.warn('Tauri Store failed to initialize:', e)
  }
}

export const useSettingsStore = defineStore('settings', () => {
  async function getSetting<T>(key: string): Promise<T | undefined> {
    if (!tauriStore) {
      // Fallback: Use localStorage for web version or return undefined
      const val = localStorage.getItem(`SR_${key}`)
      return val ? JSON.parse(val) as T : undefined
    }
    try {
      const value = await tauriStore.get<T>(key)
      return value ?? undefined
    }
    catch {
      return undefined
    }
  }

  async function setSetting<T>(key: string, value: T) {
    if (!tauriStore) {
      localStorage.setItem(`SR_${key}`, JSON.stringify(value))
      return
    }
    try {
      await tauriStore.set(key, value)
      await tauriStore.save()
    }
    catch {
      // Failed to save
    }
  }

  async function getSettings() {
    if (!tauriStore)
      return []
    try {
      return await tauriStore.entries<any>()
    }
    catch {
      return []
    }
  }

  return { getSetting, setSetting, getSettings }
})

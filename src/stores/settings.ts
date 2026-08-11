import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  async function getSetting<T>(key: string): Promise<T | undefined> {
    try {
      const val = localStorage.getItem(`SR_${key}`)
      return val ? JSON.parse(val) as T : undefined
    }
    catch {
      return undefined
    }
  }

  async function setSetting<T>(key: string, value: T) {
    try {
      localStorage.setItem(`SR_${key}`, JSON.stringify(value))
    }
    catch {
      // Failed to save
    }
  }

  async function getSettings() {
    try {
      const entries: [string, any][] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('SR_')) {
          const val = localStorage.getItem(k)
          if (val)
            entries.push([k.replace('SR_', ''), JSON.parse(val)])
        }
      }
      return entries
    }
    catch {
      return []
    }
  }

  return { getSetting, setSetting, getSettings }
})

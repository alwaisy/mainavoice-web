import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TranscriptionVersion {
  versionNumber: number
  engineName: string
  text: string
  latencyMs: number
  wordCount: number
  costEstimate: number
  timestamp: string
}

export interface RecordingHistoryItem {
  id: string
  audioFilePath?: string
  createdAt: string
  activeVersionIndex: number
  versions: TranscriptionVersion[]
}

export type ThemeMode = 'light' | 'dark' | 'system'

export const useMainaStore = defineStore('maina-store', () => {
  // State
  const openRouterApiKey = ref<string>(
    localStorage.getItem('maina_openrouter_key') || '',
  )
  const selectedModel = ref<string>('openai/gpt-transcribe')
  const isNativeTauri = ref<boolean>(
    typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window),
  )

  const themeMode = ref<ThemeMode>(
    (localStorage.getItem('maina_theme_mode') as ThemeMode) || 'light',
  )
  const history = ref<RecordingHistoryItem[]>(
    JSON.parse(localStorage.getItem('maina_history_v2') || '[]'),
  )

  // Actions
  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem('maina_theme_mode', mode)

    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    }
    else if (mode === 'light') {
      document.documentElement.classList.remove('dark')
    }
    else {
      // System preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      }
      else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  function setApiKey(key: string) {
    openRouterApiKey.value = key
    localStorage.setItem('maina_openrouter_key', key)
  }

  function saveHistoryItem(item: RecordingHistoryItem) {
    history.value.unshift(item)
    localStorage.setItem('maina_history_v2', JSON.stringify(history.value))
  }

  function addOrUpdateHistoryItem(audioPath: string, version: TranscriptionVersion) {
    const item: RecordingHistoryItem = {
      id: `rec_${Date.now()}`,
      audioFilePath: audioPath,
      createdAt: new Date().toISOString(),
      activeVersionIndex: 0,
      versions: [version],
    }
    history.value.unshift(item)
    localStorage.setItem('maina_history_v2', JSON.stringify(history.value))
  }

  function addVersionToItem(itemId: string, version: TranscriptionVersion) {
    const found = history.value.find(h => h.id === itemId)
    if (found) {
      version.versionNumber = found.versions.length + 1
      found.versions.push(version)
      found.activeVersionIndex = found.versions.length - 1
      localStorage.setItem('maina_history_v2', JSON.stringify(history.value))
    }
  }

  function setActiveVersion(itemId: string, index: number) {
    const found = history.value.find(h => h.id === itemId)
    if (found && index >= 0 && index < found.versions.length) {
      found.activeVersionIndex = index
      localStorage.setItem('maina_history_v2', JSON.stringify(history.value))
    }
  }

  function deleteHistoryItem(itemId: string) {
    history.value = history.value.filter(h => h.id !== itemId)
    localStorage.setItem('maina_history_v2', JSON.stringify(history.value))
  }

  function clearHistory() {
    history.value = []
    localStorage.setItem('maina_history_v2', '[]')
  }

  function clearAllHistory() {
    clearHistory()
  }

  function formatDuration(ms: number): string {
    if (ms < 1000)
      return `${ms}ms`
    const sec = (ms / 1000).toFixed(1)
    return `${sec}s`
  }

  return {
    openRouterApiKey,
    selectedModel,
    isNativeTauri,
    themeMode,
    history,
    setThemeMode,
    setApiKey,
    saveHistoryItem,
    addOrUpdateHistoryItem,
    addVersionToItem,
    setActiveVersion,
    deleteHistoryItem,
    clearHistory,
    clearAllHistory,
    formatDuration,
  }
})

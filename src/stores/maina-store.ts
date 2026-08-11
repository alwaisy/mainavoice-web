import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  dbClearAllRecordings,
  dbDeleteRecording,
  dbGetAllRecordings,
  dbGetAudioBlob,
  dbGetSetting,
  dbSaveAudioBlob,
  dbSaveRecording,
  dbSetSetting,
} from '@/services/db-service'

export interface TranscriptionVersion {
  versionNumber: number
  engineName: string
  text: string
  translatedText?: string
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
  isComparisonSuite?: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'

export const useMainaStore = defineStore('maina-store', () => {
  const openRouterApiKey = ref<string>('')
  const selectedModel = ref<string>('fish-audio/transcribe-1')
  const themeMode = ref<ThemeMode>('light')
  const history = ref<RecordingHistoryItem[]>([])
  const isInitialized = ref(false)

  const autoTranslateRecord = ref<boolean>(false)
  const autoTranslateCompare = ref<boolean>(false)
  const autoTranslateHistory = ref<boolean>(false)

  // Watchers to guarantee 100% automatic IndexedDB persistence whenever settings change
  watch(openRouterApiKey, (val) => {
    if (isInitialized.value)
      dbSetSetting('openRouterApiKey', val)
  })
  watch(selectedModel, (val) => {
    if (isInitialized.value)
      dbSetSetting('selectedModel', val)
  })
  watch(themeMode, (val) => {
    if (isInitialized.value)
      dbSetSetting('themeMode', val)
  })
  watch(autoTranslateRecord, (val) => {
    if (isInitialized.value)
      dbSetSetting('autoTranslateRecord', val)
  })
  watch(autoTranslateCompare, (val) => {
    if (isInitialized.value)
      dbSetSetting('autoTranslateCompare', val)
  })
  watch(autoTranslateHistory, (val) => {
    if (isInitialized.value)
      dbSetSetting('autoTranslateHistory', val)
  })

  // Initialization function called on app load
  async function initStore() {
    if (isInitialized.value)
      return

    try {
      const key = await dbGetSetting<string>('openRouterApiKey')
      const theme = await dbGetSetting<ThemeMode>('themeMode')
      const model = await dbGetSetting<string>('selectedModel')

      const legacyTrans = await dbGetSetting<boolean>('autoTranslate')
      const recTrans = await dbGetSetting<boolean>('autoTranslateRecord')
      const compTrans = await dbGetSetting<boolean>('autoTranslateCompare')
      const histTrans = await dbGetSetting<boolean>('autoTranslateHistory')
      const items = await dbGetAllRecordings()

      openRouterApiKey.value = key || ''
      themeMode.value = theme || 'light'
      selectedModel.value = model || 'fish-audio/transcribe-1'

      autoTranslateRecord.value = recTrans ?? legacyTrans ?? false
      autoTranslateCompare.value = compTrans ?? legacyTrans ?? false
      autoTranslateHistory.value = histTrans ?? legacyTrans ?? false

      history.value = items

      applyTheme(themeMode.value)
      isInitialized.value = true
    }
    catch (err) {
      console.error('Failed to initialize IndexedDB store:', err)
    }
  }

  async function setAutoTranslateRecord(val: boolean) {
    autoTranslateRecord.value = val
    await dbSetSetting('autoTranslateRecord', val)
  }

  async function setAutoTranslateCompare(val: boolean) {
    autoTranslateCompare.value = val
    await dbSetSetting('autoTranslateCompare', val)
  }

  async function setAutoTranslateHistory(val: boolean) {
    autoTranslateHistory.value = val
    await dbSetSetting('autoTranslateHistory', val)
  }

  function applyTheme(mode: ThemeMode) {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark')
    }
    else if (mode === 'light') {
      document.documentElement.classList.remove('dark')
    }
    else {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      }
      else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  async function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
    await dbSetSetting('themeMode', mode)
    applyTheme(mode)
  }

  async function setApiKey(key: string) {
    openRouterApiKey.value = key
    await dbSetSetting('openRouterApiKey', key)
  }

  async function setSelectedModel(model: string) {
    selectedModel.value = model
    await dbSetSetting('selectedModel', model)
  }

  async function saveHistoryItem(item: RecordingHistoryItem) {
    history.value.unshift(item)
    await dbSaveRecording(item)
  }

  async function addOrUpdateHistoryItem(
    audioBlobOrUrl: Blob | string,
    version: TranscriptionVersion,
  ): Promise<RecordingHistoryItem> {
    const id = `rec_${Date.now()}`
    let audioPath = ''

    if (audioBlobOrUrl instanceof Blob) {
      await dbSaveAudioBlob(id, audioBlobOrUrl)
      audioPath = URL.createObjectURL(audioBlobOrUrl)
    }
    else if (typeof audioBlobOrUrl === 'string' && audioBlobOrUrl.startsWith('blob:')) {
      try {
        const res = await fetch(audioBlobOrUrl)
        const blob = await res.blob()
        await dbSaveAudioBlob(id, blob)
      }
      catch {}
      audioPath = audioBlobOrUrl
    }
    else {
      audioPath = audioBlobOrUrl
    }

    const item: RecordingHistoryItem = {
      id,
      audioFilePath: audioPath,
      createdAt: new Date().toISOString(),
      activeVersionIndex: 0,
      versions: [version],
    }

    history.value.unshift(item)
    await dbSaveRecording(item)
    return item
  }

  async function saveComparisonSuite(
    audioBlobOrUrl: Blob | string,
    versions: TranscriptionVersion[],
    winningIndex: number = 0,
  ): Promise<RecordingHistoryItem> {
    const id = `comp_${Date.now()}`
    let audioPath = ''

    if (audioBlobOrUrl instanceof Blob) {
      await dbSaveAudioBlob(id, audioBlobOrUrl)
      audioPath = URL.createObjectURL(audioBlobOrUrl)
    }
    else if (typeof audioBlobOrUrl === 'string' && audioBlobOrUrl.startsWith('blob:')) {
      try {
        const res = await fetch(audioBlobOrUrl)
        const blob = await res.blob()
        await dbSaveAudioBlob(id, blob)
      }
      catch {}
      audioPath = audioBlobOrUrl
    }
    else {
      audioPath = audioBlobOrUrl
    }

    const item: RecordingHistoryItem = {
      id,
      audioFilePath: audioPath,
      createdAt: new Date().toISOString(),
      activeVersionIndex: winningIndex >= 0 ? winningIndex : 0,
      versions,
      isComparisonSuite: true,
    }

    history.value.unshift(item)
    await dbSaveRecording(item)
    return item
  }

  async function addVersionToItem(itemId: string, version: TranscriptionVersion) {
    const found = history.value.find(h => h.id === itemId)
    if (found) {
      version.versionNumber = found.versions.length + 1
      found.versions.push(version)
      found.activeVersionIndex = found.versions.length - 1
      await dbSaveRecording(found)
    }
  }

  async function setActiveVersion(itemId: string, index: number) {
    const found = history.value.find(h => h.id === itemId)
    if (found && index >= 0 && index < found.versions.length) {
      found.activeVersionIndex = index
      await dbSaveRecording(found)
    }
  }

  async function updateVersionTranslation(itemId: string, versionIndex: number, translatedText: string) {
    const found = history.value.find(h => h.id === itemId)
    if (found && found.versions[versionIndex]) {
      found.versions[versionIndex].translatedText = translatedText
      await dbSaveRecording(found)
    }
  }

  async function deleteHistoryItem(itemId: string) {
    history.value = history.value.filter(h => h.id !== itemId)
    await dbDeleteRecording(itemId)
  }

  async function clearAllHistory() {
    history.value = []
    await dbClearAllRecordings()
  }

  async function getAudioUrlForRecording(id: string, fallbackPath?: string): Promise<string | undefined> {
    const blob = await dbGetAudioBlob(id)
    if (blob) {
      return URL.createObjectURL(blob)
    }
    return fallbackPath
  }

  function formatDuration(ms: number): string {
    if (ms < 1000)
      return `${ms}ms`
    const totalSec = ms / 1000
    if (totalSec < 60)
      return `${totalSec.toFixed(1)}s`
    const mins = Math.floor(totalSec / 60)
    const secs = Math.round(totalSec % 60)
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  // Auto initialize
  initStore()

  return {
    openRouterApiKey,
    selectedModel,
    themeMode,
    autoTranslateRecord,
    autoTranslateCompare,
    autoTranslateHistory,
    history,
    isInitialized,
    initStore,
    setThemeMode,
    setApiKey,
    setSelectedModel,
    setAutoTranslateRecord,
    setAutoTranslateCompare,
    setAutoTranslateHistory,
    saveHistoryItem,
    addOrUpdateHistoryItem,
    saveComparisonSuite,
    addVersionToItem,
    setActiveVersion,
    updateVersionTranslation,
    deleteHistoryItem,
    clearAllHistory,
    getAudioUrlForRecording,
    formatDuration,
  }
})

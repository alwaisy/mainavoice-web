import { defineStore } from 'pinia'
import { ref } from 'vue'
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

const RECOVERED_TAURI_HISTORY: RecordingHistoryItem[] = [
  {
    id: 'rec_1786380992162',
    audioFilePath: '/.wtf/maina_rec_1786379499351.wav',
    createdAt: '2026-08-10T16:56:32.162Z',
    activeVersionIndex: 0,
    versions: [
      {
        versionNumber: 2,
        engineName: 'openai/gpt-transcribe',
        text: 'Guys, so this time for GPT, मुझे नहीं पता क्या GPT कैसे काम करने वाला है। मुझे बिल्कुल भी नहीं पता था कि जो Fish audio है, वो इतना जबरदस्त काम करेगा। हालांकि ऊपर ये लिखा हुआ था कि ये Mandarin, Chinese और English के लिए काम करता है, but surprisingly it worked best for English. English नहीं, Hindi. मैं उर्दू बोल रहा हूँ, तो उसने syntax Hindi का दिया। वो Hindi-Urdu बोलने में same है, लेकिन वो syntax उनका different हो जाता है। तो उसने जो है ना मुझे syntax से Hindi का दिया, क्योंकि it\'s problematic, मुझे इसका कुछ tweak करना पड़ेगा। Anyways, लेकिन यार मुझे बहुत जबरदस्त लगा इसमें कि यार, अभी देखो, जो Deepgram Nova है, वो claim करता है कि वो support करता है Hindi को, ठीक है? उसने काम नहीं किया। जो हमारे पास Parakeet है Nvidia का, वो तो obviously बोल रहा है कि वो support नहीं करता, वो Europe की कुछ languages support करता है, ठीक है? उससे तो मैं expect कर भी नहीं रहा था, लेकिन मैं Deepgram से ज़रूर expect कर रहा था, Deepgram Nova 2 या 3 से expectation थी मेरी कि यार ये काम करेगा, but it didn\'t. Fish audio से मैंने बिल्कुल भी expect नहीं किया था ये काम करेगा। इसने Hindi audio दिया, लेकिन मुझे नहीं पता वो कितनी correct है, अब मैं check करूँगा, लेकिन उसने दिया है कुछ। और English उसने जबरदस्त catch की है, जो बात है। And this is the final test, and this time it is GPT transcribe.',
        latencyMs: 11438,
        wordCount: 257,
        costEstimate: 0.0045,
        timestamp: '2026-08-10T16:56:32.161Z',
      },
    ],
  },
  {
    id: 'rec_1786379605844',
    audioFilePath: '/.wtf/maina_rec_1786379499351.wav',
    createdAt: '2026-08-10T16:33:25.844Z',
    activeVersionIndex: 0,
    versions: [
      {
        versionNumber: 1,
        engineName: 'openai/gpt-transcribe',
        text: 'Guys, so this time for GPT, मुझे नहीं पता क्या GPT कैसे काम करने वाला है। मुझे बिल्कुल भी नहीं पता था कि जो Fish audio है, वो इतना जबरदस्त काम करेगा। हालांकि ऊपर ये लिखा हुआ था कि ये Mandarin, Chinese और English के लिए काम करता है, but surprisingly it worked best for English. English नहीं, Hindi. मैं उर्दू बोल रहा हूँ, तो उसने syntax Hindi का दिया। वो Hindi-Urdu बोलने में same है, लेकिन वो syntax उनका different हो जाता है। तो उसने जो है ना मुझे syntax से Hindi का दिया, क्योंकि it\'s problematic, मुझे इसका कुछ tweak करना पड़ेगा। Anyways, लेकिन यार मुझे बहुत जबरदस्त लगा इसमें कि यार, अभी देखो, जो Deepgram Nova है, वो claim करता है कि वो support करता है Hindi को, ठीक है? उसने काम नहीं किया। जो हमारे पास Parakeet है Nvidia का, वो तो obviously बोल रहा है कि वो support नहीं करता, वो Europe की कुछ languages support करता है, ठीक है? उससे तो मैं expect कर भी नहीं रहा था, लेकिन मैं Deepgram से ज़रूर expect कर रहा था, Deepgram Nova 2 या 3 से expectation थी मेरी कि यार ये काम करेगा, but it didn\'t. Fish audio से मैंने बिल्कुल भी expect नहीं किया था ये काम करेगा। इसने Hindi audio दिया, लेकिन मुझे नहीं पता वो कितनी correct है, अब मैं check करूँगा, लेकिन उसने दिया है कुछ। और English उसने जबरदस्त catch की है, जो बात है। And this is the final test, and this time it is GPT transcribe.',
        latencyMs: 14040,
        wordCount: 257,
        costEstimate: 0.0069,
        timestamp: '2026-08-10T16:33:25.844Z',
      },
    ],
  },
  {
    id: 'rec_1786379473585',
    audioFilePath: '/.wtf/maina_rec_1786379409237.wav',
    createdAt: '2026-08-10T16:31:13.585Z',
    activeVersionIndex: 0,
    versions: [
      {
        versionNumber: 1,
        engineName: 'fish-audio/transcribe-1',
        text: 'ओके लास्ट मॉडल ओके सेकंड लास्ट मॉडल अभी मैंने जीपीटी ट्रांसक्राइब वन जो के मुझे लगता है कि सुपर मॉडल है कि जो कि हर चीज कर जाएगा मैंने उसके बजाय ट्राई नहीं किया तो ये क्या फिश आड़ी मॉडल है इसको ट्राई कर रहा हूँ ये चाइना एक सबसे सस्ता मॉडल है इस वक्त ये पहले बता और ये चाइनीज मैंड्रियन इंग्लिश और चाइनीज स्लैश मैंड्रियन को सपोर्ट करता है मैं सारी इंग्लिश के नारे गार्डिंग कर रहा हूँ मुझे नहीं पता कि इंग्लिश में उर्दू को ये कैप्चर करके क्यों नहीं वो जो था ना निमोट्रोन का मॉडल निमोट्रांस ही सॉरी क्या हैउसका नाम क्या? एनवीडिया की तरफ से पैरा की एक मॉडल था उसने तो बहुत ही कंडा प्रभावम गया वो पता नहीं क्या जर्मन उसे फ्रेंच लिख दी, I don\'t know। अच्छा फिर this is the fish audio model I\'m recording with this and your transcription output will be here। ब्ला ब्ला ब्ला ब्ला। I don\'t know how this fish audio works।',
        latencyMs: 13256,
        wordCount: 166,
        costEstimate: 0.00008333333333333334,
        timestamp: '2026-08-10T16:31:13.585Z',
      },
    ],
  },
  {
    id: 'rec_1786379396062',
    audioFilePath: '/.wtf/maina_rec_1786379341472.wav',
    createdAt: '2026-08-10T16:29:56.062Z',
    activeVersionIndex: 0,
    versions: [
      {
        versionNumber: 1,
        engineName: 'nvidia/parakeet-tdt-0.6b-v3',
        text: 'Uh okay Jo uh model Anna uh and Nova Deep Grampa Nova 3 both Burit Milingual use. Uh they claimed it\'s multilingual, but that didn\'t work. So a Mujani Pataky and Vidya Kapak Parake Parake use, I\'m not sure. Obviously, Mandarin Kalye Yapir. Seven language language skill can\'t but there is some kind of uh restriction for the restriction peculiar feature, right?',
        latencyMs: 8444,
        wordCount: 62,
        costEstimate: 0.0011250000000000001,
        timestamp: '2026-08-10T16:29:56.061Z',
      },
    ],
  },
  {
    id: 'rec_1786379319678',
    audioFilePath: '/.wtf/maina_rec_1786379286151.wav',
    createdAt: '2026-08-10T16:28:39.678Z',
    activeVersionIndex: 0,
    versions: [
      {
        versionNumber: 1,
        engineName: 'deepgram/nova-3',
        text: 'Okay. Testing, model again. Transcription.',
        latencyMs: 9022,
        wordCount: 5,
        costEstimate: 0.0017200000000000002,
        timestamp: '2026-08-10T16:28:39.678Z',
      },
    ],
  },
]

export const useMainaStore = defineStore('maina-store', () => {
  const openRouterApiKey = ref<string>('')
  const selectedModel = ref<string>('openai/gpt-transcribe')
  const themeMode = ref<ThemeMode>('light')
  const history = ref<RecordingHistoryItem[]>([])
  const isInitialized = ref(false)

  const autoTranslate = ref<boolean>(false)

  // Initialization function called on app load
  async function initStore() {
    if (isInitialized.value)
      return

    try {
      const key = await dbGetSetting<string>('openRouterApiKey')
      const theme = await dbGetSetting<ThemeMode>('themeMode')
      const model = await dbGetSetting<string>('selectedModel')
      const autoTrans = await dbGetSetting<boolean>('autoTranslate')
      let items = await dbGetAllRecordings()

      // Seed recovery data if IndexedDB is empty
      if (items.length === 0) {
        for (const item of RECOVERED_TAURI_HISTORY) {
          await dbSaveRecording(item)
        }
        items = await dbGetAllRecordings()
      }

      openRouterApiKey.value = key || '***REMOVED***'
      themeMode.value = theme || 'light'
      selectedModel.value = model || 'openai/gpt-transcribe'
      autoTranslate.value = autoTrans || false
      history.value = items

      applyTheme(themeMode.value)
      isInitialized.value = true
    }
    catch (err) {
      console.error('Failed to initialize IndexedDB store:', err)
    }
  }

  async function setAutoTranslate(val: boolean) {
    autoTranslate.value = val
    await dbSetSetting('autoTranslate', val)
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
    autoTranslate,
    history,
    isInitialized,
    initStore,
    setThemeMode,
    setApiKey,
    setSelectedModel,
    setAutoTranslate,
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

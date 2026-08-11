import JSZip from 'jszip'
import {
  dbClearAllData,
  dbGetAllAudioBlobs,
  dbGetAllRecordings,
  dbGetAllSettings,
  dbSaveAudioBlob,
  dbSaveRecording,
  dbSetSetting,
} from './db-service'

export interface TranscriptionsBackup {
  version: number
  appName: string
  exportedAt: string
  recordings: any[]
}

export interface SettingsBackup {
  version: number
  appName: string
  exportedAt: string
  settings: Record<string, any>
}

export async function exportBackupArchive(): Promise<void> {
  const recordings = await dbGetAllRecordings()
  const audioBlobs = await dbGetAllAudioBlobs()
  const rawSettings = await dbGetAllSettings()

  // Format settings array [{key, value}] into clean key-value object
  const settingsObject: Record<string, any> = {}
  for (const s of rawSettings) {
    if (s.key) {
      settingsObject[s.key] = s.value
    }
  }

  const zip = new JSZip()

  const transcriptionsBackup: TranscriptionsBackup = {
    version: 1,
    appName: 'Maina Voice',
    exportedAt: new Date().toISOString(),
    recordings,
  }

  const settingsBackup: SettingsBackup = {
    version: 1,
    appName: 'Maina Voice',
    exportedAt: new Date().toISOString(),
    settings: settingsObject,
  }

  // 1. Write transcriptions.json
  zip.file('transcriptions.json', JSON.stringify(transcriptionsBackup, null, 2))

  // 2. Write settings.json
  zip.file('settings.json', JSON.stringify(settingsBackup, null, 2))

  // 3. Write audio WAV files
  const audioFolder = zip.folder('audio')
  if (audioFolder) {
    for (const item of audioBlobs) {
      if (item.blob) {
        const arrayBuffer = await item.blob.arrayBuffer()
        audioFolder.file(`${item.id}.wav`, arrayBuffer)
      }
    }
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })

  const dateStr = new Date().toISOString().slice(0, 10)
  const downloadUrl = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = `mainavoice_backup_${dateStr}.zip`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

export async function importBackupArchive(file: File): Promise<{ recordingsCount: number, settingsCount: number }> {
  const zip = new JSZip()
  const zipContent = await zip.loadAsync(file)

  let recordings: any[] = []
  let settingsMap: Record<string, any> = {}

  // 1. Read Transcriptions (try transcriptions.json first, fallback to metadata.json)
  const transcriptionsFile = zipContent.file('transcriptions.json') || zipContent.file('metadata.json')
  if (!transcriptionsFile) {
    throw new Error('Invalid backup file: transcriptions.json or metadata.json is missing.')
  }

  const transcriptionsText = await transcriptionsFile.async('text')
  const parsedTranscriptions = JSON.parse(transcriptionsText)

  if (parsedTranscriptions.recordings && Array.isArray(parsedTranscriptions.recordings)) {
    recordings = parsedTranscriptions.recordings
  }

  // If metadata.json has legacy settings array/object
  if (parsedTranscriptions.settings) {
    if (Array.isArray(parsedTranscriptions.settings)) {
      for (const item of parsedTranscriptions.settings) {
        if (item.key)
          settingsMap[item.key] = item.value
      }
    }
    else if (typeof parsedTranscriptions.settings === 'object') {
      settingsMap = { ...parsedTranscriptions.settings }
    }
  }

  // 2. Read Settings (from settings.json if present)
  const settingsFile = zipContent.file('settings.json')
  if (settingsFile) {
    const settingsText = await settingsFile.async('text')
    const parsedSettings = JSON.parse(settingsText)

    if (parsedSettings.settings && typeof parsedSettings.settings === 'object') {
      if (Array.isArray(parsedSettings.settings)) {
        for (const item of parsedSettings.settings) {
          if (item.key)
            settingsMap[item.key] = item.value
        }
      }
      else {
        settingsMap = { ...settingsMap, ...parsedSettings.settings }
      }
    }
  }

  // Clear existing database state before restoring backup (Overwrite policy)
  await dbClearAllData()

  // 3. Restore Recordings
  for (const recording of recordings) {
    await dbSaveRecording(recording)
  }

  // 4. Restore Settings to IndexedDB
  const settingKeys = Object.keys(settingsMap)
  for (const key of settingKeys) {
    await dbSetSetting(key, settingsMap[key])
  }

  // 5. Restore Audio Blobs
  const audioFolder = zip.folder('audio')
  if (audioFolder) {
    const audioFiles = audioFolder.file(/\.wav$/)
    for (const audioFile of audioFiles) {
      const id = audioFile.name.replace(/^audio\//, '').replace(/\.wav$/, '')
      if (id) {
        const arrayBuffer = await audioFile.async('arraybuffer')
        const blob = new Blob([arrayBuffer], { type: 'audio/wav' })
        await dbSaveAudioBlob(id, blob)
      }
    }
  }

  return {
    recordingsCount: recordings.length,
    settingsCount: settingKeys.length,
  }
}

export async function performFactoryReset(): Promise<void> {
  await dbClearAllData()
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
    window.sessionStorage.clear()
  }
}

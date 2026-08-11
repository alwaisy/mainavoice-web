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

  function getFormattedBackupFilename(): string {
    const now = new Date()
    const userLocale = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'default'

    let year = String(now.getFullYear())
    let month = String(now.getMonth() + 1).padStart(2, '0')
    let day = String(now.getDate()).padStart(2, '0')
    let hoursStr = ''
    let minutes = String(now.getMinutes()).padStart(2, '0')
    let seconds = String(now.getSeconds()).padStart(2, '0')
    let ampm = now.getHours() >= 12 ? 'pm' : 'am'
    let tzStr = ''

    try {
      const formatter = new Intl.DateTimeFormat(userLocale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short',
      })

      const parts = formatter.formatToParts(now)
      const partMap: Record<string, string> = {}
      for (const p of parts) {
        partMap[p.type] = p.value
      }

      if (partMap.year)
        year = partMap.year
      if (partMap.month)
        month = partMap.month.padStart(2, '0')
      if (partMap.day)
        day = partMap.day.padStart(2, '0')
      if (partMap.hour)
        hoursStr = partMap.hour.padStart(2, '0')
      if (partMap.minute)
        minutes = partMap.minute.padStart(2, '0')
      if (partMap.second)
        seconds = partMap.second.padStart(2, '0')
      if (partMap.dayPeriod)
        ampm = partMap.dayPeriod.toLowerCase()

      if (partMap.timeZoneName) {
        tzStr = partMap.timeZoneName.replace(/[^a-z0-9+-]/gi, '')
      }
    }
    catch {
      // Fallback
    }

    if (!hoursStr) {
      let h = now.getHours() % 12
      if (h === 0)
        h = 12
      hoursStr = String(h).padStart(2, '0')
    }

    if (!tzStr) {
      const offsetMin = -now.getTimezoneOffset()
      const sign = offsetMin >= 0 ? '+' : '-'
      const absOffsetMin = Math.abs(offsetMin)
      const tzHours = String(Math.floor(absOffsetMin / 60))
      const tzMins = String(absOffsetMin % 60).padStart(2, '0')
      tzStr = `GMT${sign}${tzHours}${tzMins !== '00' ? tzMins : ''}`
    }

    let countryCode = ''
    if (typeof navigator !== 'undefined') {
      const locales = (navigator.languages && navigator.languages.length) ? navigator.languages : [navigator.language]
      for (const loc of locales) {
        if (loc) {
          const parts = loc.split('-')
          if (parts.length > 1) {
            const region = (parts[parts.length - 1] ?? '').toUpperCase()
            if (region.length === 2 && /^[A-Z]{2}$/.test(region)) {
              countryCode = region
              break
            }
          }
        }
      }
    }

    const countrySuffix = countryCode ? `_${countryCode}` : ''
    return `mainavoice_backup_${year}-${month}-${day}_${hoursStr}-${minutes}-${seconds}${ampm}${countrySuffix}_${tzStr}.zip`
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  const filename = getFormattedBackupFilename()
  const downloadUrl = URL.createObjectURL(zipBlob)
  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = filename
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
    const val = settingsMap[key]
    await dbSetSetting(key, val)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, String(val))
    }
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

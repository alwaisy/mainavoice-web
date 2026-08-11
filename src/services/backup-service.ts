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

export interface BackupMetadata {
  version: number
  appName: string
  exportedAt: string
  recordings: any[]
  settings: any[]
}

export async function exportBackupArchive(): Promise<void> {
  const recordings = await dbGetAllRecordings()
  const audioBlobs = await dbGetAllAudioBlobs()
  const settings = await dbGetAllSettings()

  const zip = new JSZip()

  const metadata: BackupMetadata = {
    version: 1,
    appName: 'Maina Voice',
    exportedAt: new Date().toISOString(),
    recordings,
    settings,
  }

  zip.file('metadata.json', JSON.stringify(metadata, null, 2))

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

  const metadataFile = zipContent.file('metadata.json')
  if (!metadataFile) {
    throw new Error('Invalid backup file: metadata.json is missing.')
  }

  const metadataText = await metadataFile.async('text')
  const metadata: BackupMetadata = JSON.parse(metadataText)

  if (!metadata.recordings || !Array.isArray(metadata.recordings)) {
    throw new Error('Invalid backup format: recordings array is missing.')
  }

  // Clear existing database state before restoring backup (Overwrite policy)
  await dbClearAllData()

  // 1. Restore Recordings
  for (const recording of metadata.recordings) {
    await dbSaveRecording(recording)
  }

  // 2. Restore Settings
  if (metadata.settings && Array.isArray(metadata.settings)) {
    for (const setting of metadata.settings) {
      if (setting.key) {
        await dbSetSetting(setting.key, setting.value)
      }
    }
  }

  // 3. Restore Audio Blobs
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
    recordingsCount: metadata.recordings.length,
    settingsCount: metadata.settings ? metadata.settings.length : 0,
  }
}

export async function performFactoryReset(): Promise<void> {
  await dbClearAllData()
  if (typeof window !== 'undefined') {
    window.localStorage.clear()
    window.sessionStorage.clear()
  }
}

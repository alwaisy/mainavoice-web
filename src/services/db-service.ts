import type { RecordingHistoryItem } from '@/stores/maina-store'

const DB_NAME = 'mainavoice_indexeddb'
const DB_VERSION = 1

export interface AppSettings {
  openRouterApiKey?: string
  themeMode?: 'light' | 'dark' | 'system'
  selectedModel?: string
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains('recordings')) {
        const historyStore = db.createObjectStore('recordings', { keyPath: 'id' })
        historyStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains('audio_blobs')) {
        db.createObjectStore('audio_blobs', { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// --- RECORDINGS STORE ---
export async function dbSaveRecording(item: RecordingHistoryItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readwrite')
    tx.objectStore('recordings').put(JSON.parse(JSON.stringify(item)))
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbGetAllRecordings(): Promise<RecordingHistoryItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('recordings', 'readonly')
    const store = tx.objectStore('recordings')
    const index = store.index('createdAt')
    const request = index.getAll()

    request.onsuccess = () => {
      // Sort newest first
      const results = (request.result || []) as RecordingHistoryItem[]
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      resolve(results)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function dbDeleteRecording(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['recordings', 'audio_blobs'], 'readwrite')
    tx.objectStore('recordings').delete(id)
    tx.objectStore('audio_blobs').delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbClearAllRecordings(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['recordings', 'audio_blobs'], 'readwrite')
    tx.objectStore('recordings').clear()
    tx.objectStore('audio_blobs').clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// --- AUDIO BLOBS STORE ---
export async function dbSaveAudioBlob(id: string, blob: Blob): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readwrite')
    tx.objectStore('audio_blobs').put({ id, blob })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbGetAudioBlob(id: string): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readonly')
    const request = tx.objectStore('audio_blobs').get(id)
    request.onsuccess = () => {
      const res = request.result
      resolve(res ? res.blob : null)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function dbGetAllAudioBlobs(): Promise<{ id: string, blob: Blob }[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readonly')
    const request = tx.objectStore('audio_blobs').getAll()
    request.onsuccess = () => resolve((request.result || []) as { id: string, blob: Blob }[])
    request.onerror = () => reject(request.error)
  })
}

// --- SETTINGS STORE ---
export async function dbGetSetting<T = any>(key: string): Promise<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly')
    const request = tx.objectStore('settings').get(key)
    request.onsuccess = () => resolve(request.result ? request.result.value as T : undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function dbGetAllSettings(): Promise<{ key: string, value: any }[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly')
    const request = tx.objectStore('settings').getAll()
    request.onsuccess = () => resolve((request.result || []) as { key: string, value: any }[])
    request.onerror = () => reject(request.error)
  })
}

export async function dbSetSetting<T = any>(key: string, value: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite')
    tx.objectStore('settings').put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function dbClearAllData(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['recordings', 'audio_blobs', 'settings'], 'readwrite')
    tx.objectStore('recordings').clear()
    tx.objectStore('audio_blobs').clear()
    tx.objectStore('settings').clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

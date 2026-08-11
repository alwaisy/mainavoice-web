<script setup lang="ts">
import { Check, Database, Download, Globe, Key, Laptop, Moon, RotateCcw, Sun, Upload } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { exportBackupArchive, importBackupArchive, performFactoryReset } from '@/services/backup-service'
import { useMainaStore } from '@/stores/maina-store'

const store = useMainaStore()
const apiKeyInput = ref(store.openRouterApiKey)

// Keep input synced when store initializes asynchronously from IndexedDB on page reload
watch(
  () => store.openRouterApiKey,
  (newKey) => {
    if (newKey && !apiKeyInput.value) {
      apiKeyInput.value = newKey
    }
  },
  { immediate: true },
)
const isSaved = ref(false)

const isExporting = ref(false)
const isImporting = ref(false)
const isResetting = ref(false)
const statusMessage = ref<string | null>(null)
const restoreInputRef = ref<HTMLInputElement | null>(null)

function handleSaveKey() {
  store.setApiKey(apiKeyInput.value)
  isSaved.value = true
  setTimeout(() => {
    isSaved.value = false
  }, 2000)
}

async function handleExport() {
  isExporting.value = true
  statusMessage.value = null
  try {
    await exportBackupArchive()
    statusMessage.value = 'Backup archive exported successfully.'
  }
  catch (err: any) {
    statusMessage.value = `Export failed: ${err?.message || err}`
  }
  finally {
    isExporting.value = false
  }
}

function triggerRestore() {
  if (restoreInputRef.value) {
    restoreInputRef.value.click()
  }
}

async function handleFileRestore(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  // eslint-disable-next-line no-alert
  if (!confirm('Restoring a backup will OVERWRITE all current recordings, transcript versions, and settings. Are you sure you want to proceed?')) {
    target.value = ''
    return
  }

  isImporting.value = true
  statusMessage.value = 'Restoring backup data...'
  try {
    const res = await importBackupArchive(file)
    await store.initStore()
    apiKeyInput.value = store.openRouterApiKey
    statusMessage.value = `Backup restored successfully (${res.recordingsCount} recordings restored). Redirecting...`
    setTimeout(() => {
      window.location.href = '/history'
    }, 1000)
  }
  catch (err: any) {
    statusMessage.value = `Restore failed: ${err?.message || err}`
  }
  finally {
    isImporting.value = false
    target.value = ''
  }
}

async function handleFactoryReset() {
  // eslint-disable-next-line no-alert
  if (!confirm('WARNING: Factory Reset will permanently delete ALL recordings, audio files, and saved settings. This action cannot be undone. Are you sure?')) {
    return
  }

  isResetting.value = true
  statusMessage.value = 'Performing factory reset...'
  try {
    await performFactoryReset()
    await store.initStore()
    apiKeyInput.value = ''
    statusMessage.value = 'Factory reset complete. All data has been cleared. Redirecting...'
    setTimeout(() => {
      window.location.href = '/history'
    }, 1000)
  }
  catch (err: any) {
    statusMessage.value = `Reset failed: ${err?.message || err}`
  }
  finally {
    isResetting.value = false
  }
}
</script>

<template>
  <div class="max-w-[714px] mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
    <!-- Unboxed Page Title Header -->
    <div class="space-y-1">
      <h1 class="text-xl font-bold text-foreground tracking-tight">
        Settings
      </h1>
      <p class="text-xs font-medium text-muted-foreground">
        Configure your API key, theme, auto-translation, and backups.
      </p>
    </div>

    <!-- 1. Color Mode / Theme Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div class="space-y-1">
        <h2 class="text-sm font-bold text-foreground">
          Theme
        </h2>
        <p class="text-xs text-muted-foreground">
          Select light, dark, or follow system settings.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          size="lg"
          :variant="store.themeMode === 'light' ? 'default' : 'outline'"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          @click="store.setThemeMode('light')"
        >
          <Sun class="w-4 h-4 text-amber-500" />
          <span>Light Mode</span>
        </Button>

        <Button
          size="lg"
          :variant="store.themeMode === 'dark' ? 'default' : 'outline'"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          @click="store.setThemeMode('dark')"
        >
          <Moon class="w-4 h-4 text-indigo-400" />
          <span>Dark Mode</span>
        </Button>

        <Button
          size="lg"
          :variant="store.themeMode === 'system' ? 'default' : 'outline'"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          @click="store.setThemeMode('system')"
        >
          <Laptop class="w-4 h-4 text-muted-foreground" />
          <span>System Preference</span>
        </Button>
      </div>
    </div>

    <!-- 2. Granular Auto-Translate Options Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs">
      <div class="space-y-1 border-b border-border pb-3">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <Globe class="w-4 h-4 text-primary" />
          <span>Auto-Translate to English</span>
        </h2>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Configure where automated English translation should run using Qwen 3.7 Flash.
        </p>
      </div>

      <div class="space-y-4">
        <!-- Option 1: Record Page -->
        <div class="flex items-center justify-between gap-4">
          <div class="space-y-0.5 max-w-[80%]">
            <div class="text-xs font-bold text-foreground">
              Record Page
            </div>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              Auto-translates single-engine voice notes immediately after recording.
            </p>
          </div>
          <Switch
            v-model:checked="store.autoTranslateRecord"
            @update:checked="(val: boolean) => store.setAutoTranslateRecord(val)"
          />
        </div>

        <!-- Option 2: Compare Page -->
        <div class="flex items-center justify-between gap-4 pt-3 border-t border-border/60">
          <div class="space-y-0.5 max-w-[80%]">
            <div class="text-xs font-bold text-foreground">
              Compare Page
            </div>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              Auto-translates multi-engine benchmark results. Keep off to avoid triggering up to 4 parallel translation API calls at once.
            </p>
          </div>
          <Switch
            v-model:checked="store.autoTranslateCompare"
            @update:checked="(val: boolean) => store.setAutoTranslateCompare(val)"
          />
        </div>

        <!-- Option 3: History Page Re-transcription -->
        <div class="flex items-center justify-between gap-4 pt-3 border-t border-border/60">
          <div class="space-y-0.5 max-w-[80%]">
            <div class="text-xs font-bold text-foreground">
              History Re-transcription
            </div>
            <p class="text-[11px] text-muted-foreground leading-relaxed">
              Auto-translates newly generated versions when re-transcribing recordings with different AI models in History view.
            </p>
          </div>
          <Switch
            v-model:checked="store.autoTranslateHistory"
            @update:checked="(val: boolean) => store.setAutoTranslateHistory(val)"
          />
        </div>
      </div>
    </div>

    <!-- 3. OpenRouter API Key Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div class="space-y-1">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <Key class="w-4 h-4 text-primary" />
          <span>OpenRouter API Key</span>
        </h2>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Required for OpenRouter speech models (OpenAI GPT-Transcribe, Deepgram Nova-3, NVIDIA Parakeet). Saved locally in your browser.
        </p>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-foreground mb-1.5">
            API Key
          </label>
          <input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-or-v1-..."
            class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition shadow-xs"
          >
        </div>

        <div class="flex items-center justify-between pt-1">
          <span
            v-if="store.openRouterApiKey"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <Check class="w-3.5 h-3.5" />
            API key saved
          </span>
          <span v-else class="text-xs text-muted-foreground">
            No API key saved.
          </span>

          <Button
            variant="default"
            size="sm"
            class="font-bold cursor-pointer"
            @click="handleSaveKey"
          >
            <Check v-if="isSaved" class="w-3.5 h-3.5 text-emerald-400" />
            <span>{{ isSaved ? 'Saved' : 'Save Key' }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- 4. Data Management: Backup, Restore & Reset Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div class="space-y-1">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <Database class="w-4 h-4 text-primary" />
          <span>Data Management</span>
        </h2>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Export your data to a ZIP file, restore from a backup file, or reset the app.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <!-- Export Backup -->
        <Button
          size="lg"
          variant="outline"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          :disabled="isExporting"
          @click="handleExport"
        >
          <Download class="w-4 h-4 text-primary" />
          <span>{{ isExporting ? 'Exporting...' : 'Export Backup (.zip)' }}</span>
        </Button>

        <!-- Restore Backup -->
        <Button
          size="lg"
          variant="outline"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          :disabled="isImporting"
          @click="triggerRestore"
        >
          <Upload class="w-4 h-4 text-amber-500" />
          <span>{{ isImporting ? 'Restoring...' : 'Restore Backup' }}</span>
        </Button>

        <!-- Factory Reset -->
        <Button
          size="lg"
          variant="destructive"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12"
          :disabled="isResetting"
          @click="handleFactoryReset"
        >
          <RotateCcw class="w-4 h-4" />
          <span>{{ isResetting ? 'Resetting...' : 'Factory Reset' }}</span>
        </Button>

        <input
          ref="restoreInputRef"
          type="file"
          accept=".zip"
          class="hidden"
          @change="handleFileRestore"
        >
      </div>

      <div v-if="statusMessage" class="p-3 rounded-lg bg-muted text-xs font-medium text-foreground border border-border">
        {{ statusMessage }}
      </div>
    </div>

    <!-- Unboxed Clean Footer -->
    <div class="pt-4 text-center space-y-1">
      <p class="text-[11px] font-semibold text-muted-foreground">
        Maina Voice v0.1.0 — Desktop AI Voice Dictation & Multi-Model Benchmarking Application
      </p>
      <p class="text-[10px] text-muted-foreground/70">
        Powered by Vue 3, Vite, and OpenRouter AI APIs.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_MODELS, transcribeAudio } from '@/services/transcription-service'
import type { RecordingHistoryItem, TranscriptionVersion } from '@/stores/maina-store'
import { useMainaStore } from '@/stores/maina-store'
import { ArrowLeft, Check, Copy, DollarSign, Download, FileAudio, Pause, Play, RefreshCw, Trash2, Zap } from 'lucide-vue-next'
import { computed, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const store = useMainaStore()

const itemId = computed(() => route.params.id as string)
const item = computed<RecordingHistoryItem | undefined>(() => store.history.find(h => h.id === itemId.value))

// Always set active version to the latest one on load
if (item.value && item.value.versions.length > 0) {
  store.setActiveVersion(item.value.id, item.value.versions.length - 1)
}

const selectedModel = ref(store.selectedModel)
const isRetranscribing = ref(false)
const copiedId = ref<string | null>(null)
const isSavingAudio = ref(false)
const isSavingText = ref(false)

// Audio Player State
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
let audioElement: HTMLAudioElement | null = null

function initAudio() {
  if (!item.value?.audioFilePath) return
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
  audioElement = new Audio(item.value.audioFilePath)
  audioElement.onloadedmetadata = () => {
    duration.value = audioElement?.duration || 0
  }
  audioElement.ontimeupdate = () => {
    currentTime.value = audioElement?.currentTime || 0
  }
  audioElement.onended = () => {
    isPlaying.value = false
    currentTime.value = 0
  }
}

initAudio()

function togglePlay() {
  if (!audioElement) initAudio()
  if (!audioElement) return

  if (isPlaying.value) {
    audioElement.pause()
    isPlaying.value = false
  }
  else {
    audioElement.play().then(() => {
      isPlaying.value = true
    }).catch(e => alert(`Audio playback error: ${e?.message || e}`))
  }
}

function seekAudio(event: Event) {
  const target = event.target as HTMLInputElement
  const val = Number.parseFloat(target.value)
  if (audioElement) {
    audioElement.currentTime = val
    currentTime.value = val
  }
}

function formatTime(sec: number) {
  if (Number.isNaN(sec) || !Number.isFinite(sec)) return '00:00'
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function formatTimestamp(isoStr: string) {
  const d = new Date(isoStr)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

const activeVersion = computed<TranscriptionVersion | undefined>(() => {
  if (!item.value) return undefined
  return item.value.versions[item.value.activeVersionIndex] || item.value.versions[0]
})

async function runReTranscription() {
  if (!item.value?.audioFilePath) return
  isRetranscribing.value = true
  try {
    const result = await transcribeAudio(
      item.value.audioFilePath,
      selectedModel.value,
      store.openRouterApiKey,
      60,
    )
    store.addVersionToItem(item.value.id, result)
  }
  catch (err: any) {
    alert(`Re-transcription failed: ${err?.message || err}`)
  }
  finally {
    isRetranscribing.value = false
  }
}

function copyText(text?: string) {
  if (!text) return
  navigator.clipboard.writeText(text)
  copiedId.value = 'copied'
  setTimeout(() => (copiedId.value = null), 2000)
}

async function saveAudio() {
  if (!item.value?.audioFilePath || !store.isNativeTauri) return
  try {
    isSavingAudio.value = true
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_audio_file', {
      sourcePath: item.value.audioFilePath,
      defaultName: `maina_recording_${item.value.id}.wav`,
    })
  }
  catch (err: any) {
    if (!String(err).includes('cancelled'))
      alert(`Save audio failed: ${err?.message || err}`)
  }
  finally {
    isSavingAudio.value = false
  }
}

async function saveTranscript() {
  if (!activeVersion.value?.text || !store.isNativeTauri) return
  try {
    isSavingText.value = true
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_text_file', {
      content: activeVersion.value.text,
      defaultName: `transcript_${item.value?.id}_v${activeVersion.value.versionNumber}.txt`,
    })
  }
  catch (err: any) {
    if (!String(err).includes('cancelled'))
      alert(`Export failed: ${err?.message || err}`)
  }
  finally {
    isSavingText.value = false
  }
}

function deleteRecording() {
  if (!item.value) return
  store.deleteHistoryItem(item.value.id)
  router.push('/history')
}

onUnmounted(() => {
  if (audioElement) {
    audioElement.pause()
    audioElement = null
  }
})
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Back Header Navigation -->
    <div class="flex items-center justify-between">
      <Button
        variant="ghost"
        size="sm"
        class="font-semibold cursor-pointer text-muted-foreground hover:text-foreground -ml-2"
        @click="router.push('/history')"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back to History
      </Button>

      <span v-if="item" class="text-xs text-muted-foreground font-medium">
        Recorded: {{ formatTimestamp(item.createdAt) }}
      </span>
    </div>

    <!-- Missing Item State -->
    <div v-if="!item" class="p-12 rounded-xl border border-border bg-card text-center space-y-3">
      <p class="text-sm font-semibold text-muted-foreground">Recording not found.</p>
      <Button size="sm" @click="router.push('/history')">Return to History</Button>
    </div>

    <template v-else>
      <!-- Audio Player Control Card -->
      <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <Button
              variant="default"
              size="icon"
              class="w-12 h-12 rounded-full cursor-pointer shadow-sm"
              @click="togglePlay"
            >
              <Pause v-if="isPlaying" class="w-5 h-5 fill-white" />
              <Play v-else class="w-5 h-5 fill-white ml-0.5" />
            </Button>

            <div>
              <h2 class="text-sm font-bold text-foreground">Audio Recording</h2>
              <p class="text-xs text-muted-foreground font-medium">
                {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
              </p>
            </div>
          </div>

          <!-- Save Audio Action -->
          <Button
            v-if="store.isNativeTauri && item.audioFilePath"
            variant="outline"
            size="sm"
            class="font-semibold cursor-pointer border-border"
            :disabled="isSavingAudio"
            @click="saveAudio"
          >
            <Download class="w-3.5 h-3.5 mr-1.5" />
            Save Audio (.wav)
          </Button>
        </div>

        <!-- Audio Progress Seekbar -->
        <div class="flex items-center gap-3 pt-1">
          <span class="text-[11px] font-mono text-muted-foreground w-10 text-right">{{ formatTime(currentTime) }}</span>
          <input
            type="range"
            min="0"
            :max="duration || 100"
            step="0.1"
            :value="currentTime"
            class="flex-1 accent-primary h-1.5 bg-secondary rounded-lg cursor-pointer"
            @input="seekAudio"
          >
          <span class="text-[11px] font-mono text-muted-foreground w-10">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Re-Transcription Workbench Card -->
      <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Re-Transcription Workbench
        </h3>

        <div class="flex flex-wrap items-center gap-3">
          <div class="flex-1 min-w-[260px]">
            <Select v-model="selectedModel">
              <SelectTrigger class="w-full bg-background border-border text-foreground font-medium text-xs h-9">
                <SelectValue placeholder="Select Model for Re-transcription" />
              </SelectTrigger>
              <SelectContent class="bg-card border-border text-card-foreground">
                <SelectGroup>
                  <SelectLabel class="text-muted-foreground font-bold text-[10px] uppercase tracking-wider px-2 py-1">
                    OpenRouter Cloud Models
                  </SelectLabel>
                  <SelectItem
                    v-for="m in ALL_MODELS"
                    :key="m.id"
                    :value="m.id"
                    class="text-xs cursor-pointer"
                  >
                    {{ m.name }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="default"
            size="sm"
            class="font-bold cursor-pointer h-9 px-4"
            :disabled="isRetranscribing"
            @click="runReTranscription"
          >
            <RefreshCw class="w-3.5 h-3.5 mr-1.5" :class="{ 'animate-spin': isRetranscribing }" />
            <span>{{ isRetranscribing ? 'Transcribing...' : 'Run New Transcription' }}</span>
          </Button>
        </div>
      </div>

      <!-- Versions Workspace Card -->
      <div class="rounded-xl border border-border bg-card p-6 space-y-5 shadow-xs">
        <!-- Version Switcher Select Dropdown & Metrics -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-muted-foreground shrink-0">Version:</span>
            <Select
              :model-value="String(item.activeVersionIndex)"
              @update:model-value="(val) => item && store.setActiveVersion(item.id, Number(val))"
            >
              <SelectTrigger class="w-[240px] bg-background border-border text-foreground font-semibold text-xs h-8">
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>
              <SelectContent class="bg-card border-border text-card-foreground">
                <SelectGroup>
                  <SelectItem
                    v-for="(ver, idx) in item.versions"
                    :key="ver.versionNumber"
                    :value="String(idx)"
                    class="text-xs cursor-pointer font-medium"
                  >
                    v{{ ver.versionNumber }} ({{ ver.engineName }})
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div v-if="activeVersion" class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
              <Zap class="w-3.5 h-3.5 text-amber-600" />
              {{ store.formatDuration(activeVersion.latencyMs) }}
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
              {{ activeVersion.wordCount }} words
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
              <DollarSign class="w-3.5 h-3.5 text-emerald-600" />
              ${{ activeVersion.costEstimate.toFixed(5) }}
            </span>
          </div>
        </div>

        <!-- Selected Version Transcript -->
        <div v-if="activeVersion" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-primary px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20">
              Engine: {{ activeVersion.engineName }}
            </span>

            <div class="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                class="font-semibold cursor-pointer border-border"
                @click="copyText(activeVersion.text)"
              >
                <Check v-if="copiedId === 'copied'" class="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <Copy v-else class="w-3.5 h-3.5 mr-1" />
                <span>{{ copiedId === 'copied' ? 'Copied!' : 'Copy' }}</span>
              </Button>

              <Button
                v-if="store.isNativeTauri"
                variant="outline"
                size="sm"
                class="font-semibold cursor-pointer border-border"
                :disabled="isSavingText"
                @click="saveTranscript"
              >
                <FileAudio class="w-3.5 h-3.5 mr-1" />
                <span>Export .txt</span>
              </Button>
            </div>
          </div>

          <div class="min-h-[180px] max-h-[450px] overflow-y-auto rounded-lg bg-background p-5 border border-border text-foreground text-base leading-relaxed select-text font-normal">
            {{ activeVersion.text }}
          </div>
        </div>
      </div>

      <!-- Delete Recording Danger Zone -->
      <div class="flex justify-end pt-2">
        <Button
          variant="destructive"
          size="sm"
          class="font-bold cursor-pointer"
          @click="deleteRecording"
        >
          <Trash2 class="w-3.5 h-3.5 mr-1.5" />
          Delete Entire Recording
        </Button>
      </div>
    </template>
  </div>
</template>

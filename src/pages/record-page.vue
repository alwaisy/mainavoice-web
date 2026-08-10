<script setup lang="ts">
import ModelInfoModal from '@/components/model-info-modal.vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_MODELS, transcribeAudio } from '@/services/transcription-service'
import type { TranscriptionVersion } from '@/stores/maina-store'
import { useMainaStore } from '@/stores/maina-store'
import { Check, Copy, DollarSign, Download, FileAudio, HelpCircle, Mic, Plus, Square, Upload, Zap } from 'lucide-vue-next'
import { onUnmounted, ref } from 'vue'

const store = useMainaStore()
const isInfoOpen = ref(false)
const isRecording = ref(false)
const isProcessing = ref(false)
const recordSeconds = ref(0)
const isCopied = ref(false)
const activeResult = ref<TranscriptionVersion | null>(null)
const activeAudioPath = ref<string | null>(null)
const isSavingAudio = ref(false)
const isSavingText = ref(false)

let timer: number | null = null
let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []

function startTimer() {
  recordSeconds.value = 0
  timer = window.setInterval(() => {
    recordSeconds.value++
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const micError = ref<string | null>(null)

async function getMicrophoneStream() {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: true })
  }
  catch (e1) {
    try {
      return await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    }
    catch {
      throw e1
    }
  }
}

const isNativeTauri = ref(
  typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window),
)

async function toggleRecording() {
  micError.value = null
  if (isRecording.value) {
    stopTimer()
    isRecording.value = false
    isProcessing.value = true

    if (isNativeTauri.value) {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        const audioPath = (await invoke('stop_native_recording')) as string
        const duration = Math.max(recordSeconds.value, 1)

        const result = await transcribeAudio(
          audioPath,
          store.selectedModel,
          store.openRouterApiKey,
          duration,
        )

        activeResult.value = result
        activeAudioPath.value = audioPath
        isProcessing.value = false

        if (result.text && !result.text.startsWith('Error') && !result.text.startsWith('Transcription Error')) {
          store.addOrUpdateHistoryItem(audioPath, result)
        }
      }
      catch (err: any) {
        micError.value = `Native Rust recording error: ${err?.message || err}`
        isProcessing.value = false
      }
    }
    else {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
      }
    }
  }
  else {
    if (isNativeTauri.value) {
      try {
        const { invoke } = await import('@tauri-apps/api/core')
        await invoke('start_native_recording')
        startTimer()
        isRecording.value = true
        activeResult.value = null
        activeAudioPath.value = null
      }
      catch (err: any) {
        micError.value = `Native Rust recording error: ${err?.message || err}`
        isProcessing.value = false
      }
    }
    else {
      try {
        const stream = await getMicrophoneStream()
        audioChunks = []
        mediaRecorder = new MediaRecorder(stream)

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.push(event.data)
        }

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
          const audioUrl = URL.createObjectURL(audioBlob)
          const duration = Math.max(recordSeconds.value, 1)

          const result = await transcribeAudio(
            audioUrl,
            store.selectedModel,
            store.openRouterApiKey,
            duration,
          )

          activeResult.value = result
          activeAudioPath.value = audioUrl
          isProcessing.value = false

          if (result.text && !result.text.startsWith('Error')) {
            store.addOrUpdateHistoryItem(audioUrl, result)
          }

          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        startTimer()
        isRecording.value = true
        activeResult.value = null
        activeAudioPath.value = null
      }
      catch (err: any) {
        micError.value = err?.message || String(err)
        isProcessing.value = false
      }
    }
  }
}

// Feature 1 — Upload external audio file
async function uploadAudioFile() {
  if (!isNativeTauri.value) return
  try {
    const { invoke } = await import('@tauri-apps/api/core')
    const filePath = (await invoke('pick_audio_file')) as string | null
    if (!filePath) return

    isProcessing.value = true
    activeResult.value = null

    const result = await transcribeAudio(
      filePath,
      store.selectedModel,
      store.openRouterApiKey,
      60, // estimate 60s for uploaded files
    )

    activeResult.value = result
    activeAudioPath.value = filePath
    isProcessing.value = false

    if (result.text && !result.text.startsWith('Error') && !result.text.startsWith('Transcription Error')) {
      store.addOrUpdateHistoryItem(filePath, result)
    }
  }
  catch (err: any) {
    micError.value = `Upload error: ${err?.message || err}`
    isProcessing.value = false
  }
}

// Feature 3 — Save audio recording
async function saveAudio() {
  if (!activeAudioPath.value || !isNativeTauri.value) return
  try {
    isSavingAudio.value = true
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_audio_file', {
      sourcePath: activeAudioPath.value,
      defaultName: `maina_recording_${Date.now()}.wav`,
    })
  }
  catch (err: any) {
    if (!String(err).includes('cancelled')) {
      micError.value = `Save error: ${err?.message || err}`
    }
  }
  finally {
    isSavingAudio.value = false
  }
}

// Feature 3 — Export transcript as .txt
async function saveTranscript() {
  if (!activeResult.value?.text || !isNativeTauri.value) return
  try {
    isSavingText.value = true
    const { invoke } = await import('@tauri-apps/api/core')
    await invoke('save_text_file', {
      content: activeResult.value.text,
      defaultName: `transcript_${Date.now()}.txt`,
    })
  }
  catch (err: any) {
    if (!String(err).includes('cancelled')) {
      micError.value = `Export error: ${err?.message || err}`
    }
  }
  finally {
    isSavingText.value = false
  }
}

function copyText() {
  if (!activeResult.value?.text) return
  navigator.clipboard.writeText(activeResult.value.text)
  isCopied.value = true
  setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

function clearScreen() {
  activeResult.value = null
  activeAudioPath.value = null
}

function formatRecordTime(totalSec: number) {
  const m = Math.floor(totalSec / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-300">
    <!-- Model Picker Bar -->
    <div class="flex items-center justify-center">
      <div class="inline-flex items-center gap-2 p-1.5 rounded-xl border border-border bg-card shadow-xs">
        <Select v-model="store.selectedModel">
          <SelectTrigger class="w-[300px] border-none bg-transparent shadow-none text-foreground font-semibold text-xs h-8">
            <SelectValue placeholder="Select STT Model" />
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
                class="text-xs cursor-pointer font-medium"
              >
                {{ m.name }}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="icon-sm"
          title="View Model Specs & Guide"
          class="text-muted-foreground hover:text-foreground cursor-pointer"
          @click="isInfoOpen = true"
        >
          <HelpCircle class="w-4 h-4" />
        </Button>
      </div>
    </div>

    <!-- Microphone Access Error Banner -->
    <div
      v-if="micError"
      class="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200"
    >
      <span>{{ micError }}</span>
      <Button
        size="sm"
        variant="outline"
        class="h-7 text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive/20 cursor-pointer ml-3 shrink-0"
        @click="micError = null"
      >
        Dismiss
      </Button>
    </div>

    <!-- Hero Recording Card -->
    <div class="rounded-xl border border-border bg-card p-10 flex flex-col items-center justify-center space-y-5 shadow-xs">
      <button
        class="relative group focus:outline-none cursor-pointer"
        :disabled="isProcessing"
        @click="toggleRecording"
      >
        <!-- Pulse Animation Ring -->
        <div
          v-if="isRecording"
          class="absolute -inset-3 rounded-full bg-destructive/30 animate-ping"
        />

        <div
          class="w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-md"
          :class="
            isRecording
              ? 'bg-destructive shadow-destructive/40 scale-105'
              : (isProcessing
                ? 'bg-muted opacity-60 cursor-not-allowed'
                : 'bg-primary text-primary-foreground hover:scale-105 shadow-primary/20')
          "
        >
          <Square v-if="isRecording" class="w-8 h-8 text-white fill-white" />
          <Mic v-else class="w-10 h-10 text-primary-foreground" />
        </div>
      </button>

      <div class="text-center">
        <p v-if="isRecording" class="text-base font-bold text-destructive animate-pulse">
          Recording... ({{ formatRecordTime(recordSeconds) }})
        </p>
        <p v-else-if="isProcessing" class="text-sm font-semibold text-primary">
          Transcribing Audio...
        </p>
        <p v-else class="text-sm font-semibold text-muted-foreground">
          Click to Record Voice Note
        </p>
      </div>

      <!-- Feature 1: Upload Audio File Button -->
      <Button
        v-if="isNativeTauri && !isRecording && !isProcessing"
        variant="outline"
        size="sm"
        class="font-semibold cursor-pointer border-border text-muted-foreground hover:text-foreground"
        @click="uploadAudioFile"
      >
        <Upload class="w-3.5 h-3.5" />
        <span>Upload Audio File</span>
      </Button>
    </div>

    <!-- Result Display Section -->
    <div class="space-y-4">
      <div v-if="isProcessing" class="p-12 rounded-xl border border-border bg-card text-center space-y-3 shadow-xs">
        <div class="w-8 h-8 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <p class="text-xs font-semibold text-muted-foreground">
          Processing voice audio...
        </p>
      </div>

      <div v-else-if="activeResult" class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
        <!-- Metrics Header & Action Buttons -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-secondary text-secondary-foreground border border-border">
              <Zap class="w-3.5 h-3.5 text-amber-600" />
              {{ store.formatDuration(activeResult.latencyMs) }}
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-secondary text-secondary-foreground border border-border">
              {{ activeResult.wordCount }} words
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-secondary text-secondary-foreground border border-border">
              <DollarSign class="w-3.5 h-3.5 text-emerald-600" />
              ${{ activeResult.costEstimate.toFixed(5) }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Copy Text -->
            <Button variant="default" size="sm" class="font-bold cursor-pointer" @click="copyText">
              <Check v-if="isCopied" class="w-3.5 h-3.5" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ isCopied ? 'Copied!' : 'Copy Text' }}</span>
            </Button>

            <!-- Feature 3: Export Transcript -->
            <Button
              v-if="isNativeTauri"
              variant="outline"
              size="sm"
              class="font-bold cursor-pointer"
              :disabled="isSavingText"
              @click="saveTranscript"
            >
              <FileAudio class="w-3.5 h-3.5" />
              <span>Export .txt</span>
            </Button>

            <!-- Feature 3: Save Audio -->
            <Button
              v-if="isNativeTauri && activeAudioPath"
              variant="outline"
              size="sm"
              class="font-bold cursor-pointer"
              :disabled="isSavingAudio"
              @click="saveAudio"
            >
              <Download class="w-3.5 h-3.5" />
              <span>Save Audio</span>
            </Button>

            <!-- New Note -->
            <Button variant="ghost" size="sm" class="font-bold cursor-pointer" @click="clearScreen">
              <Plus class="w-3.5 h-3.5" />
              <span>New Note</span>
            </Button>
          </div>
        </div>

        <!-- Raw Text Output Container -->
        <div class="min-h-[140px] max-h-[350px] overflow-y-auto rounded-lg bg-background p-4 border border-border text-foreground text-base leading-relaxed select-text font-normal">
          {{ activeResult.text }}
        </div>
      </div>

      <!-- Idle Empty State -->
      <div v-else class="p-12 rounded-xl border border-border bg-card text-center space-y-2 shadow-xs">
        <p class="text-sm font-medium text-muted-foreground">
          Your raw transcription output will appear here.
        </p>
      </div>
    </div>

    <!-- Model Info Specs Modal -->
    <ModelInfoModal
      :is-open="isInfoOpen"
      @close="isInfoOpen = false"
    />
  </div>
</template>

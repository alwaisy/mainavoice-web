<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ALL_MODELS, transcribeAudio } from '@/services/transcription-service'
import type { TranscriptionVersion } from '@/stores/maina-store'
import { useMainaStore } from '@/stores/maina-store'
import { Check, Copy, Mic, Square, Trophy, Zap } from 'lucide-vue-next'
import { computed, onUnmounted, ref } from 'vue'

const store = useMainaStore()
const isRecording = ref(false)
const isProcessing = ref(false)
const recordSeconds = ref(0)

const selectedModel1 = ref('openai/gpt-transcribe')
const selectedModel2 = ref('deepgram/nova-3')

const result1 = ref<TranscriptionVersion | null>(null)
const result2 = ref<TranscriptionVersion | null>(null)
const isCopied1 = ref(false)
const isCopied2 = ref(false)

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
    catch (e2) {
      throw e1
    }
  }
}

const isNativeTauri = ref(
  typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window),
)

async function toggleBenchmarkRecording() {
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

        const promise1 = transcribeAudio(audioPath, selectedModel1.value, store.openRouterApiKey, duration)
        const promise2 = transcribeAudio(audioPath, selectedModel2.value, store.openRouterApiKey, duration)

        const [res1, res2] = await Promise.all([promise1, promise2])

        result1.value = res1
        result2.value = res2
        isProcessing.value = false
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
        result1.value = null
        result2.value = null
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

          const promise1 = transcribeAudio(audioUrl, selectedModel1.value, store.openRouterApiKey, duration)
          const promise2 = transcribeAudio(audioUrl, selectedModel2.value, store.openRouterApiKey, duration)

          const [res1, res2] = await Promise.all([promise1, promise2])

          result1.value = res1
          result2.value = res2
          isProcessing.value = false

          stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.start()
        startTimer()
        isRecording.value = true
        result1.value = null
        result2.value = null
      }
      catch (err: any) {
        micError.value = err?.message || String(err)
        isProcessing.value = false
      }
    }
  }
}

function copyText(text: string, isEngine1: boolean) {
  navigator.clipboard.writeText(text)
  if (isEngine1) {
    isCopied1.value = true
    setTimeout(() => (isCopied1.value = false), 2000)
  }
  else {
    isCopied2.value = true
    setTimeout(() => (isCopied2.value = false), 2000)
  }
}

const speedLeaderboardText = computed(() => {
  if (!result1.value || !result2.value) return ''
  const r1 = result1.value
  const r2 = result2.value
  if (r1.latencyMs <= r2.latencyMs) {
    const ratio = (r2.latencyMs / Math.max(r1.latencyMs, 1)).toFixed(1)
    return `${r1.engineName} was ${ratio}x faster than ${r2.engineName}!`
  }
  else {
    const ratio = (r1.latencyMs / Math.max(r2.latencyMs, 1)).toFixed(1)
    return `${r2.engineName} was ${ratio}x faster than ${r1.engineName}!`
  }
})

function formatRecordTime(totalSec: number) {
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0')
  const s = (totalSec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

onUnmounted(() => {
  stopTimer()
})
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Unboxed Header Title -->
    <div class="space-y-1">
      <h1 class="text-xl font-bold text-foreground tracking-tight">
        Compare Engines Mode
      </h1>
      <p class="text-xs font-medium text-muted-foreground">
        Parallel Dual-Engine Latency & Accuracy Benchmark (Choose Any 2 Cloud AI Engines)
      </p>
    </div>

    <!-- Engine Pickers Card -->
    <div class="rounded-xl border border-border bg-card p-5 shadow-xs">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Engine 1 Selector -->
        <div>
          <label class="block text-xs font-semibold text-muted-foreground mb-1.5">
            Engine 1 Model
          </label>
          <Select v-model="selectedModel1">
            <SelectTrigger class="w-full bg-background border-border text-foreground text-xs font-semibold h-9">
              <SelectValue placeholder="Select Engine 1" />
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
                  class="text-xs font-medium cursor-pointer"
                >
                  {{ m.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <!-- Engine 2 Selector -->
        <div>
          <label class="block text-xs font-semibold text-muted-foreground mb-1.5">
            Engine 2 Model
          </label>
          <Select v-model="selectedModel2">
            <SelectTrigger class="w-full bg-background border-border text-foreground text-xs font-semibold h-9">
              <SelectValue placeholder="Select Engine 2" />
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
                  class="text-xs font-medium cursor-pointer"
                >
                  {{ m.name }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Microphone Access Error Banner -->
    <div
      v-if="micError"
      class="p-4 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200"
    >
      <span>Microphone Error: {{ micError }}. Please allow microphone permission in your OS settings.</span>
      <Button
        size="sm"
        variant="outline"
        class="h-7 text-xs font-bold border-destructive/30 text-destructive hover:bg-destructive/20 cursor-pointer ml-3 shrink-0"
        @click="micError = null"
      >
        Dismiss
      </Button>
    </div>

    <!-- Record Button Bar -->
    <div class="rounded-xl border border-border bg-card p-4 flex justify-center shadow-xs">
      <Button
        :variant="isRecording ? 'destructive' : 'default'"
        size="lg"
        class="font-bold cursor-pointer"
        :disabled="isProcessing"
        @click="toggleBenchmarkRecording"
      >
        <Square v-if="isRecording" class="w-3.5 h-3.5 fill-white" />
        <Mic v-else class="w-3.5 h-3.5" />
        <span>{{ isRecording ? `Stop Benchmark (${formatRecordTime(recordSeconds)})` : 'Record & Compare Both Engines' }}</span>
      </Button>
    </div>

    <!-- Results Display -->
    <div v-if="isProcessing" class="p-12 rounded-xl border border-border bg-card text-center space-y-3 shadow-xs">
      <div class="w-8 h-8 mx-auto border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p class="text-xs font-semibold text-muted-foreground">
        Benchmarking both engines in parallel...
      </p>
    </div>

    <div v-else-if="result1 && result2" class="space-y-4">
      <!-- Speed Leaderboard Banner -->
      <div class="p-3.5 rounded-lg border border-border bg-accent text-accent-foreground flex items-center justify-center gap-2 text-xs font-bold shadow-xs text-center">
        <Trophy class="w-4 h-4 text-amber-600 shrink-0" />
        <span>{{ speedLeaderboardText }}</span>
      </div>

      <!-- Side-by-Side Dual Columns -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Engine 1 Column -->
        <div class="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
          <div class="flex items-center justify-between border-b border-border pb-2.5">
            <h3 class="font-bold text-xs text-foreground">
              Engine 1 ({{ result1.engineName }})
            </h3>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-secondary text-secondary-foreground border border-border">
              <Zap class="w-3 h-3 text-amber-600" />
              {{ store.formatDuration(result1.latencyMs) }}
            </span>
          </div>
          <div class="h-44 overflow-y-auto rounded-lg bg-background p-3 text-xs text-foreground border border-border leading-relaxed select-text font-normal">
            {{ result1.text }}
          </div>
          <div class="flex justify-end">
            <Button size="sm" class="font-bold cursor-pointer" @click="copyText(result1.text, true)">
              <Check v-if="isCopied1" class="w-3 h-3 text-emerald-400" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ isCopied1 ? 'Copied' : 'Copy' }}</span>
            </Button>
          </div>
        </div>

        <!-- Engine 2 Column -->
        <div class="rounded-xl border border-border bg-card p-4 space-y-3 shadow-xs">
          <div class="flex items-center justify-between border-b border-border pb-2.5">
            <h3 class="font-bold text-xs text-foreground">
              Engine 2 ({{ result2.engineName }})
            </h3>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-secondary text-secondary-foreground border border-border">
              <Zap class="w-3 h-3 text-amber-600" />
              {{ store.formatDuration(result2.latencyMs) }}
            </span>
          </div>
          <div class="h-44 overflow-y-auto rounded-lg bg-background p-3 text-xs text-foreground border border-border leading-relaxed select-text font-normal">
            {{ result2.text }}
          </div>
          <div class="flex justify-end">
            <Button size="sm" class="font-bold cursor-pointer" @click="copyText(result2.text, false)">
              <Check v-if="isCopied2" class="w-3 h-3 text-emerald-400" />
              <Copy v-else class="w-3 h-3" />
              <span>{{ isCopied2 ? 'Copied' : 'Copy' }}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="p-12 rounded-xl border border-border bg-card text-center text-xs font-medium text-muted-foreground shadow-xs">
      Record audio above to benchmark any 2 engines side-by-side.
    </div>
  </div>
</template>

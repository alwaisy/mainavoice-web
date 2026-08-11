<script setup lang="ts">
import type { RecordingHistoryItem } from '@/stores/maina-store'
import { ExternalLink, Pause, Play, Search, Swords, Trash2, Trophy, Zap } from 'lucide-vue-next'
import { computed, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { autoTransliterateIfUrduRegion } from '@/services/transliteration-service'
import { useMainaStore } from '@/stores/maina-store'

const store = useMainaStore()
const searchQuery = ref('')

// Audio player singleton state
const currentlyPlayingId = ref<string | null>(null)
let currentAudioInstance: HTMLAudioElement | null = null

const filteredHistory = computed(() => {
  if (!searchQuery.value.trim())
    return store.history
  const q = searchQuery.value.toLowerCase()
  return store.history.filter((item: RecordingHistoryItem) => {
    const currentVer = item.versions[item.activeVersionIndex] || item.versions[0]
    return (
      currentVer?.text.toLowerCase().includes(q)
      || currentVer?.engineName.toLowerCase().includes(q)
      || item.versions.some(v => v.engineName.toLowerCase().includes(q) || v.text.toLowerCase().includes(q))
    )
  })
})

async function toggleQuickPlay(id: string, fallbackPath?: string, event?: Event) {
  if (event)
    event.stopPropagation()

  // 1. If user clicks the currently playing audio card -> Pause it
  if (currentlyPlayingId.value === id && currentAudioInstance) {
    currentAudioInstance.pause()
    currentlyPlayingId.value = null
    return
  }

  // 2. Stop any previously playing audio before starting new audio
  if (currentAudioInstance) {
    currentAudioInstance.pause()
    currentAudioInstance = null
    currentlyPlayingId.value = null
  }

  // 3. Resolve IndexedDB blob URL
  const src = await store.getAudioUrlForRecording(id, fallbackPath)
  if (!src) {
    console.warn('Audio file not found.')
    return
  }

  try {
    const audio = new Audio(src)
    currentAudioInstance = audio
    currentlyPlayingId.value = id

    audio.onended = () => {
      if (currentlyPlayingId.value === id) {
        currentlyPlayingId.value = null
        currentAudioInstance = null
      }
    }

    await audio.play()
  }
  catch (e: any) {
    currentlyPlayingId.value = null
    currentAudioInstance = null
    console.error(`Audio playback error: ${e?.message || e}`)
  }
}

function formatTimestamp(isoStr: string) {
  const d = new Date(isoStr)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d
    .getHours()
    .toString()
    .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onUnmounted(() => {
  if (currentAudioInstance) {
    currentAudioInstance.pause()
    currentAudioInstance = null
  }
})
</script>

<template>
  <div class="max-w-[714px] mx-auto space-y-6 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
    <!-- Search Bar & Clear All -->
    <div class="flex items-center justify-between gap-4">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search transcripts or models..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-card border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition shadow-xs"
        >
      </div>

      <Button
        v-if="store.history.length > 0"
        variant="destructive"
        size="sm"
        class="font-bold cursor-pointer"
        @click="store.clearAllHistory()"
      >
        <Trash2 class="w-3.5 h-3.5" />
        <span>Clear history</span>
      </Button>
    </div>

    <!-- History List Items -->
    <div v-if="filteredHistory.length > 0" class="space-y-4">
      <div
        v-for="item in filteredHistory"
        :key="item.id"
        class="rounded-xl border border-border bg-card p-5 space-y-3.5 shadow-xs hover:border-primary/40 transition group"
      >
        <!-- ================================================================= -->
        <!-- OPTION A: COMPARISON SUITE CARD -->
        <!-- ================================================================= -->
        <div v-if="item.isComparisonSuite" class="space-y-3">
          <!-- Suite Header -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-primary text-primary-foreground">
                <Swords class="w-3 h-3" />
                Comparison Suite
              </span>
              <span class="text-xs text-muted-foreground font-medium">
                {{ formatTimestamp(item.createdAt) }}
              </span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                {{ item.versions.length }} Models Tested
              </span>
            </div>

            <!-- Winner Badge -->
            <div v-if="item.versions[item.activeVersionIndex]" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <Trophy class="w-3 h-3 text-amber-600" />
              <span>Winner: {{ item.versions[item.activeVersionIndex]?.engineName }}</span>
            </div>
          </div>

          <!-- Model Breakdown List -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs py-1">
            <div
              v-for="(ver, idx) in item.versions"
              :key="idx"
              class="p-2.5 rounded-lg border border-border bg-muted/40 flex items-center justify-between gap-2"
              :class="[idx === item.activeVersionIndex ? 'border-amber-500/40 bg-amber-500/5' : '']"
            >
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="font-bold text-foreground text-xs truncate">{{ ver.engineName }}</span>
                <span v-if="idx === item.activeVersionIndex" class="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  Fastest
                </span>
              </div>
              <div class="flex items-center gap-2 shrink-0 text-[11px] text-muted-foreground font-mono">
                <span>⚡ {{ store.formatDuration(ver.latencyMs) }}</span>
                <span>{{ ver.wordCount }} words</span>
              </div>
            </div>
          </div>

          <!-- Winner Transcript Preview -->
          <p v-if="item.versions[item.activeVersionIndex]" class="text-xs text-foreground/90 line-clamp-2 leading-relaxed font-normal italic bg-background p-3 rounded-lg border border-border">
            "{{ autoTransliterateIfUrduRegion(item.versions[item.activeVersionIndex]!.text) }}"
          </p>

          <!-- Card Actions -->
          <div class="flex items-center justify-between pt-1">
            <Button
              v-if="item.audioFilePath"
              :variant="currentlyPlayingId === item.id ? 'default' : 'secondary'"
              size="sm"
              class="font-bold cursor-pointer border border-border h-7 text-xs transition-all duration-200"
              @click.stop="toggleQuickPlay(item.id, item.audioFilePath, $event)"
            >
              <Pause v-if="currentlyPlayingId === item.id" class="w-3 h-3 fill-current mr-1" />
              <Play v-else class="w-3 h-3 text-primary fill-primary mr-1" />
              <span>{{ currentlyPlayingId === item.id ? 'Pause' : 'Quick Play Audio' }}</span>
            </Button>
            <div v-else />

            <Button
              as-child
              variant="outline"
              size="sm"
              class="font-bold cursor-pointer h-7 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition"
            >
              <RouterLink :to="`/history/${item.id}`">
                <span>Open {{ item.versions.length }}-Model Suite</span>
                <ExternalLink class="w-3 h-3 ml-1" />
              </RouterLink>
            </Button>
          </div>
        </div>

        <!-- ================================================================= -->
        <!-- OPTION B: STANDARD SINGLE RECORDING CARD -->
        <!-- ================================================================= -->
        <div v-else-if="item.versions.length > 0" class="space-y-3">
          <!-- Item Header: Primary Engine + Date + Versions Badge + Metrics -->
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded text-[11px] font-bold bg-primary text-primary-foreground">
                {{ item.versions[item.activeVersionIndex]?.engineName || 'Engine' }}
              </span>
              <span class="text-xs text-muted-foreground font-medium">
                {{ formatTimestamp(item.createdAt) }}
              </span>
              <span v-if="item.versions.length > 1" class="text-[10px] font-bold px-2 py-0.5 rounded bg-secondary text-secondary-foreground border border-border">
                {{ item.versions.length }} versions
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span v-if="item.versions[item.activeVersionIndex]" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                <Zap class="w-3 h-3 text-amber-600" />
                {{ store.formatDuration(item.versions[item.activeVersionIndex]!.latencyMs) }}
              </span>
              <span v-if="item.versions[item.activeVersionIndex]" class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-secondary text-secondary-foreground border border-border">
                {{ item.versions[item.activeVersionIndex]!.wordCount }} words
              </span>
            </div>
          </div>

          <!-- Transcript Preview -->
          <p v-if="item.versions[item.activeVersionIndex]" class="text-xs text-foreground/90 line-clamp-2 leading-relaxed font-normal">
            {{ autoTransliterateIfUrduRegion(item.versions[item.activeVersionIndex]!.text) }}
          </p>

          <!-- Card Actions -->
          <div class="flex items-center justify-between pt-1">
            <Button
              v-if="item.audioFilePath"
              :variant="currentlyPlayingId === item.id ? 'default' : 'secondary'"
              size="sm"
              class="font-bold cursor-pointer border border-border h-7 text-xs transition-all duration-200"
              @click.stop="toggleQuickPlay(item.id, item.audioFilePath, $event)"
            >
              <Pause v-if="currentlyPlayingId === item.id" class="w-3 h-3 fill-current mr-1" />
              <Play v-else class="w-3 h-3 text-primary fill-primary mr-1" />
              <span>{{ currentlyPlayingId === item.id ? 'Pause' : 'Quick Play' }}</span>
            </Button>
            <div v-else />

            <Button
              as-child
              variant="outline"
              size="sm"
              class="font-bold cursor-pointer h-7 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition"
            >
              <RouterLink :to="`/history/${item.id}`">
                <span>Open Workbench</span>
                <ExternalLink class="w-3 h-3 ml-1" />
              </RouterLink>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty History View -->
    <div v-else class="p-12 rounded-xl border border-border bg-card text-center space-y-2 shadow-xs">
      <p class="text-sm font-medium text-muted-foreground">
        {{ searchQuery ? 'No matching transcripts found.' : 'No saved recording history yet.' }}
      </p>
    </div>
  </div>
</template>

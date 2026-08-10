<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { RecordingHistoryItem } from '@/stores/maina-store'
import { useMainaStore } from '@/stores/maina-store'
import { ExternalLink, Play, Search, Trash2, Zap } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useMainaStore()
const searchQuery = ref('')

const filteredHistory = computed(() => {
  if (!searchQuery.value.trim()) return store.history
  const q = searchQuery.value.toLowerCase()
  return store.history.filter((item: RecordingHistoryItem) => {
    const currentVer = item.versions[item.activeVersionIndex] || item.versions[0]
    return (
      currentVer?.text.toLowerCase().includes(q)
      || currentVer?.engineName.toLowerCase().includes(q)
    )
  })
})

function playAudio(path?: string, event?: Event) {
  if (event) event.stopPropagation()
  if (!path) return
  const audio = new Audio(path)
  audio.play().catch(e => alert(`Audio playback error: ${e?.message || e}`))
}

function openDetail(id: string) {
  router.push(`/history/${id}`)
}

function formatTimestamp(isoStr: string) {
  const d = new Date(isoStr)
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d
    .getHours()
    .toString()
    .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in duration-300">
    <!-- Search Bar & Clear All -->
    <div class="flex items-center justify-between gap-4">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-muted-foreground absolute left-3.5 top-3" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search transcripts or engine names..."
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
        <span>Clear All</span>
      </Button>
    </div>

    <!-- History List Items -->
    <div v-if="filteredHistory.length > 0" class="space-y-4">
      <div
        v-for="item in filteredHistory"
        :key="item.id"
        class="rounded-xl border border-border bg-card p-5 space-y-3.5 shadow-xs hover:border-primary/40 transition cursor-pointer group"
        @click="openDetail(item.id)"
      >
        <div v-if="item.versions.length > 0" class="space-y-3">
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
            {{ item.versions[item.activeVersionIndex]!.text }}
          </p>

          <!-- Card Actions -->
          <div class="flex items-center justify-between pt-1">
            <Button
              v-if="item.audioFilePath"
              variant="secondary"
              size="sm"
              class="font-bold cursor-pointer border border-border h-7 text-xs"
              @click.stop="playAudio(item.audioFilePath, $event)"
            >
              <Play class="w-3 h-3 text-primary fill-primary mr-1" />
              <span>Quick Play</span>
            </Button>
            <div v-else />

            <Button
              variant="outline"
              size="sm"
              class="font-bold cursor-pointer h-7 text-xs group-hover:bg-primary group-hover:text-primary-foreground transition"
              @click.stop="openDetail(item.id)"
            >
              <span>Open Workbench</span>
              <ExternalLink class="w-3 h-3 ml-1" />
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

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { History, Maximize2, Mic, Minimize2, Minus, Settings, Swords, X } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isMaximized = ref(false)
let unlistenResize: (() => void) | null = null

async function checkMaximizedState() {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    isMaximized.value = await getCurrentWindow().isMaximized()
  }
  catch (e) {
    console.log('checkMaximizedState error', e)
  }
}

onMounted(async () => {
  await checkMaximizedState()
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    unlistenResize = await getCurrentWindow().onResized(async () => {
      await checkMaximizedState()
    })
  }
  catch (e) {
    console.log('onResized listener error', e)
  }
})

onUnmounted(() => {
  if (unlistenResize) unlistenResize()
})

async function minimizeWindow() {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    await getCurrentWindow().minimize()
  }
  catch (e) {
    console.log('Minimize window error', e)
  }
}

async function toggleMaximizeWindow() {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    await getCurrentWindow().toggleMaximize()
    await checkMaximizedState()
  }
  catch (e) {
    console.log('Maximize window error', e)
  }
}

async function closeWindow() {
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window')
    await getCurrentWindow().close()
  }
  catch (e) {
    console.log('Close window error', e)
  }
}
</script>

<template>
  <header
    data-tauri-drag-region
    class="w-full border-b border-border bg-secondary text-secondary-foreground sticky top-0 z-40 select-none shadow-xs h-12"
  >
    <div
      data-tauri-drag-region
      class="w-full px-4 sm:px-6 h-full flex items-center justify-between relative"
    >
      <!-- 1. Logo & Domain Badge -->
      <div class="flex items-center gap-2.5 mx-auto sm:mx-0">
        <button
          data-tauri-drag-region="false"
          class="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
          @click="router.push('/')"
        >
          <div class="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Mic class="w-3.5 h-3.5" />
          </div>
          <span class="font-bold text-sm tracking-tight text-foreground">Maina Voice</span>
        </button>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border hidden sm:inline-block">
          mainavoice.app
        </span>
      </div>

      <!-- 2. Absolute Center: Navigation Items (Desktop Only >= 640px) -->
      <div class="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-1.5">
        <Button
          size="sm"
          :variant="route.path === '/' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer px-2.5 lg:px-3"
          title="Record"
          @click="router.push('/')"
        >
          <Mic class="w-3.5 h-3.5" />
          <span class="hidden lg:inline">Record</span>
        </Button>

        <Button
          size="sm"
          :variant="route.path === '/compare' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer px-2.5 lg:px-3"
          title="Compare"
          @click="router.push('/compare')"
        >
          <Swords class="w-3.5 h-3.5" />
          <span class="hidden lg:inline">Compare</span>
        </Button>

        <Button
          size="sm"
          :variant="route.path === '/history' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer px-2.5 lg:px-3"
          title="History"
          @click="router.push('/history')"
        >
          <History class="w-3.5 h-3.5" />
          <span class="hidden lg:inline">History</span>
        </Button>

        <Button
          size="sm"
          :variant="route.path === '/settings' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer px-2.5 lg:px-3"
          title="Settings"
          @click="router.push('/settings')"
        >
          <Settings class="w-3.5 h-3.5" />
          <span class="hidden lg:inline">Settings</span>
        </Button>
      </div>

      <!-- 3. Desktop Window Controls -->
      <div class="hidden sm:flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          title="Minimize Window"
          class="text-muted-foreground hover:text-foreground cursor-pointer"
          @click.stop="minimizeWindow"
        >
          <Minus class="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          :title="isMaximized ? 'Restore Window' : 'Maximize Window'"
          class="text-muted-foreground hover:text-foreground cursor-pointer"
          @click.stop="toggleMaximizeWindow"
        >
          <Minimize2 v-if="isMaximized" class="w-3.5 h-3.5" />
          <Maximize2 v-else class="w-3.5 h-3.5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          title="Close Window"
          class="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          @click.stop="closeWindow"
        >
          <X class="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  </header>
</template>


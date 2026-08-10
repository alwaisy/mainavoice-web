<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { onMounted, ref } from 'vue'
import { Button } from '@/components/ui/button'

const isTauri = !!(window as any).__TAURI_INTERNALS__
const appWindow = isTauri ? getCurrentWindow() : null
const isMaximized = ref(false)

onMounted(async () => {
  if (!isTauri || !appWindow)
    return

  isMaximized.value = await appWindow.isMaximized()

  appWindow.onResized(async () => {
    isMaximized.value = await appWindow.isMaximized()
  })
})

async function minimize() {
  if (appWindow)
    await appWindow.minimize()
}

async function toggleMaximize() {
  if (appWindow)
    await appWindow.toggleMaximize()
}

async function close() {
  if (appWindow)
    await appWindow.close()
}
</script>

<template>
  <div class="flex h-10 bg-sidebar items-center justify-between px-2 relative" :data-tauri-drag-region="isTauri">
    <!-- Left Section -->
    <div class="flex items-center z-10">
      <slot name="left" />
    </div>

    <!-- Center Section (Absolute Centering) -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="pointer-events-auto">
        <slot name="center" />
      </div>
    </div>

    <!-- Right Section -->
    <div class="flex items-center gap-0.5 z-10">
      <template v-if="isTauri">
        <Button
          variant="ghost"
          size="icon"
          class="size-8 hover:bg-muted"
          aria-label="Minimize"
          @click="minimize"
        >
          <Icon icon="ph:minus" class="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-8 hover:bg-muted"
          aria-label="Maximize"
          @click="toggleMaximize"
        >
          <Icon :icon="isMaximized ? 'ph:corners-in' : 'ph:square'" class="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          class="size-8 hover:bg-destructive hover:text-destructive-foreground"
          aria-label="Close"
          @click="close"
        >
          <Icon icon="ph:x" class="size-4" />
        </Button>
      </template>
      <div v-else class="px-2 text-[10px] font-bold text-muted-foreground/20 uppercase tracking-widest">
        Web Preview
      </div>
    </div>
  </div>
</template>

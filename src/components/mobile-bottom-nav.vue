<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { History, Mic, Settings, Swords } from 'lucide-vue-next'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
</script>

<template>
  <!-- Mobile Bottom Navigation Bar (Visible only below 640px / sm:hidden) -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-secondary text-secondary-foreground shadow-lg sm:hidden select-none">
    <div class="grid grid-cols-4 items-center h-14 px-2">
      <!-- 1. Record Tab -->
      <Button
        variant="ghost"
        class="flex flex-col items-center justify-center h-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
        @click="router.push('/')"
      >
        <Mic class="w-4 h-4" />
        <span class="text-[10px] tracking-tight">Record</span>
      </Button>

      <!-- 2. Compare Tab -->
      <Button
        variant="ghost"
        class="flex flex-col items-center justify-center h-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/compare' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
        @click="router.push('/compare')"
      >
        <Swords class="w-4 h-4" />
        <span class="text-[10px] tracking-tight">Compare</span>
      </Button>

      <!-- 3. History Tab -->
      <Button
        variant="ghost"
        class="flex flex-col items-center justify-center h-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/history' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
        @click="router.push('/history')"
      >
        <History class="w-4 h-4" />
        <span class="text-[10px] tracking-tight">History</span>
      </Button>

      <!-- 4. Settings Tab -->
      <Button
        variant="ghost"
        class="flex flex-col items-center justify-center h-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/settings' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
        @click="router.push('/settings')"
      >
        <Settings class="w-4 h-4" />
        <span class="text-[10px] tracking-tight">Settings</span>
      </Button>
    </div>
  </nav>
</template>

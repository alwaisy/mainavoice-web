<script setup lang="ts">
import { History, Mic, Settings, Swords } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'

const route = useRoute()
</script>

<template>
  <!-- Mobile Bottom Navigation Bar (Visible only below 640px / sm:hidden) -->
  <nav class="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-secondary text-secondary-foreground shadow-lg sm:hidden select-none">
    <div class="grid grid-cols-4 items-center h-14 px-2">
      <!-- 1. Record Tab -->
      <Button
        as-child
        variant="ghost"
        class="flex flex-col items-center justify-center h-full w-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
      >
        <RouterLink to="/">
          <Mic class="w-4 h-4" />
          <span class="text-[10px] tracking-tight">Record</span>
        </RouterLink>
      </Button>

      <!-- 2. Compare Tab -->
      <Button
        as-child
        variant="ghost"
        class="flex flex-col items-center justify-center h-full w-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/compare' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
      >
        <RouterLink to="/compare">
          <Swords class="w-4 h-4" />
          <span class="text-[10px] tracking-tight">Compare</span>
        </RouterLink>
      </Button>

      <!-- 3. History Tab -->
      <Button
        as-child
        variant="ghost"
        class="flex flex-col items-center justify-center h-full w-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path.startsWith('/history') ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
      >
        <RouterLink to="/history">
          <History class="w-4 h-4" />
          <span class="text-[10px] tracking-tight">History</span>
        </RouterLink>
      </Button>

      <!-- 4. Settings Tab -->
      <Button
        as-child
        variant="ghost"
        class="flex flex-col items-center justify-center h-full w-full py-1 gap-0.5 rounded-none cursor-pointer"
        :class="route.path === '/settings' ? 'text-primary font-bold' : 'text-muted-foreground font-medium'"
      >
        <RouterLink to="/settings">
          <Settings class="w-4 h-4" />
          <span class="text-[10px] tracking-tight">Settings</span>
        </RouterLink>
      </Button>
    </div>
  </nav>
</template>

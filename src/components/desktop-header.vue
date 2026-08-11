<script setup lang="ts">
import { History, Mic, Settings, Swords } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'

const route = useRoute()
</script>

<template>
  <header class="w-full border-b border-border bg-secondary text-secondary-foreground sticky top-0 z-40 h-12">
    <div class="w-full max-w-[1020px] mx-auto px-4 h-full flex items-center justify-between">
      <!-- 1. Brand Logo -->
      <RouterLink to="/" class="flex items-center gap-2 hover:opacity-80 transition cursor-pointer">
        <div class="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
          <Mic class="w-3.5 h-3.5" />
        </div>
        <span class="font-bold text-sm tracking-tight text-foreground">Maina Voice</span>
      </RouterLink>

      <!-- 2. Navigation Items -->
      <nav class="hidden sm:flex items-center gap-1">
        <Button
          as-child
          size="sm"
          :variant="route.path === '/' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer"
        >
          <RouterLink to="/">
            <Mic class="w-3.5 h-3.5" />
            <span>Record</span>
          </RouterLink>
        </Button>

        <Button
          as-child
          size="sm"
          :variant="route.path === '/compare' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer"
        >
          <RouterLink to="/compare">
            <Swords class="w-3.5 h-3.5" />
            <span>Compare</span>
          </RouterLink>
        </Button>

        <Button
          as-child
          size="sm"
          :variant="route.path.startsWith('/history') ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer"
        >
          <RouterLink to="/history">
            <History class="w-3.5 h-3.5" />
            <span>History</span>
          </RouterLink>
        </Button>

        <Button
          as-child
          size="sm"
          :variant="route.path === '/settings' ? 'default' : 'ghost'"
          class="text-xs font-semibold cursor-pointer"
        >
          <RouterLink to="/settings">
            <Settings class="w-3.5 h-3.5" />
            <span>Settings</span>
          </RouterLink>
        </Button>
      </nav>
    </div>
  </header>
</template>

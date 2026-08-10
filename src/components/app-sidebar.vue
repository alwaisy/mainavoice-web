<script setup lang="ts">
import { Icon } from '@iconify/vue'
import ThemeSwitch from '@/components/theme-switch.vue'

const sidebarRoutes = [
  {
    name: 'Stats',
    icon: 'ph:squares-four-duotone',
    path: '/app',
  },
  {
    name: 'Library',
    icon: 'ph:books-duotone',
    path: '/app/library',
  },
  {
    name: 'Notebook',
    icon: 'ph:notebook-duotone',
    path: '/app/notebook',
  },
  {
    name: 'Sessions',
    icon: 'ph:clock-counter-clockwise-duotone',
    path: '/app/sessions',
  },
]
</script>

<template>
  <aside class="flex flex-col h-dvh pb-12 pt-2 px-2 justify-between bg-sidebar border-r border-sidebar-border w-[240px] shrink-0 transition-all duration-300">
    <div class="flex flex-col gap-6">
      <div class="flex h-12 items-center px-4">
        <h2 class="text-xl font-bold tracking-tight text-sidebar-foreground">
          SiftReader
        </h2>
      </div>
      <nav class="grid gap-1 px-2">
        <RouterLink
          v-for="sidebarRoute in sidebarRoutes"
          :key="sidebarRoute.name"
          :to="sidebarRoute.path"
          class="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors"
          :class="[
            sidebarRoute.path === $route.path
              ? 'bg-sidebar-accent text-sidebar-accent-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
          ]"
        >
          <Icon :icon="sidebarRoute.icon" class="size-5" />
          {{ sidebarRoute.name }}
        </RouterLink>
      </nav>
    </div>

    <div class="px-2 pb-2">
      <div class="flex items-center justify-between gap-1 px-1 py-2 border-t border-sidebar-border/50">
        <RouterLink
          to="/app/settings"
          class="flex size-9 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          :class="['/app/settings' === $route.path ? 'bg-sidebar-accent text-sidebar-accent-foreground' : '']"
          title="Settings"
        >
          <Icon icon="ph:gear-duotone" class="size-5" />
        </RouterLink>

        <ThemeSwitch />
      </div>
    </div>
  </aside>
</template>

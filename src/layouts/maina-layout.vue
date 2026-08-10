<script setup lang="ts">
import DesktopHeader from '@/components/desktop-header.vue'
import MobileBottomNav from '@/components/mobile-bottom-nav.vue'
import SplashScreen from '@/components/splash-screen.vue'
</script>

<template>
  <div class="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-muted antialiased overflow-hidden relative">
    <!-- Splash screen (auto-dismisses after 1.6s) -->
    <SplashScreen />

    <!-- Resize handles (8 directions, only visible in Tauri — decoration-free windows need these) -->
    <!-- Top edge -->
    <div class="absolute top-0 left-3 right-3 h-1 z-50 cursor-n-resize" data-tauri-drag-region />
    <!-- Bottom edge -->
    <div class="absolute bottom-0 left-3 right-3 h-1 z-50 cursor-s-resize" data-tauri-drag-region />
    <!-- Left edge -->
    <div class="absolute left-0 top-3 bottom-3 w-1 z-50 cursor-w-resize" data-tauri-drag-region />
    <!-- Right edge -->
    <div class="absolute right-0 top-3 bottom-3 w-1 z-50 cursor-e-resize" data-tauri-drag-region />
    <!-- Top-Left corner -->
    <div class="absolute top-0 left-0 w-3 h-3 z-50 cursor-nw-resize" data-tauri-drag-region />
    <!-- Top-Right corner -->
    <div class="absolute top-0 right-0 w-3 h-3 z-50 cursor-ne-resize" data-tauri-drag-region />
    <!-- Bottom-Left corner -->
    <div class="absolute bottom-0 left-0 w-3 h-3 z-50 cursor-sw-resize" data-tauri-drag-region />
    <!-- Bottom-Right corner -->
    <div class="absolute bottom-0 right-0 w-3 h-3 z-50 cursor-se-resize" data-tauri-drag-region />

    <!-- Top Header Component (Stuck to top) -->
    <DesktopHeader class="shrink-0 z-30" />

    <!-- Main Content Area (Smooth Scrollable Flex Container) -->
    <main class="flex-1 overflow-y-auto px-4 pt-6 pb-24 sm:pb-12">
      <div class="max-w-[1020px] mx-auto space-y-6">
        <router-view />
      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (< 640px) -->
    <MobileBottomNav />
  </div>
</template>

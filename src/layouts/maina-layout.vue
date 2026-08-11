<script setup lang="ts">
import DesktopHeader from '@/components/desktop-header.vue'
import MobileBottomNav from '@/components/mobile-bottom-nav.vue'
import SplashScreen from '@/components/splash-screen.vue'
</script>

<template>
  <div class="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-muted antialiased overflow-hidden relative">
    <!-- Splash screen (auto-dismisses after 1.6s) -->
    <SplashScreen />

    <!-- Top Header Component -->
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

<script setup lang="ts">
import AppFooter from '@/components/app-footer.vue'
import DesktopHeader from '@/components/desktop-header.vue'
import MobileBottomNav from '@/components/mobile-bottom-nav.vue'
import SplashScreen from '@/components/splash-screen.vue'
</script>

<template>
  <div class="h-screen flex flex-col bg-background text-foreground font-sans selection:bg-muted antialiased overflow-hidden relative">
    <SplashScreen />

    <DesktopHeader class="shrink-0 z-30" />

    <main class="flex-1 overflow-y-auto px-4 pt-6 pb-6 sm:pb-6">
      <div class="max-w-[1020px] mx-auto space-y-6">
        <router-view />
      </div>
    </main>

    <AppFooter />

    <MobileBottomNav />
  </div>
</template>

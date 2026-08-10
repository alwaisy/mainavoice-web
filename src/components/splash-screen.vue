<script setup lang="ts">
import { onMounted, ref } from 'vue'

const visible = ref(true)
const hiding = ref(false)

onMounted(() => {
  setTimeout(() => {
    hiding.value = true
    setTimeout(() => {
      visible.value = false
    }, 500)
  }, 1600)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="splash">
      <div
        v-if="visible"
        class="fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none bg-background"
      >
        <!-- Glow backdrop — uses primary color from design system -->
        <div
          class="absolute w-[420px] h-[420px] rounded-full opacity-20"
          style="background: radial-gradient(circle, var(--primary) 0%, transparent 70%); filter: blur(80px);"
        />

        <!-- Icon box — uses card + border from design system -->
        <div
          class="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg mb-6 bg-card border border-border"
        >
          <!-- Mic icon using foreground color -->
          <svg
            viewBox="0 0 24 24"
            fill="none"
            class="w-10 h-10 text-foreground"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="2" width="6" height="11" rx="3" fill="currentColor" stroke="none" />
            <path d="M5 11a7 7 0 0 0 14 0" />
            <line x1="12" y1="18" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>

          <!-- Subtle glow ring using primary color -->
          <div
            class="absolute inset-0 rounded-2xl opacity-30 animate-pulse"
            style="box-shadow: 0 0 32px 6px var(--primary);"
          />
        </div>

        <!-- App Name using design system foreground -->
        <h1 class="text-3xl font-bold tracking-tight text-foreground mb-1.5">
          Maina Voice
        </h1>
        <p class="text-sm font-medium text-muted-foreground">
          AI Voice Dictation
        </p>

        <!-- Loading dots using primary color -->
        <div class="flex items-center gap-1.5 mt-10">
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 0ms;" />
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 150ms;" />
          <span class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms;" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.splash-enter-active,
.splash-leave-active {
  transition: opacity 0.5s ease;
}
.splash-enter-from,
.splash-leave-to {
  opacity: 0;
}
</style>

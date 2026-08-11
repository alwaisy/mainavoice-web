<script setup lang="ts">
import { Check, Key, Laptop, Moon, Sun } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { useMainaStore } from '@/stores/maina-store'

const store = useMainaStore()
const apiKeyInput = ref(store.openRouterApiKey)
const isSaved = ref(false)

function handleSaveKey() {
  store.setApiKey(apiKeyInput.value)
  isSaved.value = true
  setTimeout(() => {
    isSaved.value = false
  }, 2000)
}
</script>

<template>
  <div class="space-y-6 animate-in fade-in-50 slide-in-from-bottom-3 duration-300">
    <!-- Unboxed Page Title Header -->
    <div class="space-y-1">
      <h1 class="text-xl font-bold text-foreground tracking-tight">
        Settings & Preferences
      </h1>
      <p class="text-xs font-medium text-muted-foreground">
        Manage OpenRouter API keys, color mode, and application preferences.
      </p>
    </div>

    <!-- 1. Color Mode / Theme Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div class="space-y-1">
        <h2 class="text-sm font-bold text-foreground">
          Color Mode / Theme
        </h2>
        <p class="text-xs text-muted-foreground">
          Choose your preferred design system theme (Warm Off-White Cream vs Deep Warm Neutral).
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          size="lg"
          :variant="store.themeMode === 'light' ? 'default' : 'outline'"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          @click="store.setThemeMode('light')"
        >
          <Sun class="w-4 h-4 text-amber-500" />
          <span>Light Mode</span>
        </Button>

        <Button
          size="lg"
          :variant="store.themeMode === 'dark' ? 'default' : 'outline'"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          @click="store.setThemeMode('dark')"
        >
          <Moon class="w-4 h-4 text-indigo-400" />
          <span>Dark Mode</span>
        </Button>

        <Button
          size="lg"
          :variant="store.themeMode === 'system' ? 'default' : 'outline'"
          class="flex items-center justify-center gap-2 font-bold cursor-pointer h-12 border-border"
          @click="store.setThemeMode('system')"
        >
          <Laptop class="w-4 h-4 text-muted-foreground" />
          <span>System Preference</span>
        </Button>
      </div>
    </div>

    <!-- 2. Auto-Translate Preference Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div class="flex items-center justify-between gap-4">
        <div class="space-y-1">
          <h2 class="text-sm font-bold text-foreground">
            Auto-Translate to English
          </h2>
          <p class="text-xs text-muted-foreground leading-relaxed">
            Automatically generate and save fluent English translations for new recordings using Qwen 3.7 Flash ($0.03/1M tokens ultra-low cost translation model).
          </p>
        </div>

        <Button
          size="sm"
          :variant="store.autoTranslate ? 'default' : 'outline'"
          class="font-bold cursor-pointer shrink-0"
          @click="store.setAutoTranslate(!store.autoTranslate)"
        >
          <span>{{ store.autoTranslate ? 'Enabled' : 'Disabled' }}</span>
        </Button>
      </div>
    </div>

    <!-- 3. OpenRouter API Key Card -->
    <div class="rounded-xl border border-border bg-card p-6 space-y-4 shadow-xs">
      <div class="space-y-1">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <Key class="w-4 h-4 text-primary" />
          <span>OpenRouter Cloud API Key</span>
        </h2>
        <p class="text-xs text-muted-foreground leading-relaxed">
          Required for high-accuracy cloud AI models (OpenAI GPT-Transcribe, Deepgram Nova-3, NVIDIA Parakeet). Stored 100% locally on your machine.
        </p>
      </div>

      <div class="space-y-3">
        <div>
          <label class="block text-xs font-bold text-foreground mb-1.5">
            API Key
          </label>
          <input
            v-model="apiKeyInput"
            type="password"
            placeholder="sk-or-v1-..."
            class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition shadow-xs"
          >
        </div>

        <div class="flex items-center justify-between pt-1">
          <span
            v-if="store.openRouterApiKey"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
          >
            <Check class="w-3.5 h-3.5" />
            API Key Active & Saved
          </span>
          <span v-else class="text-xs text-muted-foreground">
            No API key saved yet.
          </span>

          <Button
            variant="default"
            size="sm"
            class="font-bold cursor-pointer"
            @click="handleSaveKey"
          >
            <Check v-if="isSaved" class="w-3.5 h-3.5 text-emerald-400" />
            <span>{{ isSaved ? 'Saved!' : 'Save Key' }}</span>
          </Button>
        </div>
      </div>
    </div>

    <!-- Unboxed Clean Footer -->
    <div class="pt-4 text-center space-y-1">
      <p class="text-[11px] font-semibold text-muted-foreground">
        Maina Voice v0.1.0 — Desktop AI Voice Dictation & Multi-Model Benchmarking Application
      </p>
      <p class="text-[10px] text-muted-foreground/70">
        Powered by Vue 3, Vite, and OpenRouter AI APIs.
      </p>
    </div>
  </div>
</template>

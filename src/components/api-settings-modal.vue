<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { useMainaStore } from '@/stores/maina-store'
import { Key, X } from 'lucide-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const store = useMainaStore()
const apiKeyInput = ref(store.openRouterApiKey)

watch(
  () => props.isOpen,
  (val) => {
    if (val) apiKeyInput.value = store.openRouterApiKey
  },
)

function saveKey() {
  store.setApiKey(apiKeyInput.value)
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        class="relative w-full max-w-[480px] rounded-xl border border-border bg-card text-card-foreground p-6 shadow-xl space-y-6"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-border pb-4">
          <div class="flex items-center gap-2">
            <Key class="w-5 h-5 text-primary" />
            <h2 class="text-base font-bold text-foreground">
              OpenRouter API Key Settings
            </h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            class="text-muted-foreground hover:text-foreground cursor-pointer"
            @click="emit('close')"
          >
            <X class="w-5 h-5" />
          </Button>
        </div>

        <!-- Content -->
        <div class="space-y-4">
          <p class="text-xs text-muted-foreground leading-relaxed">
            Enter your OpenRouter API key to enable high-accuracy cloud models (OpenAI GPT-Transcribe, Deepgram Nova-3, NVIDIA Parakeet):
          </p>
          <div>
            <label class="block text-xs font-bold text-foreground mb-1.5">
              OpenRouter API Key
            </label>
            <input
              v-model="apiKeyInput"
              type="password"
              placeholder="sk-or-v1-..."
              class="w-full px-3.5 py-2.5 rounded-lg bg-background border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition"
            >
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            class="font-bold border border-border cursor-pointer"
            @click="emit('close')"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            class="font-bold cursor-pointer"
            @click="saveKey"
          >
            Save Key
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

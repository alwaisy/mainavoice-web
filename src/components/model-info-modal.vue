<script setup lang="ts">
import { X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ALL_MODELS } from '@/services/transcription-service'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        class="relative w-full max-w-[720px] max-h-[85vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground p-6 shadow-xl space-y-6"
      >
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 class="text-lg font-bold text-foreground flex items-center gap-2">
              AI Models Guide & Specifications
            </h2>
            <p class="text-xs text-muted-foreground mt-0.5">
              Complete breakdown of speed, pricing, and language accuracy.
            </p>
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

        <!-- Models List -->
        <div class="space-y-4">
          <div
            v-for="model in ALL_MODELS"
            :key="model.id"
            class="rounded-lg border border-border bg-background p-4 space-y-3 shadow-xs"
          >
            <div class="flex items-center justify-between">
              <h3 class="font-semibold text-sm text-foreground">
                {{ model.name }}
              </h3>
              <span
                class="px-2.5 py-1 text-[11px] font-bold rounded-md border bg-secondary text-secondary-foreground border-border"
              >
                {{ model.badge }}
              </span>
            </div>

            <p class="text-xs font-semibold text-muted-foreground">
              Price: <span class="text-foreground font-bold">${{ model.costPerMin }}/min</span>
            </p>

            <p class="text-xs text-foreground font-normal">
              {{ model.description }}
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="pt-2 flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            class="font-bold border border-border cursor-pointer"
            @click="emit('close')"
          >
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

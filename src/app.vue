<script setup lang="ts">
import { ConfigProvider } from 'reka-ui'
import { TooltipProvider } from '@/components/ui/tooltip'
</script>

<template>
  <ConfigProvider>
    <TooltipProvider>
      <router-view />
    </TooltipProvider>
  </ConfigProvider>
</template>

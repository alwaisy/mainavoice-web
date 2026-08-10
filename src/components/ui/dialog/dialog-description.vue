<script setup lang="ts">
import { DialogDescription } from 'reka-ui';

import { cn } from '@/lib/utils';

type DialogDescriptionProps = {
  class?: string;
};

const props = defineProps<DialogDescriptionProps>();
</script>

<template>
  <DialogDescription :class="cn('text-sm text-muted-foreground', props.class)">
    <slot/>
  </DialogDescription>
</template>

<script setup lang="ts">
import { parse } from 'marked';

type Props = {
  value?: string;
};

withDefaults(defineProps<Props>(), {
  value: '',
});
</script>

<template>
  <div
    v-dompurify-html="parse(value)"
    class="prose prose-slate w-full p-2"
  />
</template>

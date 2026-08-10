<script setup lang="ts">
import { reactiveOmit } from "@vueuse/core"
import type { HTMLAttributes } from "vue"


import TableCell from "./table-cell.vue"
import TableRow from "./table-row.vue"

import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  class?: HTMLAttributes["class"]
  colspan?: number
}>(), {
  colspan: 1,
  class: undefined,
})

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <TableRow>
    <TableCell
      :class="
        cn(
          'p-4 whitespace-nowrap align-middle text-sm text-foreground',
          props.class,
        )
      "
      v-bind="delegatedProps"
    >
      <div class="flex items-center justify-center py-10">
        <slot />
      </div>
    </TableCell>
  </TableRow>
</template>

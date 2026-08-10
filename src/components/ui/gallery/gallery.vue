<script setup lang="ts">
import { computed } from 'vue';

import { cn } from "@/lib/utils";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GallerySection {
  type?: string;
  images: GalleryImage[];
}

interface GalleryProps {
  sections: GallerySection[];
  class?: string;
}

const props = defineProps<GalleryProps>();

const hasImages = computed(() => {
  return props.sections.some((section) => section.images.length > 0);
});

const totalImages = computed(() => {
  return props.sections.reduce(
    (total, section) => total + section.images.length,
    0,
  );
});
</script>

<template>
  <section v-if="hasImages" :class="cn('py-8 sm:py-16', props.class)">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 space-y-4 text-center sm:mb-12">
        <h2 class="text-xl font-semibold md:text-2xl text-muted-foreground/70">
          {{ totalImages }} {{ totalImages === 1 ? 'image' : 'images' }} in this
          memory
        </h2>
      </div>

      <!-- Gallery Grid -->
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(section, sectionIndex) in sections"
          :key="sectionIndex"
          :class="
            cn({
              'grid grid-cols-1 sm:grid-cols-2 gap-6 col-span-full':
                section.type === 'grid',
              'col-span-full': section.images.length === 1,
            })
          "
        >
          <img
            v-for="(image, imageIndex) in section.images"
            :key="imageIndex"
            :src="image.src"
            :alt="image.alt"
            class="rounded-lg object-cover w-full h-64 sm:h-80 lg:h-96 transition-transform hover:scale-105 duration-200 cursor-pointer"
            loading="lazy"
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import NavTop from "@/components/NavTop.vue";
import Photo from "@/pages/Photo.vue";
import Record from "@/pages/Record.vue";
import RevImg from "@/pages/RevImg.vue";
import { formatFileSize } from "@/utils/lzyutils";
import { ref } from "vue";
const changeValue = ref<string>("photo");
const changeitem = (item: string) => {
  changeValue.value = item;
};
const components = {
  photo: Photo,
  record: Record,
  revImg: RevImg,
};
const heapUsed = ref(0);
const heapTotal = ref(0);
setInterval(() => {
  const memoryInfo = performance.memory;
  heapUsed.value = memoryInfo.usedJSHeapSize;
  heapTotal.value = memoryInfo.totalJSHeapSize;
}, 1000); // 每 5 秒检查一次
</script>

<template>
  <Suspense><NavTop @changeValue="changeitem"></NavTop></Suspense>
  <!-- <Popup></Popup> -->
  <Suspense><component :is="components[changeValue!]"></component></Suspense>
  <p class="absolute bottom-0 left-3">
    内存占用：{{ formatFileSize(heapUsed) }} 总内存：{{ formatFileSize(heapTotal) }}
  </p>
</template>

<style>
#app {
  min-width: 500px;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 36px 1fr;
  user-select: none;
}

nav.navbar {
  grid-row: 1/2;
}
</style>

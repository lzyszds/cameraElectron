<script setup lang="ts">
import NavTop from "@/components/NavTop.vue";
import Photo from "@/pages/Photo.vue";
import Record from "@/pages/Record.vue";
import RevImg from "@/pages/RevImg.vue";
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
</script>

<template>
  <Suspense><NavTop @changeValue="changeitem"></NavTop></Suspense>
  <!-- <Popup></Popup> -->
  <Suspense><component :is="components[changeValue!]"></component></Suspense>
</template>

<style>
#app {
  min-width: 500px;
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 36px 1fr;
}


nav.navbar {
  grid-row: 1/2;
}
</style>

<script setup lang="ts">
import { useStore } from "@/store/store";
import list from "@/assets/images/sticker/index";
const state = useStore();

const applyFilter = (engName: string) => {
  state.sticker = state.sticker === engName ? "notSticker" : engName;
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div
      v-for="(item, index) in list"
      :key="index"
      @click="applyFilter(item.engName)"
      class="cursor-pointer"
    >
      <div
        class="hover:border-black hover:border-[3px] bg-cover bg-no-repeat border-[3px] bg-size h-28 shadow-md rounded-xl bg-center"
        :style="`background-image:url(${item.url})`"
      ></div>
      <p class="text-center font-[dindin]">{{ item.name }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

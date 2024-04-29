<script setup lang="ts">
import { useStore } from "@/store/store";
const state = useStore();
const applyFilter = (engName: string) => {
  state.sticker = state.sticker === engName ? "notSticker" : engName;
};
const list = ["1080P", "720P", "480P", "360P"];
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div
      v-for="(item, index) in list"
      :key="index"
      @click="applyFilter(item)"
      class="cursor-pointer"
    >
      <div
        class="flex place-items-center justify-center hover:border-black hover:border-[3px] bg-cover bg-no-repeat border-[3px] bg-size h-28 shadow-md rounded-xl bg-center"
      >
        <p class="text-center font-[dindin]">{{ item }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
import { useStore } from "@/store/store";
import list from "@/assets/images/frame/index";
const state = useStore();

const applyFilter = (engName: string) => {
  state.frame = state.frame === engName ? "notFrame" : engName;
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
        class="hover:border-black hover:border-[3px] bg-cover bg-no-repeat border-[3px] bg-size h-28 shadow-md rounded-xl"
        :style="`background-image:url(${item.url});backdrop-filter: invert(${
          item.isInvert ? 1.1 : 0
        });`"
      ></div>
      <p class="text-center font-[dindin]">{{ item.name }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

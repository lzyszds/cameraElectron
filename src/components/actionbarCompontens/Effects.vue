<script setup lang="ts">
import catEffects from "@/assets/images/Effects/catEffects.png";
import dogEffects from "@/assets/images/Effects/dogHeadEffects.png";
import angerEffects from "@/assets/images/Effects/angerEffects.png";
import lightningEffects from "@/assets/images/Effects/lightningEffects.png";
import mask from "@/assets/images/Effects/mackEffects.png";
import mianju from "@/assets/images/Effects/mianju.png";
import { useStore } from "@/store/store";
const state = useStore();
const arr = [
  { name: "cat", title: "猫耳", image: catEffects },
  { name: "dogHead", title: "搞怪面具", image: dogEffects },
  { name: "anger", title: "可爱表情", image: angerEffects },
  { name: "lightning", title: "张嘴放电", image: lightningEffects },
  { name: "mask", title: "口红面纱", image: mask },
  { name: "mianju", title: "边框面具", image: mianju },
];
const applyFilter = (filterName) => {
  state.effectsData =
    state.effectsData === filterName ? "notEffects" : filterName;
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <div
      v-for="(item, index) in arr"
      :key="index"
      @click="applyFilter(item.name)"
      class="cursor-pointer"
    >
      <div
        class="hover:border-black hover:border-[3px] bg-cover border-[3px] bg-no-repeat bg-size h-28 shadow-md rounded-xl"
        :style="`background-image:url(${item.image})`"
      ></div>
      <p class="text-center font-[dindin]">{{ item.title }}</p>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

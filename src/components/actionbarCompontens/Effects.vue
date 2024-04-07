<script setup lang="ts">
import catEffects from "@/assets/images/Effects/catEffects.png";
import dogEffects from "@/assets/images/Effects/dogHeadEffects.png";
import angerEffects from "@/assets/images/Effects/angerEffects.png";
import lightningEffects from "@/assets/images/Effects/lightningEffects.png";
import mask from "@/assets/images/Effects/mackEffects.png";
import { useStore } from "@/store/store";
const state = useStore();
const arr = [
  { name: "cat", title: "猫耳", image: catEffects },
  { name: "dogHead", title: "狗头", image: dogEffects },
  { name: "anger", title: "愤怒表情", image: angerEffects },
  { name: "lightning", title: "张嘴放电", image: lightningEffects },
  { name: "mask", title: "口罩", image: mask },
  // { name: '中值滤波', title: '中值滤波', image: '' },
  // { name: '高斯模糊', title: '高斯模糊', image: '' },
  // { name: '色彩增强', title: '色彩增强', image: '' },
  // { name: '像素化', title: '像素化', image: '' },
  // { name: '膨胀', title: '膨胀', image: '' },
  // { name: '腐蚀', title: '腐蚀', image: '' },
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

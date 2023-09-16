<script setup lang="ts">
import square from "@/assets/images/format-1-1.png";
import standard from "@/assets/images/format-4-3.png";
import standardV from "@/assets/images/format-4-3V.png";
import video from "@/assets/images/format-16-9.png";
import videoV from "@/assets/images/format-16-9V.png";
import { useStore } from "@/store/store";
const state = useStore();
const ratioArr = [
  { name: "4/3", icon: standard, width: 4, height: 3, title: "标准屏幕(横)" },
  { name: "3/4", icon: standardV, width: 3, height: 4, title: "标准屏幕(竖)" },
  { name: "16/9", icon: video, width: 16, height: 9, title: "视频屏幕(横)" },
  { name: "9/16", icon: videoV, width: 9, height: 16, title: "视频屏幕(竖)" },
  { name: "3/2", icon: square, width: 3, height: 2, title: "单反相机(横)" },
  { name: "2/3", icon: square, width: 2, height: 3, title: "单反相机(竖)" },
  { name: "5/3", icon: square, width: 5, height: 3, title: "电影屏幕(横)" },
  { name: "18/9", icon: square, width: 18, height: 9, title: "全面屏(横)" },
  { name: "9/18", icon: square, width: 9, height: 18, title: "全面屏(竖)" },
];
const ratioChange = (val: string) => {
  state.ratioVideoData = val;
};
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <div
      class="cursor-pointer w-28 rounded-lg p-2 hover:scale-105"
      style="border: 2px solid #b5bfd9"
      :class="{ active: state.ratioVideoData === item.name }"
      v-for="(item, index) in ratioArr"
      :key="index"
      @click="ratioChange(item.name)"
    >
      <div class="ratioItem grid grid-cols-[1fr] place-content-center place-items-center">
        <img
          class="align-bottom"
          width="40"
          height="40"
          :src="item.icon"
          :alt="item.title"
        />
        <div class="flex gap-2">{{ item.name }}</div>
        <span class="text-xs">{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.active {
  background-color: #000;
  color: white;
  box-shadow: inset 0 0px 2px 1px rgba(255, 255, 255, 1);
  img {
    filter: invert(1);
  }
}
</style>

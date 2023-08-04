<script setup lang="ts">
import { ref } from "vue";
import square from "@/assets/images/format-1-1.png";
import standard from "@/assets/images/format-4-3.png";
import standardV from "@/assets/images/format-4-3V.png";
import video from "@/assets/images/format-16-9.png";
import videoV from "@/assets/images/format-16-9V.png";
const ratioVal = ref<string>("1:1");
const ratioArr = [
  { name: "1:1", icon: square, width: 1, height: 1, title: "正方形" },
  { name: "4:3", icon: standard, width: 4, height: 3, title: "标准屏幕(横)" },
  { name: "3:4", icon: standardV, width: 3, height: 4, title: "标准屏幕(竖)" },
  { name: "16:9", icon: video, width: 16, height: 9, title: "视频屏幕(横)" },
  { name: "9:16", icon: videoV, width: 9, height: 16, title: "视频屏幕(竖)" },
  { name: "3:2", icon: square, width: 3, height: 2, title: "单反相机(横)" },
  { name: "2:3", icon: square, width: 2, height: 3, title: "单反相机(竖)" },
  { name: "5:3", icon: square, width: 5, height: 3, title: "电影屏幕(横)" },
  { name: "18:9", icon: square, width: 18, height: 9, title: "全面屏(横)" },
  { name: "9:18", icon: square, width: 9, height: 18, title: "全面屏(竖)" },
];
const ratioChange = (val: string) => {
  ratioVal.value = val;
};
const actionItemCardCss = window.tailwindJs.hoverTailwincss([
  "bg-[var(--themeColor)]",
  "text-white",
  "rounded-[5px]",
]);
</script>

<template>
  <div
    class="actionItemCard cursor-pointer"
    :class="actionItemCardCss"
    v-for="(item, index) in ratioArr"
    :key="index"
  >
    <div
      class="ratioItem hover:text-white grid grid-cols-[80px_1fr]"
      :class="{ active: ratioVal === item.name }"
      @click="ratioChange(item.name)"
    >
      <div class="flex gap-2">
        <img
          class="align-bottom"
          width="20"
          height="20"
          :src="item.icon"
          :alt="item.title"
        />
        {{ item.width }}:{{ item.height }}
      </div>
      <span>{{ item.title }}</span>
    </div>
  </div>
</template>


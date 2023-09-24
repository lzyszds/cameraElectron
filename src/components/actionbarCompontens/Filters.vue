<script setup lang="ts">
import { useStore } from "@/store/store";

const arr = [
  { name: "原画", icon: "init", title: "原画", image: "" },
  { name: "灰度化", icon: "gray", title: "灰度化", image: "" },
  { name: "反转", icon: "reverse", title: "反转", image: "" },
  { name: "暖色", icon: "warm", title: "暖色", image: "" },
  { name: "冷色", icon: "cooler", title: "冷色", image: "" },
  { name: "色彩增强", icon: "color", title: "色彩增强", image: "" },
  { name: "赛博朋克", icon: "cyberpunk", title: "赛博朋克", image: "" },
  { name: "胶片", icon: "film", title: "胶片", image: "" },
  { name: "纹理", icon: "texture", title: "纹理", image: "" },
  { name: "锐化", icon: "sharpening", title: "锐化", image: "" },
];
const state = useStore();
const applyFilter = (filterName) => {
  state.activeFilterValue = filterName;
};
</script>

<template>
  <div class="grid grid-cols-2 gap-2">
    <div v-for="(item, index) in arr" :key="index" @click="applyFilter(item.icon)">
      <div
        :class="state.activeFilterValue === item.icon ? 'border-black' : ''"
        class="actionItemCard cursor-pointer border-2 hover:border-black"
      >
        <!-- <div class="flex gap-2">
                    <LzyIcon :name="item.icon"></LzyIcon>
                </div> -->
        <span>{{ item.title }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.actionItemCard {
  border-color: transparent;
}
</style>

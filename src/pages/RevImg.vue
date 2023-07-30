<script setup lang="ts">
import ActionBar from "@/components/ActionBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import RenderView from "@/components/RenderView.vue";
import { provide } from "vue";
import { Siderbar } from "@/typing/SideBarType";
const siderbar: Siderbar[] = [
  {
    title: "调整",
    name: "adjust",
    icon: "teenyicons:adjust-horizontal-alt-outline",
  },
  {
    title: "滤镜",
    name: "filters",
    icon: "solar:filters-broken",
  },
  {
    title: "文字",
    name: "text",
    icon: "mdi:format-text",
  },
  {
    title: "贴纸",
    name: "sticker",
    icon: "mdi:sticker-emoji",
  },
  {
    title: "裁剪",
    name: "crop",
    icon: "mdi:crop",
  },
  {
    title: "旋转",
    name: "rotate",
    icon: "mdi:rotate-3d",
  },
  {
    name: "模糊",
    title: "blur",
    icon: "mdi:blur",
  },
  {
    title: "美颜",
    name: "beauty",
    icon: "mdi:face",
  },
  {
    title: "画框",
    name: "frame",
    icon: "mdi:picture-in-picture-bottom-right",
  },
  {
    title: "马赛克",
    name: "mosaic",
    icon: "mdi:blur-linear",
  },
  {
    title: "涂鸦",
    name: "graffiti",
    icon: "mdi:brush",
  },
];
provide("RenderView", siderbar);


</script>

<template>
  <div class="revimg">
    <!-- 侧边栏 -->
    <Sidebar></Sidebar>
    <!-- 操作栏 -->
    <ActionBar></ActionBar>
    <!-- 主体内容 -->
    <RenderView></RenderView>
  </div>
</template>

<style lang="scss" scoped>
.revimg {
  display: grid;
  grid-template-columns: 60px 0.3fr 1fr;
  grid-template-rows: 1fr;
}
</style>

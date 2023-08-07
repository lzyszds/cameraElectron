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
    <!-- <RenderView></RenderView> -->
    <div class="mt-4 -mb-3">
      <div
        class="not-prose relative bg-slate-50 rounded-xl overflow-hidden dark:bg-slate-800/25"
      >
        <div class="relative rounded-xl overflow-auto">
          <div class="relative w-full h-48 grid overflow-hidden gap-6 snap-y snap-mandatory overflow-y-auto pb-14">
            <div class="snap-center shrink-0">
              <div class="shrink-0 w-4 sm:w-48"></div>
            </div>
            <div class="snap-center shrink-0 first:pl-8 last:pr-8">
              <img
                class="shrink-0 w-80 h-40 rounded-lg shadow-xl bg-white"
                src="https://images.unsplash.com/photo-1604999565976-8913ad2ddb7c?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80"
              />
            </div>
            <div class="snap-center shrink-0 first:pl-8 last:pr-8">
              <img
                class="shrink-0 w-80 h-40 rounded-lg shadow-xl bg-white"
                src="https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80"
              />
            </div>
            <div class="snap-center shrink-0 first:pl-8 last:pr-8">
              <img
                class="shrink-0 w-80 h-40 rounded-lg shadow-xl bg-white"
                src="https://images.unsplash.com/photo-1622890806166-111d7f6c7c97?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80"
              />
            </div>
            <div class="snap-center shrink-0 first:pl-8 last:pr-8">
              <img
                class="shrink-0 w-80 h-40 rounded-lg shadow-xl bg-white"
                src="https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80"
              />
            </div>
            <div class="snap-center shrink-0 first:pl-8 last:pr-8">
              <img
                class="shrink-0 w-80 h-40 rounded-lg shadow-xl bg-white"
                src="https://images.unsplash.com/photo-1575424909138-46b05e5919ec?ixlib=rb-1.2.1&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=crop&amp;w=320&amp;h=160&amp;q=80"
              />
            </div>
            <div class="snap-center shrink-0">
              <div class="shrink-0 w-4 sm:w-48"></div>
            </div>
          </div>
        </div>
        <div
          class="absolute inset-0 pointer-events-none border border-black/5 rounded-xl dark:border-white/5"
        ></div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.revimg {
  display: grid;
  grid-template-columns: 60px 0.3fr 1fr;
  grid-template-rows: 1fr;
}
</style>

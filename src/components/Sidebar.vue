<script setup lang="ts">
import { inject, ref } from "vue";
import { Siderbar } from "@/typing/SideBarType";
const siderbar = inject<Siderbar[]>("RenderView");
const activeTool = ref<string>("adjust");
const emit = defineEmits(["changeTools"]);
const changeTools = (val) => {
  emit("changeTools", val);
  activeTool.value = val;
};
</script>

<template>
  <div class="flex flex-col gap-4 mb-[200px]">
    <div
      v-for="item in siderbar"
      :key="item.name"
      class="sidebarItem flex flex-col justify-center items-center h-16 w-full cursor-pointer"
      :class="{ active: activeTool === item.name }"
      @click="changeTools(item.name)"
    >
      <LzyIcon :name="item.icon"></LzyIcon>
      <span class="text-[14px]">{{ item.title }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebarItem {
  &.active {
    svg {
      color: var(--reverColor);
      background-color: var(--themeColor);
      border-radius: 50%;
    }
  }
  svg {
    width: 30px;
    height: 30px;
    margin-bottom: 5px;
    padding: 4px;
  }
}
</style>

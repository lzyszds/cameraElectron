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
  <div class="sidebar">
    <div
      v-for="item in siderbar"
      :key="item.name"
      class="sidebarItem"
      :class="{ active: activeTool === item.name }"
      @click="changeTools(item.name)"
    >
      <LzyIcon :name="item.icon"></LzyIcon>
      <span>{{ item.title }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  margin-bottom: 200px;
  gap: 15px;

  .sidebarItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60px;
    width: 100%;
    cursor: pointer;
    &.active {
      svg {
        color: #fff;
        background-color: var(--themeColor);
        border-radius: 50%;
      }
    }
    svg {
      width: 25px;
      height: 25px;
      margin-bottom: 5px;
      padding: 4px;
    }
    span {
      font-size: 13px;
    }
  }
}
</style>

<script setup lang="ts">
import { inject } from "vue";
import { Siderbar } from "@/typing/SideBarType";
import { useStore } from "@/store/store";
const siderbar = inject<Siderbar[]>("RenderView");
const state = useStore();
const changeTools = (val) => {
  state.setActionToolsValue(val);
};
</script>

<template>
  <div class="sidebar">
    <div
      v-for="item in siderbar"
      :key="item.name"
      class="sidebarItem"
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
  place-items: center;
  place-content: center;
  margin-bottom: 200px;
  .sidebarItem {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 60px;
    cursor: pointer;
    svg {
      width: 25px;
      height: 25px;
    }
    span {
      font-size: 13px;
    }
  }
}
</style>

<script setup lang="ts">
import {
  ElInput,
  ElSelect,
  ElOption,
  ElSwitch,
  ElColorPicker,
  ElButton,
} from "element-plus";
import { familyOption } from "@/assets/data/familyOption";
import { useSessionStorage } from "@vueuse/core";
const formvalue = useSessionStorage("waterData", {
  family: "微软雅黑",
  size: 16,
  weight: true,
  time: false,
  color: "#FFFFFF",
  bgColor: "#000000",
  val: "影天技术",
  isEnable: false,
});
// 预定义颜色
const predefineColors = [
  "#ff4500",
  "#ff8c00",
  "#ffd700",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585",
  "#ff69b4",
  "#ffffff",
  "#000000",
];

const startWater = () => {
  formvalue.value.isEnable = !formvalue.value.isEnable;
};
</script>

<template>
  <div class="grid gap-3">
    <div class="content">
      <span>字体：</span>
      <ElSelect class="flex-1" v-model="formvalue.family" placeholder="Select">
        <ElOption
          v-for="item in familyOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </ElSelect>
    </div>
    <div class="content">
      <span>大小：</span>
      <ElSelect class="flex-1" v-model="formvalue.size" placeholder="Select">
        <ElOption v-for="item in 35" :key="item" :label="item" :value="item" />
      </ElSelect>
    </div>
    <div class="content">
      <span>时间：</span>
      <ElSwitch
        v-model="formvalue.time"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #000"
      />
    </div>
    <div class="content">
      <span>字体颜色：</span>
      <ElColorPicker
        v-model="formvalue.color"
        class="pickerColor"
        show-alpha
        :predefine="predefineColors"
      />
    </div>
    <div class="content">
      <span>背景颜色：</span>
      <ElColorPicker
        v-model="formvalue.bgColor"
        class="pickerColor"
        show-alpha
        :predefine="predefineColors"
      />
    </div>
    <div class="content">
      <span>内容：</span>
      <ElInput
        class="flex-1"
        v-model="formvalue.val"
        placeholder="Please input"
        :style="'font-family: ' + formvalue.family"
      />
    </div>
    <div class="content">
      <ElButton @click="startWater" class="waterBtn">
        {{ !formvalue.isEnable ? "开启" : "关闭" }}水印
      </ElButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
  @apply flex w-full place-items-center;
}
.waterBtn {
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  background-color: var(--color);
  color: var(--reverColor);
  cursor: pointer;
  border: 1px solid var(--color);
  &:hover {
    background-color: var(--reverColor);
    color: var(--color);
  }
}
</style>

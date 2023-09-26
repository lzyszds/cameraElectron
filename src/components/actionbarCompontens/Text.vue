<script setup lang="ts">
import { ElInput, ElSelect, ElOption, ElSwitch } from "element-plus";
import { familyOption } from "@/assets/data/familyOption";
const formvalue = reactive({
  family: "微软雅黑",
  size: 16,
  weight: "fine",
  color: "",
  val: "",
});
</script>

<template>
  <div class="grid gap-3">
    <div class="content">
      <span>字体：</span>
      <el-select class="flex-1" v-model="formvalue.family" placeholder="Select">
        <el-option
          v-for="item in familyOption"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </div>
    <div class="content">
      <span>大小：</span>
      <el-select class="flex-1" v-model="formvalue.size" placeholder="Select">
        <el-option v-for="item in 100" :key="item" :label="item" :value="item" />
      </el-select>
    </div>
    <div class="content">
      <span>粗细：</span>
      <el-switch
        v-model="formvalue.weight"
        style="--el-switch-on-color: #13ce66; --el-switch-off-color: #000"
        active-text="粗"
        inactive-text="细"
      />
    </div>
    <div class="content">
      <span>内容：</span>
      <el-input class="flex-1" v-model="formvalue.val" placeholder="Please input" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content {
  @apply flex w-full place-items-center;
}
</style>

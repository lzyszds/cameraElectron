<script setup lang="ts">
import { useStore } from "@/store/store";
const state = useStore();
//滤镜参数值
state.fillterAgg = {
  contrast: 0 as number,
  brightness: 0 as number,
  redMultiplier: 0 as number,
  greenMultiplier: 0 as number,
  blueMultiplier: 0 as number,
  saturation: 0 as number,
  hue: 0 as number,
};
const fillCompontens = {
  contrast: {
    name: "对比度",
    min: -50,
    max: 50,
  },
  brightness: {
    name: "亮度",
    min: -50,
    max: 50,
  },
  redMultiplier: {
    name: "红色通道",
    min: -50,
    max: 50,
  },
  greenMultiplier: {
    name: "绿色通道",
    min: -50,
    max: 50,
  },
  blueMultiplier: {
    name: "蓝色通道",
    min: -50,
    max: 50,
  },
  saturation: {
    name: "高光",
    min: -50,
    max: 50,
  },
  hue: {
    name: "色调",
    min: -30,
    max: 30,
  },

};

//获取滤镜组件返回的值
const paceValue = (val: { (key: string): number }) => {
  const key = Object.keys(val)[0];
  const value = Object.values(val)[0];
  state.fillterAgg[key] = Number(value);
};
const reset = () => {
  for (let key in state.fillterAgg) {
    state.fillterAgg[key] = 0;
  }
};
</script>

<template>
  <div class="actionItemCard">
    <h3>调色</h3>
    <LzyProgress
      @paceValue="paceValue"
      v-for="(item, index) in fillCompontens"
      :key="index"
      :value="state.fillterAgg[index]"
      :emitKey="index"
      :min="item.min"
      :max="item.max"
      :name="item.name"
    ></LzyProgress>
    <button
      class="w-full mt-3 flex gap-1 text-sm pt-1 place-content-center place-items-center bg-white text-black border-indigo-400 border-[1px] rounded-xl"
      @click="reset"
    >
      <LzyIcon width="15" name="ph:arrows-counter-clockwise-duotone"></LzyIcon>重置
    </button>
  </div>
</template>

<style lang="scss" scoped></style>

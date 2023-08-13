<script setup lang="ts">
import { useStore } from "@/store/store";
const state = useStore();
//滤镜参数值
state.fillterAgg = {
  contrast: 0 as number,
  brightness: 0 as number,
  saturation: 0 as number,
  hue: 0 as number,
  r: 0 as number,
  g: 0 as number,
  b: 0 as number,
};
const fillCompontens = {
  contrast: {
    name: "对比度",
    min: -50,
    max: 50,
    sliderColor: 'white'
  },
  brightness: {
    name: "亮度",
    min: -50,
    max: 50,
    sliderColor: 'white'
  },
  saturation: {
    name: "饱和度",
    min: -50,
    max: 50,
    sliderColor: 'white'
  },
  hue: {
    name: "色调",
    min: -30,
    max: 30,
    sliderColor: 'white'
  },
  r: {
    name: "R",
    min: 0,
    max: 255,
    sliderColor: 'red'
  },
  g: {
    name: "G",
    min: 0,
    max: 255,
    sliderColor: 'green'
  },
  b: {
    name: "B",
    min: 0,
    max: 255,
    sliderColor: 'blue'
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
  <div class="">
    <LzyProgress @paceValue="paceValue" v-for="(item, index) in fillCompontens" :key="index"
      :sliderColor="item.sliderColor" :value="state.fillterAgg[index]" :emitKey="index" :min="item.min" :max="item.max"
      :name="item.name">
    </LzyProgress>
    <button class="btn text-xm gap-1" @click="reset">
      <LzyIcon width="20" name="ph:arrows-counter-clockwise-duotone"></LzyIcon>重置
    </button>
  </div>
</template>

<style lang="scss" scoped>
</style>

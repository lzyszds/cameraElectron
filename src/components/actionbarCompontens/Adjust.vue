<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "@/store/store";
const state = useStore();
//滤镜参数值
state.fillterAgg = {
  contrast: 0 as number,
  light: 0 as number,
  saturation: 0 as number,
  hue: 0 as number,
};
state.beautyAgg = {
  beauty: 0 as number,
  blur: 0 as number,
};
const fillCompontens = {
  contrast: {
    name: "对比度",
    min: -50,
    max: 50,
    sliderColor: "white",
  },
  light: {
    name: "亮度",
    min: -50,
    max: 50,
    sliderColor: "white",
  },
  saturation: {
    name: "饱和度",
    min: -50,
    max: 50,
    sliderColor: "white",
  },
  hue: {
    name: "色调",
    min: -30,
    max: 30,
    sliderColor: "white",
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
//美颜参数值
const beauty = computed({
  get() {
    return state.beautyAgg.beauty;
  },
  set(val) {
    state.beautyAgg.beauty = val;
  },
});
//虚化参数值
const blur = computed({
  get() {
    return state.beautyAgg.blur;
  },
  set(val) {
    state.beautyAgg.blur = val;
  },
});
const beautyValue = (val: { (key: string): number }) => {
  const key = Object.keys(val)[0];
  const value = Object.values(val)[0];
  state.beautyAgg[key] = Number(value);
};
</script>

<template>
  <div class="parameter">
    <LzyProgress
      @paceValue="paceValue"
      v-for="(item, index) in fillCompontens"
      :key="index"
      :sliderColor="item.sliderColor"
      :value="state.fillterAgg[index]"
      :emitKey="index"
      :min="item.min"
      :max="item.max"
      :name="item.name"
    >
    </LzyProgress>
    <button id="btn" class="btn mt-2 text-xm gap-1 leading-5" @click="reset">
      <LzyIcon
        width="20"
        name="ph:arrows-counter-clockwise-duotone"
        style="vertical-align: bottom"
      ></LzyIcon
      >重置
    </button>
  </div>
  <!-- <div class="handle mt-8">
    <LzyProgress @beautyValue="beautyValue" name="美颜" sliderColor="#4facfe"
      background="linear-gradient(to left, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)" textColor="#000" :min="0" :max="100"
      emitKey="beauty" :value="beauty"></LzyProgress>
    <LzyProgress @beautyValue="beautyValue" name="虚化" sliderColor="#4facfe"
      background="linear-gradient(to right, #6a85b6 0%, #bac8e0 100%)" :min="0" :max="100" emitKey="blur" :value="blur">
    </LzyProgress>
  </div> -->
</template>

<style lang="scss" scoped></style>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
interface Emit {
  (key: string, value: { [key: string]: number }): void;
}
interface Props {
  name: string; //名字
  emitKey: string; //键值
  value?: number; //默认值
  min?: number; //最小值
  max?: number; //最大值
  background?: string; //背景色
  sliderColor?: string;//滑块色
  textColor: string;//文字颜色
}
const props = defineProps({
  value: {
    type: Number,
    default: 50,
  },
  name: {
    type: String,
    default: "名字：",
  },
  emitKey: {
    type: String,
    default: "key",
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  background: {
    type: String,
    default: "rgb(150, 174, 211)",
  },
  sliderColor: {
    type: String,
    default: "rgb(255, 255, 255)",
  },
  textColor: {
    type: String,
    default: "rgb(255, 255, 255)",
  },
}) as Props;
const emits = defineEmits<Emit>();
const handlePace = () => {
  emits("paceValue", { [props.emitKey]: pace.value });
};
//-100 0 100正常值
const pace = ref<number>(props.value!);
watch(
  () => props.value,
  (val) => {
    pace.value = val!;
  }
);
const style = computed(() => {
  return {
    "--progressBackground": props.background,
    "--progressSliderColor": props.sliderColor,
    "--progressTextColor": props.textColor,
  };
});
</script>

<template>
  <label class="lzy_slider" :style="style">
    <span style="">{{ name }}</span>
    <input @input="handlePace" v-model="pace" :min="props.min" :max="props.max" type="range" class="lzy_level" />
    <input type="number" :min="props.min" :max="props.max" v-model="pace" />
  </label>
</template>

<style lang="scss" scoped>
.lzy_slider {
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  user-select: none;
  position: relative;

  input {
    margin: 0;
    padding: 0 5px;
  }

  span {
    position: absolute;
    left: 5px;
    bottom: 5px;
    z-index: 1;
    color: var(--progressTextColor);
    font-size: 12px;
    font-family: "dindin";
    font-weight: 600;
    /* 透过元素 */
    pointer-events: none;
  }

  .lzy_level {
    appearance: none;
    width: 200px;
    height: 30px;
    background: var(--progressBackground);
    overflow: hidden;
    border-radius: 5px;
    transition: height 0.1s;
    cursor: inherit;
    position: relative;

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      /* 去掉默认滑块样式 */
      width: 0px;
      /* 滑块的宽度 */
      height: 20px;
      /* 滑块的高度 */
      background-color: var(--progressSliderColor);
      /* 滑块的颜色 */
      cursor: pointer;
      /* 鼠标悬停时显示手型光标 */
      box-shadow: 1px 0px 0px 1px var(--progressSliderColor);
      /* 滑块阴影 */
      padding-left: 3px;
    }

    &:focus {
      outline: none;
    }
  }

  input[type="number"] {
    text-align: center;
    width: 50px;
    height: 25px;
    border: 1px solid #000;
    outline: none;
    border-radius: 5px;
    text-align: center;
    font-size: 12px;
    margin-left: 5px;
    user-select: none !important;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      display: none;
    }
  }
}
</style>

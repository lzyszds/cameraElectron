import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { FillterAgg } from '@/pages/PhotoType'
// import dayjs from 'dayjs'
export const useStore = defineStore('counter', () => {
  const actionToolsValue = ref<string>('')  // 用于存储当前操作的工具
  const fillterAgg = reactive({}) as FillterAgg //滤镜参数值集合
  const ratioVideoData = ref<string>('4:3') //视频比例

  const setActionToolsValue = (val: string,) => {
    actionToolsValue.value = val
  }

  return {
    actionToolsValue,
    fillterAgg,
    setActionToolsValue,
    ratioVideoData
  }
})

import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { FillterAgg } from '@/pages/PhotoType'
// import dayjs from 'dayjs'
export const useStore = defineStore('counter', () => {
  const actionToolsValue = ref<string>('')
  const fillterAgg = reactive({}) as FillterAgg

  const setActionToolsValue = (val: string,) => {
    actionToolsValue.value = val
  }

  return {
    actionToolsValue,
    fillterAgg,
    setActionToolsValue,
  }
})

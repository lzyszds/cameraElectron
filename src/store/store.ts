import { defineStore } from 'pinia'
// import dayjs from 'dayjs'
export const useStore = defineStore('main', {
  state: () => ({
    actionToolsValue: '', //左侧工具栏选中的值
  }),
  /**
     * 类似组件的 computed, 用来封装计算属性, 具有缓存特性
     */
  getters: {
    //时间格式化处理
    // setTime: (state) => dayjs.unix(state.time).format('YYYY-MM-DD') as string
  },
  actions: {
    //设置左侧工具栏选中的值
    setActionToolsValue(value: string) {
      this.actionToolsValue = value
    }

  }

})

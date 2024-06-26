import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { FillterAgg, Beautyagg } from '@/pages/PhotoType'
import specialEffects from '@/utils/specialEffects'

// import dayjs from 'dayjs'
export const useStore = defineStore('counter', () => {
  const actionToolsValue = ref<string>('')  // 用于存储当前操作的工具
  const fillterAgg = reactive({}) as FillterAgg //滤镜参数值集合
  const beautyAgg = reactive({}) as Beautyagg //美颜和虚化参数值集合
  const ratioVideoData = ref<string>('9/16') //视频比例
  const effectsData = ref<string>('') //特效数据
  const sticker = ref<string>('') //贴纸数据
  const frame = ref<string>('') //画框数据
  const text = ref<string>('') //文字数据
  const activeFilterValue = ref<string>('init') //当前选中的滤镜值
  const setActionToolsValue = (val: string,) => {
    actionToolsValue.value = val
  }
  /**
   * 处理人脸特效
   * @param {*} landmarks
   * @param {*} faceContour
   * @param {*} ctx
   * @param {*} sizeMulitple
   */
  const handleEffects = (resizedDetections, faceContour, ctx, sizeMulitple) => {
    const landmarks = resizedDetections[0].landmarks;
    const expressions = resizedDetections[0].expressions;
    switch (effectsData.value) {
      case 'dogHead':
        //哈士奇狗头特效
        specialEffects.dogHead(ctx, landmarks, sizeMulitple)
        break;
      case 'anger':
        //愤怒特效
        specialEffects.anger(ctx, landmarks)
        break;
      case 'cat':
        //猫须特效
        specialEffects.cat(faceContour, ctx, landmarks, sizeMulitple * 4,)
        break;
      case 'lightning':
        //张嘴时放出闪电特效
        if (specialEffects.utils.isMouthOpen(landmarks)) {
          specialEffects.lightning(faceContour, ctx, landmarks)
          ctx.clearRect(0, 0, faceContour.width, faceContour.height);
        }
        break;
      case 'mask':
        //口罩特效
        specialEffects.mask(ctx, landmarks)
        break;
      case 'notEffects':
        //无特效
        break;
      default:
        break;
    }
  }



  return {
    actionToolsValue,
    fillterAgg,
    beautyAgg,
    setActionToolsValue,
    ratioVideoData,
    effectsData,
    sticker,
    frame,
    text,
    handleEffects,
    activeFilterValue
  }
})

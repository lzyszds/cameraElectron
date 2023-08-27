import { defineStore } from 'pinia'
import { reactive, ref } from 'vue'
import { FillterAgg, Beautyagg } from '@/pages/PhotoType'
import specialEffects from '@/utils/specialEffects'

// import dayjs from 'dayjs'
export const useStore = defineStore('counter', () => {
  const actionToolsValue = ref<string>('')  // 用于存储当前操作的工具
  const fillterAgg = reactive({}) as FillterAgg //滤镜参数值集合
  const beautyAgg = reactive({}) as Beautyagg //美颜和虚化参数值集合
  const ratioVideoData = ref<string>('4:3') //视频比例
  const effectsData = ref<string>('') //特效数据
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
  const handleEffects = (landmarks, faceContour, ctx, sizeMulitple) => {
    switch (effectsData.value) {
      case 'theForeheadFont':
        //额头文字特效
        specialEffects.theForeheadFont(ctx, landmarks)
        break;
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
    handleEffects,
  }
})

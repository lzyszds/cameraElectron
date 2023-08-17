<script setup lang='ts'>
import { ElSelect, ElOption, ElLoading } from 'element-plus'
import { ref, } from 'vue'
const recordedVideo = ref<HTMLVideoElement>()

//文档https://www.electronjs.org/docs/latest/api/desktop-capturer
const toRecord = () => {

  // 调用 Electron 主进程中的 onDesktopRecord 方法
  window.myElectron.onDesktopRecord().then(async (sourceId) => {
    if (sourceId) {
      startScreenRecording(sourceId);
    } else {
      console.error('没有可用的屏幕来源.');
    }
  });

  async function startScreenRecording(sourceId) {
    const ratio = selectResRatio.value.split('*')
    console.log(`lzy  ratio:`, ratio)
    try {
      // 设置媒体流的约束
      const constraints: any = {
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: sourceId,
            minWidth: ratio[0],
            maxWidth: ratio[0],
            minHeight: ratio[1],
            maxHeight: ratio[1]
          }
        }
      };

      // 获取媒体流
      let stream = await navigator.mediaDevices.getUserMedia(constraints);

      // 将媒体流赋值给视频元素的 srcObject，实现播放
      recordedVideo.value!.srcObject = stream;
    } catch (error) {
      console.error('访问错误屏幕截图:', error);
    }
  }
}

const resolutionRatio = [
  { label: '2K', value: '2560*1440' },
  { label: '1080P', value: '1920*1080' },
  { label: '720P', value: '1280*720' },
  { label: '480P', value: '854*480' },
  { label: '360P', value: '640*360' },
  { label: '240P', value: '426*240' }
]
const selectResRatio = ref('1920*1080')
//切换分辨率
const toResRatio = async () => {
  if (recordedVideo.value!.paused) return
  recordedVideo.value!.srcObject = null;
  const loading = ElLoading.service({
    lock: true,
    text: 'Loading',
    background: 'rgba(255, 255, 255, 0.9)',
  })
  setTimeout(() => {
    loading.close()
    toRecord()
  }, 1000)
}
</script>

<template>
  <div class="grid grid-rows-[1fr_200px] h-[calc(100vh-60px)]">
    <video ref="recordedVideo" class="w-full h-full" autoplay></video>
    <div class="recordTools grid grid-cols-4 grid-rows-5">
      <button class="btn justify-center place-items-center" @click="toRecord">点击录屏</button>
      <el-select v-model="selectResRatio" class="m-1 select-none" @change="toResRatio">
        <el-option v-for="item in resolutionRatio" :key="item.label" :label="item.label" :value="item.value" />
      </el-select>
    </div>
  </div>
</template>

<style lang='less' scoped>
</style>

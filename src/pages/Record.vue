<script setup lang='ts'>
import { ElSelect, ElOption, ElLoading } from 'element-plus'
import { reactive, ref, nextTick } from 'vue'
import { setTimeoutAsync } from '@/utils/lzyutils'
import { useEventListener } from '@vueuse/core'
const recordedVideo = ref<HTMLVideoElement>()
const recordedCanvas = ref<HTMLCanvasElement>()
const nodeDivElement = ref<HTMLDivElement>()
nextTick(() => {
  recordedCanvas.value!.width = recordedCanvas.value!.offsetWidth;
  recordedCanvas.value!.height = recordedCanvas.value!.offsetHeight;
})

const ratioScreen = reactive({
  width: 0,
  height: 0,
  ratio: '16/9'
})
nextTick(() => {
  ratioScreen.height = nodeDivElement.value!.offsetHeight - 20
  ratioScreen.width = ratioScreen.height * 16 / 9
})

let stream;

//全屏录制
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
}
let isOpenPopup = ref(false)
//区域录制
const toRecordArea = () => {
  isOpenPopup.value = !isOpenPopup.value
  window.myElectron.onSetTopPopupGetPosition(isOpenPopup.value ? 'open' : 'close')
}
async function startScreenRecording(sourceId) {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  const ratio = selectResRatio.value.split('*')
  try {
    // 设置媒体流的约束
    const constraints: any = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop', // 设置桌面捕获源
          chromeMediaSourceId: sourceId, // 设置桌面捕获源
          minWidth: ratio[0], // 最小分辨率
          maxWidth: ratio[0], // 最大分辨率
          minHeight: ratio[1], // 最小分辨率
          maxHeight: ratio[1], // 最大分辨率
          minFrameRate: selectRefRate.value // 最小帧率
        },
      }
    };

    // 获取媒体流
    stream = await navigator.mediaDevices.getUserMedia(constraints);

    // 将媒体流赋值给视频元素的 srcObject，实现播放
    recordedVideo.value!.srcObject = stream;
  } catch (error) {
    console.error('访问错误屏幕截图:', error);
  }
}
const resolutionRatio = [
  { label: '1080P', value: '1920*1080' },
  { label: '720P', value: '1280*720' },
  { label: '480P', value: '854*480' },
  { label: '360P', value: '640*360' },
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
  await setTimeoutAsync(1000)
  loading.close()
  toRecord()
}

const refreshRate = [
  { label: '60FPS', value: 60 },
  { label: '30FPS', value: 30 },
  { label: '15FPS', value: 15 },
]
const selectRefRate = ref(30)

//鼠标明显化
const mouseVisuali = ref(false)
const toMouseVis = () => {
  mouseVisuali.value = !mouseVisuali.value
  if (mouseVisuali.value) {
    //最大化窗口
    // window.myElectron.handleWin('maximize')

    const ctx = recordedCanvas.value!.getContext('2d')!;
    useEventListener(recordedVideo.value, 'play', async () => {
      const renderVideoFrame = async () => {
        const ratio = selectResRatio.value.split('*')
        console.log(`lzy  ratio:`, ratio)
        const { x, y } = await window.myElectron.getMousePosition()
        // 计算缩放比例
        const scaleX = recordedCanvas.value!.width / Number(ratio[0]);
        const scaleY = recordedCanvas.value!.height / Number(ratio[1]);

        // 将鼠标坐标映射到录制视频分辨率上
        const recordedX = Math.round(x * scaleX);
        const recordedY = Math.round(y * scaleY);
        drawFrameWithMouseSpotlight(recordedVideo.value!, ctx, recordedX, recordedY);
        // 在下一个动画帧中调用此函数，实现连续绘制
        requestAnimationFrame(() => {
          renderVideoFrame();
        });
      }
      await renderVideoFrame();
    })
  }
}
// 在绘制视频帧的过程中，绘制鼠标标记
function drawFrameWithMouseSpotlight(video, ctx: CanvasRenderingContext2D, x: number, y: number) {
  const { width, height } = recordedCanvas.value!
  ctx.clearRect(0, 0, width, height);
  // 绘制视频帧
  ctx.drawImage(video, 0, 0, width, height);
  if (!mouseVisuali.value) return
  // 绘制鼠标特写
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, 2 * Math.PI);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'red';
  ctx.stroke();
}
//监听窗口变化
useEventListener(window, 'resize', () => {
  ratioScreen.height = nodeDivElement.value!.offsetHeight - 20
  ratioScreen.width = ratioScreen.height * 16 / 9
})

</script>

<template>
  <div class="grid grid-rows-[1fr_200px] h-[calc(100vh-60px)] gap-3">
    <div ref="nodeDivElement" id="nodeDivElement" class="w-full h-full relative border-4 border-black bg-black ">
      <video ref="recordedVideo" class="w-full h-full hidden" autoplay></video>
      <canvas ref="recordedCanvas" :width="ratioScreen.width" :height="ratioScreen.height"
        class=" p-0 absolute topLeftCenter"></canvas>
    </div>
    <div class="recordTools grid grid-cols-12 grid-rows-5 gap-1">
      <button class="border-black border-2" :class="mouseVisuali ? 'bg-[var(--color)] text-[var(--reverColor)]' : ''"
        @click="toMouseVis">鼠标特写</button>

      <button class="btn justify-center place-items-center" @click="toRecordArea">区域录屏</button>
      <button class="btn justify-center place-items-center" @click="toRecord">全屏录屏</button>
      <el-select v-model="selectResRatio" class="m-1 mt-0 select-none" @change="toResRatio">
        <el-option v-for="item in resolutionRatio" :key="item.label" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="selectRefRate" class="m-1 mt-0 select-none" @change="toResRatio">
        <el-option v-for="item in refreshRate" :key="item.label" :label="item.label" :value="item.value" />
      </el-select>

    </div>
  </div>
</template>

<style lang='less' scoped>
</style>

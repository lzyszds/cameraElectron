<script setup lang="ts">
import ActionBar from "@/components/ActionBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { nextTick, provide, ref, onBeforeUnmount, reactive, computed } from "vue";
import type { Ref } from "vue";
import { useEventListener } from "@vueuse/core";
import { Siderbar } from "@/typing/SideBarType";
import { popup } from "@/components/lzyCompontens/popup";
import { ElNotification, ElButton } from "element-plus";
import { useStore } from "@/store/store";
import { formatDuraton } from "lzyutils";
const state = useStore();
const siderbar: Siderbar[] = [
  {
    title: "调整",
    name: "adjust",
    icon: "teenyicons:adjust-horizontal-alt-outline",
  },
  {
    title: "比例",
    name: "ratio",
    icon: "solar:crop-broken",
  },
];
provide("RenderView", siderbar);
interface MediaparasType {
  // 媒体流对象
  mediaStream: MediaStream | null;
  // 媒体录制对象
  mediaRecorder: MediaRecorder | null;
  // 录制的数据块
  chunks: BlobPart[];
  //录制时间
  time: number;
}
const mediaParas = reactive<MediaparasType>({
  mediaStream: null,
  mediaRecorder: null,
  chunks: [],
  time: 0,
});
// 视频元素引用
const videoElement: Ref<HTMLVideoElement | null> = ref(null);
//canvas元素引用
const canvasElement: Ref<HTMLCanvasElement | null> = ref(null);

// 初始化摄像头
const initCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    }
    mediaParas.mediaStream = stream;
    renderToCanvas();
  } catch (error) {
    console.error("访问摄像头时出错：", error);
  }
};

// 设置期望的宽高比，比如 16:9，4:3 等
const desiredAspectRatio = 16 / 9;
// 根据实际宽高比和期望宽高比来计算画布的宽高
const canvasWidth = ref(640); // 可以根据实际情况设置画布的宽度
const canvasHeight = computed(() => canvasWidth.value / desiredAspectRatio);

//将视频渲染进canvas
const renderToCanvas = () => {
  const video = videoElement.value!;
  const canvas = canvasElement.value!;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  // 计算视频在 Canvas 中的适配宽高
  const { x, y, newWidth, newHeight } = resizeRatio();
  // 将视频渲染到 canvas 上
  context.drawImage(video, x, y, newWidth, newHeight);

  // 获取 canvas 图像数据
  let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  // 调整亮度、对比度和颜色通道
  let {
    contrast,
    brightness,
    redMultiplier,
    greenMultiplier,
    blueMultiplier,
    saturation,
    hue,
  } = state.fillterAgg;
  // contrast += 100;
  contrast = contrast / 100;
  brightness = brightness / 100;
  redMultiplier = redMultiplier / 100;
  greenMultiplier = greenMultiplier / 100;
  blueMultiplier = blueMultiplier / 100;
  saturation = saturation / 100;
  hue = hue / 100;
  for (let i = 0; i < data.length; i += 4) {
    //背景透明
    // let r = data[i];
    // let g = data[i + 1];
    // let b = data[i + 2];
    // if (g > 100 && r > 100 && b < 43) data[i + 3] = 0;
    change_per_pix({ hue, saturation, brightness, contrast }, data, i);
  }
  if (contrast && contrast != 0) {
    let avg = getGrayAverage(data);
    makeContrast(data, avg, contrast * 255);
  }
  // 将处理后的图像绘制回 canvas 上
  context.putImageData(imageData, 0, 0);
  // 继续渲染下一帧
  requestAnimationFrame(renderToCanvas);
};
// 计算某个 帧的 灰度平均值
function getGrayAverage(imagePixArray) {
  var average = function (dataArray) {
    let pixCount = dataArray.length / 4;
    let sum = 0;
    for (let i = 0; i < pixCount; i++) {
      const pixOffset = i * 4;
      let r = dataArray[pixOffset];
      let g = dataArray[pixOffset + 1];
      let b = dataArray[pixOffset + 2];
      sum = sum + (0.299 * r + 0.587 * b + 0.114 * g);
    }
    let aver = sum / dataArray.length;
    return aver;
  };
  return average(imagePixArray);
}

// 对每个像素点 调节 数值
function change_per_pix(param, dataArray, offset) {
  // 从 rgb 转成成 hls
  let r = dataArray[offset];
  let g = dataArray[offset + 1];
  let b = dataArray[offset + 2];
  let from = [r, g, b];
  let hsl = window.colorconv.RGB2HSL(from);

  //处理 色度
  if (param.hue && param.hue != 0) {
    // delta 的区间 [-360,360]
    const delta = param.hue * 360;
    let hue = hsl[0] + delta;
    if (hue < 0) hue = 0;
    if (hue > 360) hue = 360;
    //postMsg(str);
    hsl[0] = hue;
  }
  // 处理 饱和度
  if (param.saturation && param.saturation != 0) {
    // delta 的区间 [-100,100]
    const delta = parseFloat(param.saturation) * 100;
    let saturation = hsl[1] + delta;
    if (saturation < 0) saturation = 0;
    if (saturation > 100) saturation = 100;
    hsl[1] = saturation;
  }
  // 处理 亮度
  if (param.brightness && param.brightness != 0) {
    // delta 的区间 [-100,100]
    const delta = parseFloat(param.brightness) * 100;
    let brightness = hsl[2] + delta;
    if (brightness < 0) brightness = 0;
    if (brightness > 100) brightness = 100;
    hsl[2] = brightness;
  }

  // 从 hls 转回去 rgb
  let newColor = window.colorconv.HSL2RGB(hsl);
  dataArray[offset] = newColor[0];
  dataArray[offset + 1] = newColor[1];
  dataArray[offset + 2] = newColor[2];
}
function makeContrast(dataArray, average, contrast) {
  let pixCount = dataArray.length / 4;
  for (let i = 0; i < pixCount; i++) {
    const pixOffset = i * 4;
    let r = dataArray[pixOffset];
    let g = dataArray[pixOffset + 1];
    let b = dataArray[pixOffset + 2];
    let newR = r + ((r - average) * contrast) / 255;
    let newG = g + ((g - average) * contrast) / 255;
    let newB = b + ((b - average) * contrast) / 255;
    if (newR < 0) newR = 0;
    if (newR > 255) newR = 255;
    if (newG < 0) newG = 0;
    if (newG > 255) newG = 255;
    if (newB < 0) newB = 0;
    if (newB > 255) newR = 255;
    dataArray[pixOffset] = newR;
    dataArray[pixOffset + 1] = newG;
    dataArray[pixOffset + 2] = newB;
  }
}
function resizeRatio() {
  const originalWidth = videoElement.value!.videoWidth;
  const originalHeight = videoElement.value!.videoHeight;

  // 计算视频在 Canvas 中的适配宽高
  const aspectRatio = originalWidth / originalHeight;
  let newWidth = canvasElement.value!.width;
  let newHeight = canvasElement.value!.height;

  if (aspectRatio > 1) {
    // 宽度较大，根据 Canvas 宽度计算适配高度
    newHeight = canvasElement.value!.width / aspectRatio;
  } else {
    // 高度较大，根据 Canvas 高度计算适配宽度
    newWidth = canvasElement.value!.height * aspectRatio;
  }

  // 计算视频在 Canvas 中的居中位置
  const x = (canvasElement.value!.width - newWidth) / 2;
  const y = (canvasElement.value!.height - newHeight) / 2;
  return { x, y, newWidth, newHeight };
}

const hasStartFlag = ref<boolean>(false);
// 开始录制
let interTimefn: any = null;
const startRecording = () => {
  if (!mediaParas.mediaStream) return;
  if (!hasStartFlag.value) {
    mediaParas.mediaRecorder = new MediaRecorder(mediaParas.mediaStream);
    mediaParas.mediaRecorder.ondataavailable = handleDataAvailable;
    mediaParas.mediaRecorder.start();
    hasStartFlag.value = true;
    console.log("开始录制");
    interTimefn = setInterval(() => {
      mediaParas.time++;
    }, 1000);
  } else {
    clearInterval(interTimefn);
    mediaParas.time = 0;
    stopRecording();
  }
};

// 停止录制
const stopRecording = () => {
  if (mediaParas.mediaRecorder && hasStartFlag.value === true) {
    mediaParas.mediaRecorder.stop();
    hasStartFlag.value = false;
    console.log("停止录制");
  }
};

// 处理录制的数据块
const handleDataAvailable = (event: BlobEvent) => {
  if (event.data.size > 0) {
    mediaParas.chunks.push(event.data);
    //弹出窗口，让用户确认存储地址
    popup({
      svgImg: "images/dvg.png",
      title: "温馨提示",
      info: "是否保存视频",
      confirm: () => {
        sendBlobToMainProcess();
      },
    });
  }
};

function sendBlobToMainProcess() {
  // 将 Blob 数据转换为 ArrayBuffer 或 Base64 字符串
  // 这里使用 ArrayBuffer 作为示例，你可以根据需要选择其他方式
  if (mediaParas.chunks.length > 0) {
    const blobData = new Blob(mediaParas.chunks, { type: "video/webm" });
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      // 发送 Blob 数据给主进程
      window.myElectron.onDeviceVideo(arrayBuffer).then((res) => {
        if (res === "Error") return;
        ElNotification({
          title: "保存成功",
          dangerouslyUseHTMLString: true,
          message: res,
          type: "success",
        });
      });
    };
    //先转成ArrayBuffer 读取完成后再转成ArrayBuffer 先走完这个再走onload
    reader.readAsArrayBuffer(blobData);
  }
}
const activeTool = ref<string>("adjust");
//切换工具
const changeTools = (val: string) => {
  activeTool.value = val;
};

nextTick(() => {
  initCamera();
  //视频宽度默认为父元素宽度
  canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 40 || 640;
});

// canvasWidth随着页面宽度变化而变化
useEventListener("resize", () => {
  // 最大最小值
  canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 40 || 640;
  if (canvasWidth.value > 1180) canvasWidth.value = 1180;
  if (canvasWidth.value < 640) canvasWidth.value = 640;
});

onBeforeUnmount(() => {
  // 组件卸载时释放摄像头流
  if (mediaParas.mediaStream) {
    mediaParas.mediaStream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<template>
  <div
    class="revimg pt-10 grid grid-cols-[70px_255px_1fr] gap-4 grid-rows-1 overflow-hidden"
  >
    <!-- 侧边栏 -->
    <Sidebar @changeTools="changeTools"></Sidebar>
    <!-- 操作栏 -->
    <ActionBar :activeTool="activeTool"> </ActionBar>
    <!-- 主体内容 -->
    <div class="viewContent pt-0 px-1">
      <canvas
        class="border-double border-2"
        ref="canvasElement"
        :width="canvasWidth"
        :height="canvasHeight"
        :class="hasStartFlag ? 'border-red-500' : 'border-transparent'"
      ></canvas>
      <!-- <video ref="video" autoplay></video> -->
      <video
        class="w-full h-[45%] object-contain"
        ref="videoElement"
        style="display: none"
        autoplay
      ></video>

      <div class="outcontent flex justify-between gap-5 pr-8 mt-5">
        <el-button class="px-0" @click="startRecording" color="#626aef">
          <span class="flex place-content-center place-items-center" v-if="!hasStartFlag">
            <LzyIcon name="mdi:stopwatch-start-outline"></LzyIcon>开始录制
          </span>
          <span class="flex place-content-center place-items-center" v-else>
            <LzyIcon name="ph:stop-circle"></LzyIcon>结束录制
          </span>
        </el-button>
        <div class="time w-44 text-center rounded h-8 leading-8 select-none">
          录制时长：{{ formatDuraton(mediaParas.time) }}
        </div>
        <!-- <el-button color="#626aef" :disabled="!hasStartFlag">
          <LzyIcon name="ph:stop-circle"></LzyIcon>
          停止录制
        </el-button> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.revimg {
  -webkit-user-drag: none;
}
.viewContent {
  height: calc(100vh - 80px);

  video {
    width: 100%;
    height: 45%;
    object-fit: contain;
  }
}
.outcontent {
  .time {
    background-color: var(--themeColor);
    color: var(--reverColor);
  }
}
</style>

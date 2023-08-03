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
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 调整亮度、对比度和颜色通道
  let { contrast, brightness } = state.fillterAgg;
  contrast += 100;
  // brightness += 100;
  // const brightness = 50; // 亮度调整值，可根据需求调整
  // const contrast = 50; // 对比度调整值，可根据需求调整
  // const redMultiplier = 1.2; // 红色通道调整值，可根据需求调整
  // const greenMultiplier = 0.8; // 绿色通道调整值，可根据需求调整
  // const blueMultiplier = 1; // 蓝色通道调整值，可根据需求调整

  for (let i = 0; i < data.length; i += 4) {
    // // 调整亮度
    data[i] += brightness;
    data[i + 1] += brightness;
    data[i + 2] += brightness;

    // // 调整颜色通道
    // data[i] *= redMultiplier;
    // data[i + 1] *= greenMultiplier;
    // data[i + 2] *= blueMultiplier;

    // 调整对比度
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    data[i] = ((r - 128) * contrast) / 100 + 128;
    data[i + 1] = ((g - 128) * contrast) / 100 + 128;
    data[i + 2] = ((b - 128) * contrast) / 100 + 128;
  }

  // 将处理后的图像绘制回 canvas 上
  context.putImageData(imageData, 0, 0);
  // 继续渲染下一帧
  requestAnimationFrame(renderToCanvas);
};

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

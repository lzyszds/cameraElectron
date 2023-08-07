<script setup lang="ts">
import ActionBar from "@/components/ActionBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { nextTick, provide, ref, onBeforeUnmount, reactive, computed } from "vue";
import type { Ref } from "vue";
import { useEventListener } from "@vueuse/core";

import { ElNotification, ElButton } from "element-plus";
import { useStore } from "@/store/store";
import { formatDuration } from "@/utils/lzyutils";

import { resizeRatio, siderbar } from "@/utils/photoUtils";
import PhotoList from "@/components/PhotoList.vue";
import { videoFileDataType } from "@/typing/_PhotoType";

const state = useStore();

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
  //文件大小
  fileSize: number;
}
const mediaParas = reactive<MediaparasType>({
  mediaStream: null,
  mediaRecorder: null,
  chunks: [],
  time: 0,
  fileSize: 0,
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

const worker = new Worker("/src/utils/worker.js");

// 将视频渲染进canvas
const renderToCanvas = () => {
  const video = videoElement.value!;
  const canvas = canvasElement.value!;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  // 在 OffscreenCanvas 中渲染视频帧
  const offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
  const offscreenContext = offscreenCanvas.getContext(
    "2d"
  ) as OffscreenCanvasRenderingContext2D;
  const { x, y, newWidth, newHeight } = resizeRatio(video, canvas);
  offscreenContext.drawImage(video, x, y, newWidth, newHeight);

  // 获取 OffscreenCanvas 图像数据
  const imageData = offscreenContext.getImageData(0, 0, canvas.width, canvas.height);

  // 调整亮度、对比度和颜色通道
  let { contrast, brightness, saturation, hue } = state.fillterAgg;
  contrast = contrast / 100;
  brightness = brightness / 100;
  saturation = saturation / 100;
  hue = hue / 100;

  worker.postMessage({
    imageData: imageData,
    params: { hue, saturation, brightness, contrast },
  });
  worker.onmessage = (event) => {
    // 获取处理后的图像数据
    const processedImageData = event.data;
    context!.putImageData(processedImageData, 0, 0);

    // 继续渲染下一帧
    requestAnimationFrame(renderToCanvas);
  };
};

//背景透明
// let r = data[i];
// let g = data[i + 1];
// let b = data[i + 2];
// if (g > 100 && r > 100 && b < 43) data[i + 3] = 0;

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
const videoFileData = reactive<videoFileDataType>({
  fileName: "",
  createTime: "",
  fileSize: 0,
});
// 停止录制
const stopRecording = () => {
  if (mediaParas.mediaRecorder && hasStartFlag.value === true) {
    mediaParas.mediaRecorder.stop();
    hasStartFlag.value = false;
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substr(2, 5);
    videoFileData.fileName = `video_${timestamp}_${randomStr}.webm`;
    videoFileData.createTime = new Date().toLocaleString();
    console.log("停止录制", videoFileData, mediaParas.fileSize);
  }
};

// 处理录制的数据块
const handleDataAvailable = (event: BlobEvent) => {
  mediaParas.chunks = [];
  if (event.data.size > 0) {
    mediaParas.chunks.push(event.data);
    mediaParas.fileSize = event.data.size;
    //弹出窗口，让用户确认存储地址
    // sendBlobToMainProcess();
  }
};
//保存视频/* isSaveAs 是否另存为 */
function sendBlobToMainProcess(isSaveAs) {
  // 将 Blob 数据转换为 ArrayBuffer 或 Base64 字符串
  // 这里使用 ArrayBuffer 作为示例，你可以根据需要选择其他方式
  if (mediaParas.chunks.length > 0) {
    const blobData = new Blob(mediaParas.chunks, { type: "video/webm" });
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      // 发送 Blob 数据给主进程
      window.myElectron.onDeviceVideo({ arrayBuffer, isSaveAs }).then((res) => {
        if (res === "Error") return;
        saveSuccess(res); //保存成功后
      });
    };
    //先转成ArrayBuffer 读取完成后再转成ArrayBuffer 先走完这个再走onload
    reader.readAsArrayBuffer(blobData);
  } else {
    ElNotification.closeAll();
    ElNotification({
      title: "保存失败",
      message: "请先录制视频",
      type: "error",
    });
  }
}
const getStorage = ref<videoFileDataType[]>([]);
const myVideolist = localStorage.getItem("myVideolist");
if (myVideolist) {
  getStorage.value = JSON.parse(myVideolist) as [];
}
function saveSuccess(res) {
  ElNotification.closeAll();
  ElNotification({
    title: "保存成功",
    dangerouslyUseHTMLString: true,
    message: res,
    type: "success",
  });
  const data = {
    fileName: videoFileData.fileName,
    createTime: videoFileData.createTime,
    fileSize: mediaParas.fileSize,
  };
  getStorage.value.push(data);
  localStorage.setItem("myVideolist", JSON.stringify(getStorage.value));
  //视频保存成功后清空数据
  mediaParas.chunks = [];
  Object.keys(videoFileData).forEach((key) => {
    videoFileData[key] = "";
  });
}

const activeTool = ref<string>("adjust");
//切换工具
const changeTools = (val: string) => {
  activeTool.value = val;
};

nextTick(() => {
  initCamera();
  //视频宽度默认为父元素宽度
  canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 20 || 640;
});

// canvasWidth随着页面宽度变化而变化
useEventListener("resize", () => {
  // 最大最小值
  canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 100 || 640;
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
    class="revimg pt-1 grid grid-cols-[70px_255px_1fr] gap-4 grid-rows-1 overflow-hidden"
  >
    <!-- 侧边栏 -->
    <Sidebar @changeTools="changeTools"></Sidebar>
    <!-- 操作栏 -->
    <ActionBar :activeTool="activeTool"> </ActionBar>
    <!-- 主体内容 -->
    <div
      class="h-[calc(100vh-50px)] select-none pt-0 px-1 grid grid-rows-[auto_35px_minmax(200px,1fr)] gap-3"
    >
      <canvas
        class="border-double border-2 m-auto"
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

      <div class="outcontent flex justify-between gap-5 px-4">
        <div>
          <ElButton class="px-2 bg-[#626aef] text-white" @click="startRecording">
            <span class="btnSpan" v-if="!hasStartFlag">
              <LzyIcon name="mdi:stopwatch-start-outline"></LzyIcon>开始录制
            </span>
            <span class="btnSpan" v-else>
              <LzyIcon name="ph:stop-circle" style="color: red"></LzyIcon>结束录制
            </span>
          </ElButton>
          <a class="ml-5 underline">{{ videoFileData.fileName }}</a>
        </div>
        <div class="flex gap-1">
          <ElButton
            class="px-2 bg-[#626aef] text-white"
            @click="sendBlobToMainProcess(false)"
          >
            保存视频
          </ElButton>
          <ElButton
            class="px-2 m-0 bg-[#626aef] text-white"
            @click="sendBlobToMainProcess(true)"
          >
            视频另存为
          </ElButton>
          <div
            class="time px-2 text-[var(--reverColor)] bg-[var(--themeColor)] text-center rounded h-8 leading-8 select-none"
          >
            录制时长：{{ formatDuration(mediaParas.time) }}
          </div>
        </div>
      </div>
      <PhotoList :videoFileData="getStorage!"></PhotoList>
    </div>
  </div>
</template>

<style lang="scss">
.btnSpan {
  @apply flex place-content-center place-items-center;
}
</style>

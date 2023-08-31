<script setup lang="ts">
import ActionBar from "@/components/ActionBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { nextTick, provide, ref, onBeforeUnmount, reactive, computed } from "vue";
import type { Ref } from "vue";
import { useEventListener, useStorage } from "@vueuse/core";

import { ElNotification } from "element-plus";
import { useStore } from "@/store/store";
import { formatDuration,watchResourceChange } from "@/utils/lzyutils";

import { resizeRatio, siderbar } from "@/utils/photoUtils";
import PhotoList from "@/components/PhotoList.vue";
import { videoFileDataType, MediaparasType } from "@/typing/_PhotoType";

import {
  nets,
  TinyFaceDetectorOptions,
  detectAllFaces,
  resizeResults,
  draw,
  matchDimensions
} from "face-api.js";

await watchResourceChange()

const state = useStore();


provide("RenderView", siderbar);

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
//人脸轮廓元素引用
const canvasFaceContour = ref<HTMLCanvasElement | null>(null);


// 初始化摄像头
const initCamera = async () => {
  // 设置媒体流的约束
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
    }
    mediaParas.mediaStream = stream;

    // 监听视频加载完成事件
    videoElement.value!.addEventListener("play", async () => {
      try {
        // 等待视频加载完成后再加载模型
        await loadMods();
        await renderToCanvas();
        const faceContour = canvasFaceContour.value!;
        const ctx = faceContour.getContext("2d")!;
        const { width, height } = faceContour;

        // 开始进行人脸识别
        setInterval(async () => {
          const detections = await detectAllFaces(
            videoElement.value!,
            new TinyFaceDetectorOptions()
          )
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions();
          // .withAgeAndGender();
          const resizedDetections = resizeResults(detections, { width, height });
          if (resizedDetections.length === 0) return
          const landmarks = resizedDetections[0].landmarks
          const { width: boxWidth, } = resizedDetections[0].detection.box;
          // 计算脸部在屏幕中的宽度和高度的比例
          const faceWidthToHeightRatio = boxWidth / width

          ctx.clearRect(0, 0, width, height);

          state.handleEffects(landmarks, faceContour, ctx, faceWidthToHeightRatio)
          // draw.drawContour(ctx, landmarks.positions);
          //在边框
          // draw.drawDetections(faceContour, resizedDetections);
          //人脸识别
          // draw.drawFaceLandmarks(faceContour, resizedDetections);
          //表情识别
          // draw.drawFaceExpressions(faceContour, resizedDetections);
          //岁数和性别
        }, 90);

      } catch (error) {
        console.error("模型加载失败：", error);
      }
    });

    // 加载模型的函数
    const loadMods = async () => {
      // 加载所有需要的模型
      return Promise.all([
        nets.tinyFaceDetector.loadFromUri("/models"),
        nets.faceLandmark68Net.loadFromUri("/models"),
        nets.faceRecognitionNet.loadFromUri("/models"),
        nets.faceExpressionNet.loadFromUri("/models"),
        // 加载其他模型
        nets.mtcnn.loadFromUri("/models"),
        nets.ageGenderNet.loadFromUri("/models"),
      ])

    };
  } catch (error) {
    console.error("访问摄像头时出错：", error);
  }
};

// 设置期望的宽高比，比如 16:9，4:3 等
const desiredAspectRatio = computed(() => eval(state.ratioVideoData.replace(":", "/"))) as Ref<number>;
// 根据实际宽高比和期望宽高比来计算画布的宽高
const canvasWidth = computed(() => {
  if (desiredAspectRatio.value > 1) {
    return 900
  } else {
    return 480
  }
});
const canvasHeight = computed(() => {
  return canvasWidth.value / desiredAspectRatio.value
});

// 使用 Web Workers 处理图像数据
const worker = new Worker("/src/utils/worker.js");

// 将视频渲染进canvas
const renderToCanvas = async () => {
  const video = videoElement.value!;
  const canvas = canvasElement.value!;
  const { x, y, newWidth, newHeight } = resizeRatio(video, canvas);

  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  // 在 OffscreenCanvas 中渲染视频帧
  const offscreenCanvas = new OffscreenCanvas(newWidth, newHeight);
  const offscreenContext = offscreenCanvas.getContext("2d", { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;


  // 绘制视频图层
  offscreenContext.drawImage(video, x, y, newWidth, newHeight);
  // 在 OffscreenCanvas 中渲染特效
  offscreenContext.drawImage(canvasFaceContour.value!, 0, 0, newWidth, newHeight);
  // 获取 OffscreenCanvas 图像数据
  const imageData = offscreenContext.getImageData(0, 0, newWidth, newHeight);
  const { contrast, brightness, saturation, hue, r, g, b } = state.fillterAgg
  const { beauty, blur } = state.beautyAgg
  /**
   * 将滤镜参数传递给worker,让worker进行滤镜处理
   * 为什么要解构出来再传进去，因为worker里面不能直接使用state里面的数据
   * @param {ImageData} imageData 图像数据
   * @param {string} barSelect 选中的功能项
   * @param {object} fillterAgg 滤镜参数
   * @param {object} beautyAgg 美颜参数
   */
  worker.postMessage({
    imageData: imageData,
    fillterAgg: { contrast, brightness, saturation, hue, r, g, b },
    beautyAgg: { beauty, blur }
  });
  // 接收 worker 处理后的图像数据
  worker.onmessage = (event) => {
    // 获取处理后的图像数据
    const processedImageData = event.data;
    // 清除 Canvas 内容
    context.clearRect(0, 0, newWidth, newHeight);

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
  if (!hasStartFlag.value) {
    mediaParas.mediaRecorder = new MediaRecorder(canvasElement.value!.captureStream());
    mediaParas.mediaRecorder.ondataavailable = handleDataAvailable;
    mediaParas.mediaRecorder.start();
    hasStartFlag.value = true;
    interTimefn = setInterval(() => {
      mediaParas.time++;
    }, 1000);
  } else {
    stopRecording();
    clearInterval(interTimefn);
    mediaParas.time = 0;
  }
};
const videoFileData = reactive<videoFileDataType>({
  fileName: "",
  createTime: "",
  fileSize: 0,
  filePath: "",
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
      window.myElectron.saveDeviceVideo({ arrayBuffer, isSaveAs }).then((res) => {
        if (res === "Error") return;
        saveSuccess(res); //保存成功后
      });
    };
    //先转成ArrayBuffer 读取完成后再转成ArrayBuffer 先走完这个再走onload
    reader.readAsArrayBuffer(blobData);
  } else {
    mediaParas.time = 0;
    mediaParas.chunks = []
    mediaParas.fileSize = 0;

    ElNotification.closeAll();
    ElNotification({
      title: "保存失败",
      message: "请先录制视频(或者录制的时间太短)",
      type: "error",
      duration: 1000,
    });
  }
}
//视频列表 从本地存储中获取
const storage = useStorage("myVideolist", [] as videoFileDataType[]);
//保存成功后
function saveSuccess(res) {
  ElNotification.closeAll();
  ElNotification({
    title: "保存成功",
    dangerouslyUseHTMLString: true,
    message: res,
    type: "success",
    duration: 1000,
  });
  const data = {
    fileName: videoFileData.fileName,
    createTime: videoFileData.createTime,
    fileSize: mediaParas.fileSize,
    filePath: res,
  };
  storage.value.push(data)
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
  // canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 20 || 640;
});

// canvasWidth随着页面宽度变化而变化
useEventListener("resize", () => {
  // 最大最小值
  // canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 100 || 640;
  // if (canvasWidth.value > 1180) canvasWidth.value = 1180;
  // if (canvasWidth.value < 640) canvasWidth.value = 640;
});

onBeforeUnmount(() => {
  // 组件卸载时释放摄像头流
  if (mediaParas.mediaStream) {
    mediaParas.mediaStream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<template>
  <div class="pt-1 grid grid-cols-[70px_255px_1fr] gap-4 grid-rows-1 overflow-hidden">
    <!-- 侧边栏 -->
    <Sidebar @changeTools="changeTools"></Sidebar>
    <!-- 操作栏 -->
    <ActionBar :activeTool="activeTool"> </ActionBar>
    <!-- 主体内容 -->
    <div
      class=" h-[calc(100vh-50px)] select-none pt-0 pb-1 px-1 overflow-hidden grid grid-rows-[1fr_32px_minmax(100px,1fr)] gap-3">
      <div class="canvas-container">
        <canvas class="border-double bg-black border-2 m-auto max-h-[700px]" ref="canvasElement" width="640" height="480"
          :class="hasStartFlag ? 'border-red-500' : 'border-transparent'">
        </canvas>
        <canvas class="canvasFaceContour" ref="canvasFaceContour" width="640" height="480"></canvas>
      </div>
      <video :width="canvasWidth" :height="canvasHeight" class="object-contain" ref="videoElement" style="display: none"
        autoplay src="../assets/images/VeryCapture_20230811171452.mp4"></video>

      <div class="flex justify-between gap-5 px-4">
        <div class="flex">
          <button class="btn" @click="startRecording">
            <span class="flex place-content-center place-items-center" v-if="!hasStartFlag">
              <LzyIcon name="mdi:stopwatch-start-outline"></LzyIcon>开始录制
            </span>
            <span class="flex place-content-center place-items-center" v-else>
              <LzyIcon name="ph:stop-circle" style="color: red"></LzyIcon>结束录制
            </span>
          </button>
          <a class="ml-5 underline leading-8">{{ videoFileData.fileName }}</a>
        </div>
        <div class="flex gap-1">
          <button class="btn" @click="sendBlobToMainProcess(false)">
            保存视频
          </button>
          <button class="btn" @click="sendBlobToMainProcess(true)">
            另存为
          </button>
          <div class="px-2 text-[var(--reverColor)] bg-[var(--themeColor)] text-center rounded h-8 leading-8 select-none">
            录制时长：{{ formatDuration(mediaParas.time) }}
          </div>
        </div>
      </div>
      <PhotoList></PhotoList>
    </div>
  </div>
</template>

<style lang="scss">
.canvas-container {
  position: relative;
}

.canvasFaceContour {
  position: absolute;
  top: 0;
  left: 50%;
  translate: -50%;
}
</style>

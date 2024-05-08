<script setup lang="ts">
import ActionBar from "@/components/ActionBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import type { Ref } from "vue";
import { useEventListener, useStorage, useSessionStorage } from "@vueuse/core";

import { ElNotification, dayjs } from "element-plus";
import { useStore } from "@/store/store";
import { formatDuration, getOverlayValues } from "@/utils/lzyutils";

import { resizeRatio, siderbar } from "@/utils/photoUtils";
import PhotoList from "@/components/PhotoList.vue";
import { videoFileDataType, MediaparasType } from "@/typing/_PhotoType";

import {
  nets,
  TinyFaceDetectorOptions,
  detectAllFaces,
  resizeResults,
  draw,
} from "face-api.js";

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
//水印元素引用
const canvasWaterContour = ref<HTMLCanvasElement | null>(null);
//文字元素引用
const canvasTextContour = ref<HTMLCanvasElement | null>(null);
//贴纸元素引用
const canvasStickerContour = ref<HTMLCanvasElement | null>(null);

// let faceDataSet: any = null

//水印数据
const waterData = useSessionStorage("waterData", {
  family: "微软雅黑",
  size: 16,
  weight: false,
  time: false,
  color: "#FFFFFF",
  bgColor: "#000000",
  val: "影天技术",
  isEnable: false,
});

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
          if (!videoElement.value) return;
          const detections = await detectAllFaces(
            videoElement.value!,
            new TinyFaceDetectorOptions()
          ).withFaceLandmarks();
          // .withFaceDescriptors()
          // .withFaceExpressions();
          // .withAgeAndGender();
          const resizedDetections = resizeResults(detections, {
            width,
            height,
          });
          //如果找不到人脸就清除画布
          if (resizedDetections.length === 0)
            return ctx.clearRect(0, 0, width, height);
          const landmarks = resizedDetections[0].landmarks;
          const { width: boxWidth } = resizedDetections[0].detection.box;
          // 计算脸部在屏幕中的宽度和高度的比例
          const faceWidthToHeightRatio = boxWidth / width;
          ctx.clearRect(0, 0, width, height);

          state.handleEffects(
            resizedDetections,
            faceContour,
            ctx,
            faceWidthToHeightRatio
          );

          if (state.effectsData === "mianju") {
            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
            draw.drawContour(ctx, landmarks.getRightEye());
            draw.drawContour(ctx, landmarks.getRightEyeBrow());
            draw.drawContour(ctx, landmarks.getLeftEye());
            draw.drawContour(ctx, landmarks.getLeftEyeBrow());
            draw.drawContour(ctx, landmarks.getMouth());
            draw.drawContour(ctx, landmarks.getNose());
            draw.drawContour(ctx, landmarks.getJawOutline());
          }

          //在边框
          // draw.drawDetections(faceContour, resizedDetections);
          //人脸识别
          // draw.drawFaceLandmarks(faceContour, resizedDetections);
          //表情识别
          // draw.drawFaceExpressions(faceContour, resizedDetections);
        }, 60);
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
      ]);
    };
  } catch (error) {
    console.error("访问摄像头时出错：", error);
  }
};

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
  const offscreenContext = offscreenCanvas.getContext("2d", {
    willReadFrequently: true,
  }) as OffscreenCanvasRenderingContext2D;
  // 确保在每次开始新绘制之前都重设了转换。
  offscreenContext.setTransform(1, 0, 0, 1, 0, 0);

  // 将原点移动到画布中点。
  offscreenContext.translate(
    canvasElement.value!.width / 2,
    canvasElement.value!.height / 2
  );

  // 沿 Y 轴反转
  offscreenContext.scale(-1, 1);

  // 将原点移回
  offscreenContext.translate(
    -canvasElement.value!.width / 2,
    -canvasElement.value!.height / 2
  );

  // 绘制视频图层
  offscreenContext.drawImage(video, x, y, newWidth, newHeight);
  // 在 OffscreenCanvas 中渲染特效
  offscreenContext.drawImage(
    canvasFaceContour.value!,
    0,
    0,
    newWidth,
    newHeight
  );
  // 获取 OffscreenCanvas 图像数据
  const imageData = offscreenContext.getImageData(0, 0, newWidth, newHeight);
  const { contrast, light, saturation, hue } = state.fillterAgg;
  const { beauty, blur } = state.beautyAgg;
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
    // faceImageData,
    fillterAgg: { contrast, light, saturation, hue },
    beautyAgg: { beauty, blur },
    filterActive: state.activeFilterValue,
    canvasWidth: newWidth,
    canvasHeight: newHeight,
  });
  // 接收 worker 处理后的图像数据
  worker.onmessage = (event) => {
    // 获取处理后的图像数据
    const processedImageData = event.data;
    // 清除 Canvas 内容
    context.clearRect(0, 0, newWidth, newHeight);

    context!.putImageData(processedImageData, 0, 0);
    //将贴纸画布放置在视频上面
    context.drawImage(canvasStickerContour.value!, 0, 0, newWidth, newHeight);
    //将画框画布放置在视频上面
    context.drawImage(canvasTextContour.value!, 0, 0, newWidth, newHeight);
    //将水印画布放置在视频上面
    context.drawImage(
      canvasWaterContour.value!,
      0,
      newHeight - 50,
      newWidth,
      50
    );

    // 继续渲染下一帧
    requestAnimationFrame(renderToCanvas);
  };
};

const hasStartFlag = ref<boolean>(false);
// 开始录制
let interTimefn: any = null;
const startRecording = () => {
  if (!hasStartFlag.value) {
    mediaParas.mediaRecorder = new MediaRecorder(
      canvasElement.value!.captureStream()
    );
    mediaParas.mediaRecorder.start();
    // 处理录制的数据块
    mediaParas.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      mediaParas.chunks = [];
      if (event.data.size > 0) {
        mediaParas.chunks.push(event.data);
        mediaParas.fileSize = event.data.size;
        //弹出窗口，让用户确认存储地址
        // sendBlobToMainProcess();
      }
    };
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
    videoFileData.fileName = `video${timestamp}${randomStr}.mp4`;
    videoFileData.createTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
  }
};

//保存视频/* isSaveAs 是否另存为 */
function sendBlobToMainProcess(isSaveAs) {
  // 将 Blob 数据转换为 ArrayBuffer 或 Base64 字符串
  // 这里使用 ArrayBuffer 作为示例，你可以根据需要选择其他方式
  if (mediaParas.chunks.length > 0) {
    const blobData = new Blob(mediaParas.chunks, { type: "video/mp4" });
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      // 发送 Blob 数据给主进程
      window.myElectron
        .saveDeviceVideo({
          arrayBuffer,
          isSaveAs,
          fileName: videoFileData.fileName,
        })
        .then((res) => {
          if (res === "Error") return;
          saveSuccess(res); //保存成功后
        });
    };
    //先转成ArrayBuffer 读取完成后再转成ArrayBuffer 先走完这个再走onload
    reader.readAsArrayBuffer(blobData);
  } else {
    mediaParas.time = 0;
    mediaParas.chunks = [];
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
  storage.value.push(data);
  //视频保存成功后清空数据
  mediaParas.chunks = [];
  Object.keys(videoFileData).forEach((key) => {
    videoFileData[key] = "";
  });
}

const activeTool = useSessionStorage("activeTool", "text");
//切换工具
const changeTools = (val: string) => {
  activeTool.value = val;
};
//拍照功能
/**
 * 拍照功能实现，利用HTML5 Canvas技术获取图片数据，并通过与Electron的交互保存图片。
 * 该函数首先将Canvas转换为数据URL，然后去除数据URL的头部信息，仅保留Base64编码的数据部分。
 * 之后，调用Electron的`photograph`方法，传递Base64编码的图片数据，以保存图片。
 * 保存成功后，会显示通知，并将图片的元数据添加到存储列表中。
 */
const photograph = () => {
  // 获取Canvas元素，并将其转换为数据URL
  const canvas = canvasElement.value!;
  const dataURL = canvas.toDataURL("image/png");
  // 从数据URL中提取Base64编码的图片数据
  const data = dataURL.replace(/^data:image\/\w+;base64,/, "");

  // 调用Electron的图片保存方法，并处理返回结果
  window.myElectron.photograph(data).then((res) => {
    if (res === "Error") return; // 如果保存出错，则不执行后续操作
    // 关闭所有通知，然后显示保存成功的通知
    ElNotification.closeAll();
    ElNotification({
      title: "保存成功",
      message: "照片保存成功",
      type: "success",
      duration: 1000,
    });
    // 准备图片的元数据，并添加到存储列表中
    const data = {
      fileName: res.fileName,
      createTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      fileSize: res.size,
      filePath: res.filePath,
    };
    storage.value.push(data);
  });
};

//在视频中添加贴纸
const addSticker = (type: "sticker" | "text") => {
  const canvas = canvasStickerContour.value!;
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;

  if (state[type] === "notSticker" || state[type] === "notText")
    return ctx.clearRect(0, 0, width, height);
  const img = new Image();
  img.src = new URL(
    `../assets/images/${type}/${state[type]}.png`,
    import.meta.url
  ).href;
  img.onload = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, 200, 200);
  };
  let flag = false,
    stickerPosition = { x: 0, y: 0 };
  //添加拖拽事件
  canvas.onmousedown = (e) => {
    const stpX = stickerPosition.x;
    const stpY = stickerPosition.y;
    const x = e.offsetX;
    const y = e.offsetY;

    // 检查鼠标点击的位置是否在贴纸上
    if (stpX != 0 && stpY != 0) {
      if (x > stpX && x < stpX + 200 && y > stpY && y < stpY + 200) {
        flag = true;
      } else {
        flag = false;
      }
    } else {
      flag = true;
    }

    canvas.onmousemove = (e) => {
      if (!flag) return;
      let moveX = e.offsetX - x + stpX;
      moveX = moveX < 0 ? 0 : moveX; // 限制贴纸的移动范围
      moveX = moveX > width - 200 ? width - 200 : moveX;
      let moveY = e.offsetY - y + stpY;
      moveY = moveY < 0 ? 0 : moveY;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, moveX, moveY, 200, 200);
      // 记录贴纸的位置
      stickerPosition = {
        x: moveX,
        y: moveY,
      };
    };

    canvas.onmouseup = (e) => {
      flag = false;
      canvas.onmousemove = null;
    };
    //鼠标移出画布时 关闭flag
    canvas.onmouseleave = (e) => {
      flag = false;
    };
  };
};

//添加画框
const addFrame = () => {
  const canvas = canvasTextContour.value!;
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const { frame } = state;
  if (frame === "notFrame") return ctx.clearRect(0, 0, width, height);
  const img = new Image();
  img.src = new URL(
    `../assets/images/frame/${frame}.png`,
    import.meta.url
  ).href;
  img.onload = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  };
};

let timer;
//生成水印
const watermark = () => {
  const { val, color, size, family, bgColor, isEnable } = waterData.value;
  const canvas = canvasWaterContour.value!;
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  timer && clearInterval(timer);
  ctx.clearRect(0, 0, width, height);
  if (!isEnable) return;

  //添加时间
  if (waterData.value.time) {
    timer = setInterval(() => {
      const newTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${size}px ${family}`;
      ctx.fillStyle = color;
      ctx.fillText(val, 10, 30);
      // 计算文本宽度的偏移量
      const textWidth = ctx.measureText(newTime).width;
      if (videoElement.value === null) return;
      const offsetX = videoElement.value!.videoWidth - textWidth - 10;

      // 将文本绘制到画布的右下角
      ctx.fillText(newTime, offsetX, 30);
    }, 1000);
  } else {
    //添加背景颜色
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
    ctx.font = `${size}px ${family}`;
    ctx.fillStyle = color;
    ctx.fillText(val, 10, 30);
  }
};
nextTick(() => {
  //视频宽度默认为父元素宽度
  // canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 20 || 1280;
});

watch(
  () => waterData.value,
  () => {
    watermark();
  }
);
watch(
  () => state.sticker,
  () => {
    addSticker("sticker");
  }
);
watch(
  () => state.text,
  () => {
    addSticker("text");
  }
);
watch(
  () => state.frame,
  () => {
    addFrame();
  }
);

onMounted(async () => {
  initCamera();
  watermark();
});

// canvasWidth随着页面宽度变化而变化
useEventListener("resize", () => {
  // 最大最小值
  // canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth! - 100 || 1280;
  // if (canvasWidth.value > 1180) canvasWidth.value = 1180;
  // if (canvasWidth.value < 1280) canvasWidth.value = 1280;
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
    class="pt-1 grid grid-cols-[70px_255px_1fr] gap-4 grid-rows-1 overflow-hidden"
  >
    <!-- 侧边栏 -->
    <Sidebar @changeTools="changeTools"></Sidebar>
    <!-- 操作栏 -->
    <ActionBar :activeTool="activeTool"> </ActionBar>
    <!-- 主体内容 -->
    <div
      class="h-[calc(100vh-50px)] select-none pt-0 pb-1 px-1 overflow-hidden grid grid-rows-[minmax(500px,1fr)_32px_minmax(100px,1fr)] gap-3"
    >
      <div class="canvas-container">
        <!-- 录像图层 -->
        <canvas
          class="border-double bg-black border-2 m-auto max-h-[480px]"
          ref="canvasElement"
          :width="720"
          :height="480"
          :class="hasStartFlag ? 'border-red-500' : 'border-transparent'"
        >
        </canvas>
        <!-- 人脸识别图层 -->
        <canvas
          class="canvasFaceContour hidden"
          ref="canvasFaceContour"
          :width="720"
          :height="480"
        ></canvas>
        <!-- 文字图层 -->
        <canvas
          class="canvasTextContour"
          ref="canvasTextContour"
          :width="720"
          :height="480"
        ></canvas>
        <!-- 贴纸图层 -->
        <canvas
          class="canvasStickerContour"
          ref="canvasStickerContour"
          :width="720"
          :height="480"
          style="opacity: 0"
        ></canvas>
        <!-- 水印图层 -->
        <canvas
          class="canvasWaterContour"
          ref="canvasWaterContour"
          :width="720"
          :height="50"
        ></canvas>
      </div>
      <video
        :width="1280"
        :height="720"
        class="object-contain"
        ref="videoElement"
        style="display: none; height: 720px"
        autoplay
        src="../assets/images/VeryCapture_20230811171452.mp4"
      ></video>

      <div class="flex justify-between gap-5 px-4">
        <div class="flex">
          <button class="btn" @click="startRecording">
            <span
              class="flex place-content-center place-items-center"
              v-if="!hasStartFlag"
            >
              <LzyIcon
                width="14px"
                height="14px"
                style="margin-right: 3px"
                name="bi:record-btn-fill"
              ></LzyIcon
              >开始录制
            </span>
            <span class="flex place-content-center place-items-center" v-else>
              <LzyIcon name="ph:stop-circle" style="color: red"></LzyIcon
              >结束录制
            </span>
          </button>
          <button class="btn ml-1" @click="photograph">
            <LzyIcon name="raphael:photo"></LzyIcon>拍照
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
          <div
            class="px-2 text-[var(--reverColor)] bg-[var(--themeColor)] text-center rounded h-8 leading-8 select-none"
          >
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
  overflow: hidden;
}

.canvasFaceContour,
.canvasTextContour,
.canvasStickerContour {
  position: absolute;
  top: 0;
  left: 50%;
  translate: -50%;
}
.canvasWaterContour {
  position: absolute;
  bottom: 2px;
  left: 50%;
  translate: -50%;
  visibility: hidden;
}
</style>

<script setup lang="ts">
// import ActionBar from "@/components/ActionBar.vue";
import Sidebar from "@/components/Sidebar.vue";
import { nextTick, provide, ref, onBeforeUnmount, reactive, computed } from "vue";
import type { Ref } from "vue";
import { useEventListener } from "@vueuse/core";
import { Siderbar } from "@/typing/SideBarType";
const siderbar: Siderbar[] = [];
provide("RenderView", siderbar);
interface MediaparasType {
  // 媒体流对象
  mediaStream: MediaStream | null;
  // 媒体录制对象
  mediaRecorder: MediaRecorder | null;
  // 录制的数据块
  chunks: BlobPart[];
}
const mediaParas = reactive<MediaparasType>({
  mediaStream: null,
  mediaRecorder: null,
  chunks: [],
});
// 视频元素引用
const videoElement: Ref<HTMLVideoElement | null> = ref(null);
//canvas元素引用
const canvasElement: Ref<HTMLCanvasElement | null> = ref(null);

//滤镜参数值
const fillterAgg = reactive({
  contrast: 0 as number,
  brightness: 0 as number,
});
const fillCompontens = {
  contrast: {
    name: "对比度",
    min: -50,
    max: 50,
  },
  brightness: {
    name: "亮度",
    min: -50,
    max: 50,
  },
};

//获取滤镜组件返回的值
const paceValue = (val: { (key: string): number }) => {
  const key = Object.keys(val)[0];
  const value = Object.values(val)[0];
  fillterAgg[key] = Number(value);
  console.log(`lzy  fillterAgg:`, fillterAgg);
};

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
const desiredAspectRatio = 3 / 4;
// 根据实际宽高比和期望宽高比来计算画布的宽高
const canvasWidth = ref(640); // 可以根据实际情况设置画布的宽度
const canvasHeight = computed(() => canvasWidth.value * desiredAspectRatio);

//将视频渲染进canvas
const renderToCanvas = () => {
  const video = videoElement.value!;
  const canvas = canvasElement.value!;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  const { width, height } = canvasElement.value!;
  // 将视频渲染到 canvas 上
  context.drawImage(video, 0, 0, width, height);

  // 获取 canvas 图像数据
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 调整亮度、对比度和颜色通道
  let { contrast, brightness } = fillterAgg;
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

// 开始录制
const startRecording = () => {
  if (mediaParas.mediaStream) {
    mediaParas.mediaRecorder = new MediaRecorder(mediaParas.mediaStream);
    mediaParas.mediaRecorder.ondataavailable = handleDataAvailable;
    mediaParas.mediaRecorder.start();
    console.log("开始录制");
  }
};

// 停止录制
const stopRecording = () => {
  if (mediaParas.mediaRecorder) {
    mediaParas.mediaRecorder.stop();
    console.log("停止录制");
  }
};

// 处理录制的数据块
const handleDataAvailable = (event: BlobEvent) => {
  if (event.data.size > 0) {
    console.log("录制数据：", event.data);
    mediaParas.chunks.push(event.data);
    sendBlobToMainProcess();
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
        console.log(res);
      });
    };
    //先转成ArrayBuffer 读取完成后再转成ArrayBuffer 先走完这个再走onload
    reader.readAsArrayBuffer(blobData);
  }
}

nextTick(() => {
  initCamera();
  //视频宽度默认为父元素宽度
  canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth || 640;
});

// canvasWidth随着页面宽度变化而变化
useEventListener("resize", () => {
  canvasWidth.value = canvasElement.value?.parentElement!.offsetWidth || 640;
});

onBeforeUnmount(() => {
  // 组件卸载时释放摄像头流
  if (mediaParas.mediaStream) {
    mediaParas.mediaStream.getTracks().forEach((track) => track.stop());
  }
});
</script>

<template>
  <div class="revimg">
    <!-- 侧边栏 -->
    <Sidebar></Sidebar>
    <!-- 操作栏 -->
    <div class="actionBar">
      <div class="actionItemCard">
        <h3>调色</h3>
        <LzyProgress
          @paceValue="paceValue"
          :value="fillterAgg.contrast"
          v-for="(item, index) in fillCompontens"
          :key="index"
          :emitKey="index"
          :min="item.min"
          :max="item.max"
          :name="item.name"
        ></LzyProgress>
      </div>
    </div>
    <!-- 主体内容 -->
    <div class="viewContent">
      <canvas ref="canvasElement" :width="canvasWidth" :height="canvasHeight"></canvas>
      <!-- <video ref="video" autoplay></video> -->
      <video ref="videoElement" style="display: none" autoplay></video>

      <div class="outcontent">
        <!-- 开始录制按钮 -->
        <button @click="startRecording">开始录制</button>
        <!-- 停止录制按钮 -->
        <button @click="stopRecording">停止录制</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.revimg {
  display: grid;
  grid-template-columns: 60px 0.3fr 1fr;
  grid-template-rows: 1fr;
}
.actionBar {
  .actionItemCard {
    background: #fafafa;
    box-shadow: 0 0 1px rgba(0, 0, 0, 0.1), 0 4px 5px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 16px;
    color: #111;
    margin-bottom: 8px;
    h3 {
      margin: 0 0 10px 0;
    }
  }
}
.viewContent {
  padding: 0 20px;
  height: calc(100vh - 60px);
  overflow: hidden;

  video {
    width: 100%;
    height: 45%;
    object-fit: contain;
  }
}
</style>

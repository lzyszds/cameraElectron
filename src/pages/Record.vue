<script setup lang="ts">
import {
  nets,
  TinyFaceDetectorOptions,
  detectAllFaces,
  draw,
  createCanvasFromMedia,
  resizeResults,
} from "face-api.js";
import { onMounted, ref } from "vue";
const videoElement = ref<HTMLVideoElement>();
onMounted(() => {
  // 监听视频加载完成事件
  videoElement.value!.addEventListener("play", async () => {
    try {
      // 等待视频加载完成后再加载模型
      await loadMods();
      console.log("模型加载完成");
      const canvas = createCanvasFromMedia(videoElement.value!);
      const ctx = canvas.getContext("2d")!;
      // 开始进行人脸识别
      document.querySelector(".items")!.append(canvas);

      setInterval(async () => {
        const detections = await detectAllFaces(
          videoElement.value!,
          new TinyFaceDetectorOptions()
        )
          .withFaceLandmarks()
          .withFaceDescriptors()
          .withFaceExpressions()
          // .withAgeAndGender();
        const resizedDetections = resizeResults(detections, {
          width: videoElement.value!.videoWidth,
          height: videoElement.value!.videoHeight,
        });
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        //人脸识别
        draw.drawFaceLandmarks(canvas, resizedDetections);
        //表情识别
        // draw.drawFaceExpressions(canvas, resizedDetections);
      }, 300);
    } catch (error) {
      console.error("模型加载失败：", error);
    }
  });

  // 加载模型的函数
  const loadMods = async () => {
    return Promise.all([
      nets.tinyFaceDetector.loadFromUri("/models"),
      nets.faceLandmark68Net.loadFromUri("/models"),
      nets.faceRecognitionNet.loadFromUri("/models"),
      nets.faceExpressionNet.loadFromUri("/models"),
    ]);
  };

  // 初始化摄像头
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoElement.value) {
        videoElement.value.srcObject = stream;
      }
    } catch (error) {
      console.error("访问摄像头时出错：", error);
    }
  };
  // 在这里调用初始化摄像头的函数
  initCamera();
});
</script>

<template>
  <div class="items">
    <video class="w-[640px] h-[480px] object-contain" ref="videoElement" autoplay></video>
  </div>
</template>

<style lang="scss">
.items {
  width: 100vw;
  height: 100vh;
  position: relative;
}
.items canvas,
video {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
canvas {
  z-index: 999;
}
</style>

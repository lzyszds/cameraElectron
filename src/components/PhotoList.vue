<script setup lang="ts">
import { videoFileDataType } from "@/typing/_PhotoType";
import { formatFileSize } from "@/utils/lzyutils";
import { useStorage } from "@vueuse/core";
import { ElNotification } from "element-plus";

interface props {
  videoFileData: videoFileDataType[];
}
const props = defineProps<props>();

const tableNav = ["日期", "名称", "大小", "操作"];

const delVideo = (path, index) => {
  window.myElectron
    .onDelToVideo(path)
    .then((res: { message: string; type: "success" | "error" }) => {
      ElNotification.closeAll();
      if (res.type == "error") {
        return ElNotification({
          title: "删除失败",
          message: res.message,
          type: "error",
          duration: 1000,
        });
      } else {
        ElNotification({
          title: "删除成功",
          message: res.message,
          type: "success",
          duration: 1000,
        });
        const storage = useStorage("myVideolist", [] as videoFileDataType[]);
        storage.value.splice(index, 1);
      }
    });
};
</script>

<template>
  <main class="photolist">
    <section class="grid grid-cols-[150px_1fr_120px_100px]">
      <span v-for="(item, index) in tableNav" :key="index">{{ item }}</span>
    </section>
    <section class="overflow-hidden overflow-y-scroll">
      <div
        class="grid grid-cols-[150px_1fr_120px_100px] h-8 text-base"
        v-for="(item, index) in props.videoFileData"
        :key="index"
      >
        <span>{{ item.createTime }}</span>
        <span>{{ item.fileName }}</span>
        <span>{{ formatFileSize(item.fileSize) }}</span>
        <a
          @click="delVideo(item.filePath, index)"
          class="text-black hover:text-[var(--themeColor)] cursor-pointer"
        >
          删除
        </a>
      </div>
    </section>
  </main>
</template>

<style>
.photolist {
  @apply relative w-full h-full pointer-events-auto rounded-lg font-[dindin];
  @apply bg-white p-4 text-[0.8125rem] leading-5 shadow-xl shadow-black/5;
  @apply hover:bg-slate-50 ring-2 ring-indigo-600;
  @apply grid grid-rows-[45px_1fr];
}
.photolist::after {
  border-radius: 0%;
  content: "";
  width: 100%;
  height: 100%;
  background-color: rgba(210, 207, 216, 0.3);
  mask-image: url("@/assets/images/waves.svg");
  mask-size: 64px 32px;
  mask-repeat: repeat;
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
@/typing/PhotoType @/typing/_PhotoType

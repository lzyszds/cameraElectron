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
  <main
    class="relative w-full h-full grid grid-rows-[45px_1fr] pointer-events-auto rounded-lg font-[dindin]  p-4 text-[0.8125rem] leading-5 shadow-xl shadow-black/5  ring-2 ring-[var(--themeColor)]">
    <section class="grid grid-cols-[150px_1fr_120px_100px]">
      <span v-for="(item, index) in tableNav" :key="index">{{ item }}</span>
    </section>
    <section class="overflow-hidden overflow-y-scroll">
      <div class="grid grid-cols-[150px_1fr_120px_100px] h-8 text-base" v-for="(item, index) in props.videoFileData"
        :key="index">
        <span>{{ item.createTime }}</span>
        <span>{{ item.fileName }}</span>
        <span>{{ formatFileSize(item.fileSize) }}</span>
        <div class="flex gap-1 text-sm">
          <a @click="delVideo(item.filePath, index)" class="btn p-[3px] h-6 leading-4"> 删除 </a>
          <a @click="delVideo(item.filePath, index)" class="btn p-[3px] h-6 leading-4"> 打开 </a>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
</style>

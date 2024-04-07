<script setup lang="ts">
import { videoFileDataType } from "@/typing/_PhotoType";
import { formatFileSize } from "@/utils/lzyutils";
import { useStorage } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { ref, watch } from "vue";
import dayjs from "dayjs";
import LzyIcon from "./lzyCompontens/LzyIcon.vue";

const tableNav = ["日期", "名称", "大小", "操作"];
const storage = useStorage("myVideolist", [] as videoFileDataType[]);

const delVideo = (path) => {
  window.myElectron
    .onDelToVideo(path)
    .then((res: { message: string; type: "success" | "error" }) => {
      ElMessage.closeAll();
      if (res.type == "error") {
        ElMessage({
          message: res.message,
          type: "error",
          duration: 1000,
        });
      } else {
        ElMessage({
          message: "删除成功",
          type: "success",
          duration: 1000,
        });
        videoFileDataList.value = isReverhandle();
      }

      //根据item获取索引
      const index = storage.value.findIndex((item) => item.filePath === path);
      storage.value.splice(index, 1);
    });
};

const openFolder = (path) => {
  window.myElectron.onOpenFolder(path);
};
const onCopyFile = (path) => {
  window.myElectron.onCopyFile(path);
};
const copyFileName = (fileName) => {
  navigator.clipboard.writeText(fileName);
  ElMessage({
    message: "复制成功",
    type: "success",
    duration: 1000,
  });
};
const opFileVideo = (path) => {
  window.myElectron.onOpenFile(path);
};

//监听storage
watch(storage, (val) => {
  videoFileDataList.value = val;
});

const isRever = ref(false);
//时间排序功能
const videoFileDataList = ref(storage.value);
const sortDatalist = () => {
  isRever.value = !isRever.value;
  videoFileDataList.value = isReverhandle();
};
//处理是否排序的数据
function isReverhandle() {
  return storage.value.sort((a, b) => {
    const createTimeA = dayjs(a.createTime).unix();
    const createTimeB = dayjs(b.createTime).unix();
    return isRever.value
      ? createTimeA - createTimeB
      : createTimeB - createTimeA;
  });
}
</script>

<template>
  <main
    class="relative w-full h-full grid grid-rows-[24px_1fr] pointer-events-auto rounded-lg font-[dindin] px-4 py-2 text-[0.8125rem] leading-5 shadow-xl shadow-black/5 ring-2 ring-[var(--themeColor)]"
  >
    <section
      class="grid grid-cols-[200px_1fr_100px_110px] pr-[7px] border-[#000] border-solid border-b-2"
    >
      <p v-for="(item, index) in tableNav" :key="index">
        {{ item }}
        <span v-if="index === 0" @click="sortDatalist">
          <LzyIcon
            width="15px"
            height="15px"
            :name="isRever ? 'mdi:sort-ascending' : 'mdi:sort-descending'"
          >
          </LzyIcon>
        </span>
      </p>
    </section>
    <section class="l-scroll-listView overflow-hidden overflow-y-scroll">
      <div
        class="grid grid-cols-[200px_1fr_100px_110px] h-8 text-base items-center"
        v-for="(item, index) in videoFileDataList"
        :key="index"
      >
        <span>{{ item.createTime }}</span>
        <span class="select-all" @dblclick="copyFileName(item.fileName)">
          <LzyIcon
            :name="
              item.fileName.indexOf('.webm') >= 0
                ? 'octicon:video-16'
                : 'heroicons:photo-20-solid'
            "
            style="vertical-align: text-top"
          ></LzyIcon>
          {{ item.fileName }}
        </span>
        <span>{{ formatFileSize(item.fileSize) }}</span>
        <div class="flex gap-1 text-sm">
          <LzyIcon
            :tipPosition="index === 0 ? 'bottom' : 'top'"
            @click="opFileVideo(item.filePath)"
            :tip="item.filePath.indexOf('.webm') >= 0 ? '打开视频' : '打开图片'"
            name="mdi-light:eye"
          ></LzyIcon>
          <LzyIcon
            :tipPosition="index === 0 ? 'bottom' : 'top'"
            @click="delVideo(item.filePath)"
            tip="删除"
            name="mdi-light:delete"
          ></LzyIcon>
          <LzyIcon
            :tipPosition="index === 0 ? 'bottom' : 'top'"
            @click="openFolder(item.filePath)"
            tip="打开文件夹"
            name="mdi-light:folder-multiple"
          ></LzyIcon>
          <LzyIcon
            :tipPosition="index === 0 ? 'bottom' : 'top'"
            @click="onCopyFile(item.filePath)"
            tip="复制到剪切板"
            name="mdi-light:clipboard"
          ></LzyIcon>
        </div>
      </div>
    </section>
  </main>
</template>

<style></style>

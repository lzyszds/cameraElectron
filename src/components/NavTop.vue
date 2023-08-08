<script setup lang="ts">
import { ref } from "vue";
import { popup } from "./lzyCompontens/popup";
const changeValue = ref<string>("photo");
const hasMaximize = ref<boolean>(false);
const contentChangeValue = [
  { name: "photo", title: "拍摄" },
  { name: "record", title: "录屏" },
  { name: "revImg", title: "修图" },
];
interface Emits {
  (key: string, changeValue: string): void;
}
const emits = defineEmits<Emits>();
//切换组件
const changeitem = (val: string) => {
  changeValue.value = val;
  emits("changeValue", changeValue.value);
};
//切换主题
const changeTheme = () => {
  window.myElectron.handleWin("changeTheme");
};
//最小化窗
const minimize = async () => {
  console.log(window.myElectron);
  const res = await window.myElectron.handleWin("minimize");
  //接收返回值
  console.log(`lzy  res:`, res);
};
//最大化窗口
const maximize = () => {
  hasMaximize.value = !hasMaximize.value;
  window.myElectron.handleWin("maximize");
  // ipcRenderer.send('handleWin', 'maximize')
};
//关闭窗口
const close = () => {
  popup({
    svgImg: "images/dvg.png",
    title: "温馨提示",
    info: "是否退出程序",
    confirm: () => {
      window.myElectron.handleWin("close");
    },
  });
};
</script>

<template>
  <!-- 顶部导航栏 -->
  <nav class="navbar drag font-size-20 flex justify-between w-full font-[alimama] select-none">
    <div class="flex p-[0.3em] items-center gap-1 no-drag">
      <img src="/public/favicon.ico" width="24" height="24" class="rounded-full" />
      <span class="text-base text-shadow">影天技术</span>
    </div>
    <div class="grid gap-2 grid-cols-3 items-center w-52 no-drag text-base cursor-pointer">
      <div class="flex justify-center rounded-md transition hover:bg-[var(--themeColor)] hover:text-[var(--reverColor)]"
        v-for="item of contentChangeValue" :key="item.name" :class="{ active: changeValue == item.name }"
        @click="changeitem(item.name)">
        {{ item.title }}
      </div>
    </div>

    <div class="grid grid-cols-4 w-48 no-drag">
      <button class="windHandleBtn hover:bg-[var(--setWindBtnColor)]" @click="changeTheme">
        <LzyIcon width="15px" height="15px" name="mdi:theme-light-dark"></LzyIcon>
      </button>
      <button class="windHandleBtn hover:bg-[var(--setWindBtnColor)]" @click="minimize">
        <LzyIcon name="mdi:horizontal-line"></LzyIcon>
      </button>
      <button class="windHandleBtn hover:bg-[var(--setWindBtnColor)] simple" @click="maximize">
        <LzyIcon width="15px" height="15px" :name="hasMaximize ? 'ph:copy-simple-bold' : 'ph:rectangle-bold'"></LzyIcon>
      </button>
      <button class="windHandleBtn hover:bg-[#c42b1c] hover:text-[#fff]" @click="close">
        <LzyIcon name="iconamoon:close-bold"></LzyIcon>
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.windHandleBtn {
  border-radius: 0;
  text-align: center;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bgColor);
}

.active {
  color: var(--reverColor);
  background-color: var(--themeColor);
  border-radius: 5px;
}
</style>

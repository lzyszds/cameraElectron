<script setup lang="ts">
import { ref } from "vue";
import { popup } from "./lzyCompontens/popup";
const hasMaximize = ref<boolean>(false);
//切换主题
const changeTheme = () => {
  window.myElectron.onHandleWin("changeTheme");
};
//最小化窗
const minimize = async () => {
  await window.myElectron.onHandleWin("minimize");
};
//最大化窗口
const maximize = () => {
  hasMaximize.value = !hasMaximize.value;
  window.myElectron.onHandleWin("maximize");
};
//关闭窗口
const close = () => {
  popup({
    svgImg: "images/dvg.png",
    title: "温馨提示",
    info: "是否退出程序",
    confirm: () => {
      window.myElectron.onHandleWin("close");
    },
  });
};
</script>

<template>
  <!-- 顶部导航栏 -->
  <nav
    class="navbar drag font-size-20 flex justify-between w-full font-[alimama] select-none"
  >
    <div class="flex p-[0.3em] items-center gap-1 no-drag">
      <img src="/favicon.ico" width="24" height="24" class="rounded-full" />
      <span class="text-base text-shadow">影天技术</span>
    </div>
    <div class="grid grid-cols-4 w-48 no-drag">
      <button
        class="windHandleBtn hover:bg-[var(--setWindBtnColor)]"
        @click="changeTheme"
      >
        <LzyIcon
          width="15px"
          height="15px"
          name="mdi:theme-light-dark"
        ></LzyIcon>
      </button>
      <button
        class="windHandleBtn hover:bg-[var(--setWindBtnColor)]"
        @click="minimize"
      >
        <LzyIcon name="mdi:horizontal-line"></LzyIcon>
      </button>
      <button
        class="windHandleBtn hover:bg-[var(--setWindBtnColor)] simple"
        @click="maximize"
      >
        <LzyIcon
          width="15px"
          height="15px"
          :name="hasMaximize ? 'ph:copy-simple-bold' : 'ph:rectangle-bold'"
        ></LzyIcon>
      </button>
      <button
        class="windHandleBtn hover:bg-[#c42b1c] hover:text-[#fff]"
        @click="close"
      >
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

<script setup lang="ts">
import { ref } from "vue";
import { popup } from "./lzyCompontens/popup";
const changeValue = ref<string>("revImg");
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
  <nav class="navbar bg-body-tertiary">
    <div class="logoitem">
      <img src="/public/favicon.ico" alt="Logo" width="24" height="24" class="logo" />
      <span>影天技术</span>
    </div>
    <div class="contentChange">
      <div
        class="changeItem"
        v-for="item of contentChangeValue"
        :key="item.name"
        :class="{ active: changeValue == item.name }"
        @click="changeitem(item.name)"
      >
        {{ item.title }}
      </div>
    </div>

    <div class="closeTools">
      <button class="toolsbtn" @click="changeTheme">
        <LzyIcon name="mdi:theme-light-dark"></LzyIcon>
      </button>
      <button class="toolsbtn" @click="minimize">
        <LzyIcon name="mdi:horizontal-line"></LzyIcon>
      </button>
      <button class="toolsbtn simple" @click="maximize">
        <LzyIcon name="ph:copy-simple-bold"></LzyIcon>
      </button>
      <button class="toolsbtn" @click="close">
        <LzyIcon name="iconamoon:close-bold"></LzyIcon>
      </button>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.navbar {
  line-height: 24px;
  font-size: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  -webkit-app-region: drag; //拖动窗口
  font-family: "alimama";

  .logoitem {
    height: 24px;
    display: flex;
    padding: 0.3em;
    align-items: center;

    .logo {
      vertical-align: middle;
      margin-right: 0.2em;
      border-radius: 50%;
    }

    span {
      font-size: 16px;
      text-shadow: 0 0 1px #000;
      user-select: none;
    }
  }

  .contentChange {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    justify-items: center;
    align-items: center;
    width: 200px;
    //禁止拖动窗口
    -webkit-app-region: no-drag;
    font-size: 16px;
    font-family: "dindin";
    user-select: none;
    cursor: pointer;

    .changeItem {
      width: 100%;
      height: 70%;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 5px;
      transition: background 0.2s;

      &.active,
      &:hover {
        background: var(--themeColor);
        color: #fff;
      }
    }
  }

  .closeTools {
    width: 180px;
    display: grid;
    grid-template-columns: repeat(4, 45px);
    //禁止拖动窗口
    -webkit-app-region: no-drag;

    .toolsbtn {
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
      border-radius: 0;
      transition: background 0.2s;

      &.simple svg {
        width: 15px;
        height: 15px;
        translate: 0 -2px;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
    }
  }
}
</style>

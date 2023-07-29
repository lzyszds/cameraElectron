<script setup lang='ts'>
//最小化窗口
const minimize = async () => {
  console.log(window.myElectron);
  const res = await window.myElectron.handleWin('minimize')
  //接收返回值
  console.log(`lzy  res:`, res)
}
//最大化窗口
const maximize = () => {
  window.myElectron.handleWin('maximize')
  // ipcRenderer.send('handleWin', 'maximize')
}
//关闭窗口
const close = () => {
  window.myElectron.handleWin('close')
}
</script>

<template>
  <!-- 顶部导航栏 -->
  <nav class="navbar bg-body-tertiary">
    <div class="logoitem">
      <img src="/public/favicon.ico" alt="Logo" width="24" height="24" class="logo">
      <span>影天技术</span>
    </div>
    <div class="closeTools">
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

<style lang='scss' scoped>
.navbar {
  line-height: 24px;
  font-size: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;

  .logoitem {
    height: 24px;
    display: flex;
    padding: .3em;
    align-items: center;

    .logo {
      vertical-align: middle;
      margin-right: .2em;
    }

    span {
      font-size: 16px;
      text-shadow: 0 0 1px #000;
      user-select: none;
    }
  }

  .closeTools {
    width: 135px;
    display: grid;
    grid-template-columns: repeat(3, 45px);

    .toolsbtn {
      background: none;
      border: none;
      outline: none;
      cursor: pointer;
      border-radius: 0;
      transition: background .2s;

      button {}

      &.simple svg {
        width: 15px;
        height: 15px;
        translate: 0 -2px;
      }

      &:hover {
        background: rgba(0, 0, 0, .1);
      }
    }
  }
}
</style>

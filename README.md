# electron-vite-vue

🥳 Really simple `Electron` + `Vue` + `Vite` boilerplate.

## Features

📦 Out of the box  
🎯 Based on the official [template-vue-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-vue-ts), less invasive  
🌱 Extensible, really simple directory structure  
💪 Support using Node.js API in Electron-Renderer  
🔩 Support C/C++ native addons  
🖥 It's easy to implement multiple windows  

## Quick Start

```sh
npm create electron-vite
```

<!-- [![quick-start](https://asciinema.org/a/483731.svg)](https://asciinema.org/a/483731) -->

![electron-vite-vue.gif](/electron-vite-vue.gif)

## Debug

![electron-vite-react-debug.gif](https://github.com/electron-vite/electron-vite-react/blob/main/electron-vite-react-debug.gif?raw=true)

## Directory

```diff
+ ├─┬ electron
+ │ ├─┬ main
+ │ │ └── index.ts    entry of Electron-Main
+ │ └─┬ preload
+ │   └── index.ts    entry of Preload-Scripts
  ├─┬ src
  │ └── main.ts       entry of Electron-Renderer
  ├── index.html
  ├── package.json
  └── vite.config.ts
```

<!--
## Be aware

🚨 By default, this template integrates Node.js in the Renderer process. If you don't need it, you just remove the option below. [Because it will modify the default config of Vite](https://github.com/electron-vite/vite-plugin-electron-renderer#config-presets-opinionated).

```diff
# vite.config.ts

export default {
  plugins: [
-   // Use Node.js API in the Renderer-process
-   renderer({
-     nodeIntegration: true,
-   }),
  ],
}
```
-->

## FAQ

#### 开启nodeIntegration: true,contextIsolation: false的情况下(不推荐，不安全)

使用在主进程里\electron\main\index.ts 中，下面是对window操作的方法


```ts
import { ipcMain } from 'electron'
export const handleWin = (win, app) => {
  //操作窗口（window） 接收消息
  ipcMain.on('handleWin', (event, arg) => {
    console.log(arg)
    if (arg == 'close') {
      //关闭窗口
      win = null
      if (process.platform !== 'darwin') app.quit()
    } else if (arg == 'minimize') {
      //最小化窗口
      win?.minimize()
    } else if (arg == 'maximize') {
      //最大化窗口
      if (win?.isMaximized()) {
        return win?.unmaximize()
      }
      win?.maximize()
    }
    event.reply('main-msg', '好的');  // 给渲染进程回复消息
  })
}
//在create之后调用
app.whenReady().then(() => {
  createWindow();
  //对窗口进行操作（放大缩小关闭）在此操作自定义属性
  handleWin(win, app)
})

```

在vue中使用这种形式接收或者发出

```ts
const close = ()=>{
  //接收
  ipcRenderer.on('main-msg', (event, arg) => {
    console.log(arg) // prints '好的'
  })
  // 给主进程发消息
  ipcRenderer.send('handleWin', 'close')
}
```

> *警告：启用nodeIntegration和禁用contextIsolation在生产中不安全*
>
> 考虑使用contextBridge.exxposeInMainWorld，以下是使用contextBridge.exxposeInMainWorld方法

#### 开启nodeIntegration: false,contextIsolation: true的情况下(比较推荐，安全性高)

以下使用的是

使用在主进程里\electron\main\index.ts 中，下面是对window操作的方法

```ts
import { ipcMain } from "electron"

export const handleWin = (win, app) => {
  //操作窗口（window）
  ipcMain.handle('onHandleWin', (event, arg) => {
    if (arg == 'close') {
      //关闭窗口
      win = null
      if (process.platform !== 'darwin') app.quit()
    } else if (arg == 'minimize') {
      //最小化窗口
      win?.minimize()
    } else if (arg == 'maximize') {
      //最大化窗口 
      if (win?.isMaximized()) {
        return win?.unmaximize()
      }
      win?.maximize()
    }
    return 'success' //返回给渲染器，返回的是一个promise
  })
}

//在create之后调用
app.whenReady().then(() => {
  createWindow();
  //对窗口进行操作（放大缩小关闭）在此操作自定义属性
  handleWin(win, app)
})
```

> 这里其实返回值'success'写不写无所谓，主要是学习功能，后面开发少踩点坑！

对比之前的方式，这里要多一步，得先通过preload.ts（热更新）进行配置window对象给vue中使用

```ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
  'myElectron',//全局window对象中的key值，下面是window.myElectron内部方法，直接调用即可
  {
    handleWin: (val) => ipcRenderer.invoke('onHandleWin', val),
  }
)
```

在vue中使用这种形式接收或者发出，我是通过val值来判断当前是需要什么功能

```ts	
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
}
//关闭窗口
const close = () => {
  window.myElectron.handleWin('close')
}
</script>
```

## Face Mesh

`FaceAPI landmark 的地标模型返回68点人脸网格，如下图所示：

![facemesh](/public/images/facemesh.png)


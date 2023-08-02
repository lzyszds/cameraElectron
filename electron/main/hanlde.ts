import { ipcMain, nativeTheme, dialog } from "electron"
import fs from 'fs'
import path from 'node:path'

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
      //最大化窗口 判断是否最大化 如果是就还原
      if (win?.isMaximized()) {
        return win?.unmaximize()
      }
      win?.maximize()
    } else if (arg == 'changeTheme') {
      //切换主题
      if (nativeTheme.shouldUseDarkColors) {
        nativeTheme.themeSource = "light";
      } else {
        nativeTheme.themeSource = "dark";
      }
    }
    return 'success' //返回给渲染器，返回的是一个promise
  })
}
//操作摄像头设备
export const onDeviceVideo = (win, app) => {
  ipcMain.handle('onDeviceVideo', (event, arg) => {
    let filePath: string = ''
    try {
      filePath = dialog.showOpenDialogSync({ properties: ['openDirectory'] })[0]
    } catch (e) {
      return 'Error'
    }
    /*在这里可以进行对 Blob 数据的处理，如保存为文件等
        例如，将 Blob 数据保存为视频文件 当前项目全程使用.webm视频格式 */
    /* 视频名字进行处理 避免重复 因为是独立使用的
    不可能出现同一时间录制多个视频，所以只需要使用时间戳就行了 */
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substr(2, 5);
    const fileName = `/video_${timestamp}_${randomStr}.webm`;
    filePath += fileName;
    // 写入文件
    fs.writeFileSync(filePath, Buffer.from(arg));
    return filePath//返回给渲染器，返回的是一个promise
  })
}
//存储文件时先判断当前路径是否存在文件夹，不存在先创建
function mkdirsSync(dirname) {
  // 判断目录是否存在
  if (fs.existsSync(dirname)) {
    // 如果目录已存在，直接返回 true，表示目录创建成功
    return true;
  } else {
    // 如果目录不存在，递归创建上级目录
    if (mkdirsSync(path.dirname(dirname))) {
      // 上级目录创建成功后，创建当前目录
      fs.mkdirSync(dirname);
      // 返回 true，表示目录创建成功
      return true;
    }
  }
}

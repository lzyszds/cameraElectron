
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
  'myElectron',
  {
    //窗口操作
    handleWin: (val) => ipcRenderer.invoke('onHandleWin', val),
    //储存录制视频 （参数：视频路径）
    saveDeviceVideo: (val) => ipcRenderer.invoke('saveDeviceVideo', val),
    //删除指定视频（参数：视频路径）
    onDelToVideo: (val) => ipcRenderer.invoke('onDelToVideo', val),
    //打开文件夹
    onOpenFolder: (val) => ipcRenderer.invoke('onOpenFolder', val),
    //打开文件
    onOpenFile: (val) => ipcRenderer.invoke('onOpenFile', val),
    //复制文件进剪切板
    onCopyFile: (val) => ipcRenderer.invoke('onCopyFile', val),
  }
)








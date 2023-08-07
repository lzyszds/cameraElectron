
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
  'myElectron',
  {
    handleWin: (val) => ipcRenderer.invoke('onHandleWin', val),
    //储存录制视频 （参数：视频路径）
    saveDeviceVideo: (val) => ipcRenderer.invoke('saveDeviceVideo', val),
    //删除指定视频（参数：视频路径）
    onDelToVideo: (val) => ipcRenderer.invoke('onDelToVideo', val),
  }
)








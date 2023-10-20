
import { contextBridge, ipcRenderer } from 'electron'


const validChannels = [
  'onHandleWin', // 窗口操作
  'saveDeviceVideo',  // 保存视频
  'onDelToVideo', // 删除视频
  'onOpenFolder', // 打开文件夹
  'onOpenFile',   // 打开文件
  'onCopyFile',  // 复制文件进剪切板
  'onDesktopRecord',  // 桌面录制
  'getMousePosition', // 获取鼠标位置
  'onSetTopPopupGetPosition', // 设置置顶弹窗位置
  'startRecord',  // 开始录制
  'endRecord',  // 结束录制
  'photograph', // 拍照
]

const myElectron = {}
validChannels.forEach((channel) => {
  myElectron[channel] = (...args) => ipcRenderer.invoke(channel, ...args)
})


contextBridge.exposeInMainWorld('myElectron', myElectron)








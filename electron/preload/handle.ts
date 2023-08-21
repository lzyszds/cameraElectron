
import { contextBridge, ipcRenderer } from 'electron'


const validChannels = [
  'onHandleWin',
  'saveDeviceVideo',
  'onDelToVideo',
  'onOpenFolder',
  'onOpenFile',
  'onCopyFile',
  'onDesktopRecord',
  'getMousePosition',
  'onSetTopPopupGetPosition',
]

const myElectron = {}
validChannels.forEach((channel) => {
  myElectron[channel] = (...args) => ipcRenderer.invoke(channel, ...args)
})


contextBridge.exposeInMainWorld('myElectron', myElectron)









import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld(
  'myElectron',
  {
    handleWin: (val) => ipcRenderer.invoke('onHandleWin', val),
  }
)








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
    return 'success'
  })
}

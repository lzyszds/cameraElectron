import { app, BrowserWindow, shell, ipcMain, contextBridge, ipcRenderer } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import remote from '@electron/remote/main'
import { WindowManager } from './handle'

//构建的目录结构
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

//禁用Windows 7的GPU加速
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

//为Windows 10+通知设置应用程序名称
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

//删除电子安全警告
//此警告仅在开发模式中显示
//在上阅读更多信息https://www.electronjs.org/docs/latest/tutorial/security
//process.env[ELECTRON_DISABLE_SECURITY_WARNINGS']='true'

let win: BrowserWindow | null = null
//在这里，您还可以使用其他预加载
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

remote.initialize()

async function createWindow() {
  win = new BrowserWindow({
    width: 1800,
    height: 1000,
    minWidth: 1050,
    minHeight: 800,
    title: 'Main window',
    autoHideMenuBar: true,//隐藏菜单栏
    show: true, // 先不显示
    frame: false,//隐藏窗口标题栏
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      //警告：启用nodeIntegration和禁用contextIsolation在生产中不安全
      //考虑使用contextBridge.exxposeInMainWorld
      //在上阅读更多信息https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // 如果应用程序未打包，请打开devTool
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // 测试向电子渲染器主动推送消息
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // 使用浏览器而不是应用程序打开所有链接
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  remote.enable(win.webContents)
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}
// 预加载（孤立世界）



app.whenReady().then(() => {
  createWindow();
  //对窗口进行操作（放大缩小关闭）在此操作自定义属性
  new WindowManager(win, app);
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    //如果用户试图打开另一个主窗口，请将注意力集中在主窗口上
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

//新窗口示例arg:New windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

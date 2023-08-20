import { ipcMain, dialog, nativeTheme, shell, BrowserWindow, clipboard, nativeImage, desktopCapturer, screen, globalShortcut } from 'electron';
import type { App } from 'electron';
import { join } from 'node:path'
import fs from 'fs';
import { mkdirsSync, checkFileFoundError } from '../utils/utils'; // 假设您有一个名为 'utils' 的模块用于创建目录
import { startRecordShortcut } from './keyboard'


export class WindowManager {
  private win: BrowserWindow;
  private app: App;
  private mainWindow: BrowserWindow;
  /* 是否正在录制 */
  private isRecording: boolean;
  /* 弹窗窗口声明定义 */
  private popupWindow: BrowserWindow | null;

  constructor(win: BrowserWindow, app: App, mainWindow: BrowserWindow) {
    this.win = win;
    this.app = app;
    this.mainWindow = mainWindow;
    this.isRecording = false;
    this.popupWindow = null;

    // 注册事件监听
    // 窗口操作
    this.registerHandleWin();
    // 储存录制视频
    this.registerDeviceVideo();
    // 删除指定视频
    this.registerDelToVideo();
    // 打开文件夹
    this.registerOpenFolder();
    //打开文件
    this.registerOpenFile();
    // 复制文件进剪切板
    this.registerCopyFile()
    // 录制桌面
    this.registerDesktopRecord()
    //获取鼠标位置
    this.registerGetMousePosition()
    //置顶弹窗（解决区域选择问题）
    this.registerSetTop()
    startRecordShortcut(this.onPopupTop.bind(this))
  }

  // 处理窗口操作请求
  private handleWinAction(arg: string): Promise<string> {
    return new Promise((resolve, reject) => {
      switch (arg) {
        case 'close':
          this.closeWindow(); // 关闭窗口
          resolve('success');
          break;
        case 'minimize':
          this.minimizeWindow(); // 最小化窗口
          resolve('success');
          break;
        case 'maximize':
          this.toggleMaximize(); // 最大化/还原窗口
          resolve('success');
          break;
        case 'changeTheme':
          this.toggleTheme(); // 切换主题
          resolve('success');
          break;
        default:
          reject(new Error('Invalid action'));
      }
    });
  }

  // 处理 onHandleWin 请求
  private onHandleWin(event: Electron.IpcMainInvokeEvent, arg: string): void {
    this.handleWinAction(arg)
      .then((response) => {
        event.sender.send('onHandleWin', response)
      })
      .catch((error) => {
        event.sender.send('onHandleWin', { error: error.message })
      });
  }

  // 注册 onHandleWin 事件监听
  private registerHandleWin(): void {
    ipcMain.handle('onHandleWin', this.onHandleWin.bind(this));
  }

  // 关闭窗口
  private closeWindow(): void {
    this.win = null;
    if (process.platform !== 'darwin') this.app.quit();
  }

  // 最小化窗口
  private minimizeWindow(): void {
    this.win?.minimize();
  }

  // 切换最大化/还原窗口
  private toggleMaximize(): void {
    if (this.win?.isMaximized()) {
      this.win?.unmaximize();
    } else {
      this.win?.maximize();
    }
  }

  // 切换主题
  private toggleTheme(): void {
    nativeTheme.themeSource = nativeTheme.shouldUseDarkColors ? 'light' : 'dark';
  }

  // 保存视频逻辑
  private saveDeviceVideo(event: Electron.IpcMainInvokeEvent, arg: any): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        let filePath = '';

        if (arg.isSaveAs) {
          filePath = dialog.showOpenDialogSync({
            title: '选择视频保存路径',
            properties: ['openDirectory'],
          })[0];
        } else if (!arg.isSave && mkdirsSync(`${this.app.getPath('documents')}\\ytjs`)) {
          filePath = `${this.app.getPath('documents')}\\ytjs`;
        }

        const timestamp = new Date().getTime();
        const randomStr = Math.random().toString(36).substr(2, 5);
        const fileName = `\\video_${timestamp}_${randomStr}.webm`;
        filePath += fileName;
        console.log(`lzy  filePath:`, filePath)

        fs.writeFileSync(filePath, Buffer.from(arg.arrayBuffer));
        resolve(filePath)
      } catch (e) {
        reject(e)
      }
    })
  }

  // 注册 saveDeviceVideo 事件监听
  private registerDeviceVideo(): void {
    ipcMain.handle('saveDeviceVideo', this.saveDeviceVideo.bind(this));
  }
  // 删除指定视频
  private async onDelToVideo(event: Electron.IpcMainInvokeEvent, arg: any)
    : Promise<{ type: 'success' | 'error', message: string, }> {
    try {
      fs.unlinkSync(arg);
      return {
        type: 'success',
        message: arg,
      };
    } catch (e) {
      // 假设变量 e 包含错误信息
      // 检查错误提示是否为文件不存在，并设置对应的消息
      let message;
      if (checkFileFoundError.checkFileNotFoundError(e)) {
        message = "文件不存在，在此之前已删除";
      } else if (checkFileFoundError.checkPermissionDeniedError(e)) {
        message = "没有权限进行文件操作";
      } else {
        // 其他错误，使用错误消息本身
        message = typeof e === 'string' ? e : e.message;
      }
      return { type: 'error', message };
    }
  }

  // 注册 onDelToVideo 事件监听
  private registerDelToVideo(): void {
    ipcMain.handle('onDelToVideo', this.onDelToVideo.bind(this));
  }

  // 打开文件夹事件逻辑
  private async onOpenFolder(event: Electron.IpcMainInvokeEvent, arg: any) {
    //判断文件夹是否存在
    if (fs.existsSync(arg)) {
      shell.showItemInFolder(arg);
    } else {
      dialog.showErrorBox('提示', '文件夹不存在');
    }
  }
  // 注册 onOpenFolder 事件监听
  private registerOpenFolder(): void {
    ipcMain.handle('onOpenFolder', this.onOpenFolder.bind(this));
  }
  //打开文件
  private async onOpenFile(event: Electron.IpcMainInvokeEvent, arg: any) {
    const filePath = arg.split('\\').slice(0, -1).join('\\');
    console.log(`lzy  fs.existsSync(filePath):`, fs.existsSync(filePath))

    //判断文件夹是否存在 
    if (fs.existsSync(filePath)) {
      //文件是否存在
      if (!fs.existsSync(arg)) {
        return dialog.showErrorBox('提示', '文件不存在');
      }
      shell.openPath(arg);
    } else {
      dialog.showErrorBox('提示', '文件夹不存在');
    }
  }
  // 注册 onOpenFile 事件监听
  private registerOpenFile(): void {
    ipcMain.handle('onOpenFile', this.onOpenFile.bind(this));
  }

  // 复制文件进剪切板 // 未完成
  private onCopyFile(event: Electron.IpcMainInvokeEvent, arg: any) {
    const filePath = arg;

    //判断文件夹是否存在
    if (fs.existsSync(filePath)) {
      // 读取文件内容
      // 读取视频文件的内容
      fs.readFile(filePath, 'base64', (err: any, data) => {
        if (err) {
          console.error('无法读取视频文件:', err);
          return;
        }
        // 将 Buffer 编码的视频数据写入剪贴板
        clipboard.writeImage(nativeImage.createFromDataURL(`${data}`));

        console.log('视频数据已复制到剪贴板');
      });
    } else {
      dialog.showErrorBox('提示', '文件不存在');
    }
  }
  // 注册 onCopyFile 事件监听
  private registerCopyFile(): void {
    ipcMain.handle('onCopyFile', this.onCopyFile.bind(this));
  }
  //录制桌面屏幕
  private async onDesktopRecord(event: Electron.IpcMainInvokeEvent, arg: any) {
    this.isRecording = true;
    const sources = await desktopCapturer.getSources({ types: ['screen'] });
    return sources[0].id
  }
  // 注册 onDesktopRecord 事件监听
  private registerDesktopRecord(): void {
    ipcMain.handle('onDesktopRecord', this.onDesktopRecord.bind(this));
  }
  //获取鼠标位置
  private async onGetMousePosition(event: Electron.IpcMainInvokeEvent, arg: any) {
    return screen.getCursorScreenPoint()
  }
  // 注册 onGetMousePosition 事件监听
  private registerGetMousePosition(): void {
    ipcMain.handle('getMousePosition', this.onGetMousePosition.bind(this));
  }
  //popup置顶弹窗
  private async onPopupTop(event: Electron.IpcMainInvokeEvent, arg: any) {
    if (!this.popupWindow) {
      this.popupWindow = new BrowserWindow({
        width: screen.getPrimaryDisplay().size.width,
        height: screen.getPrimaryDisplay().size.height,
        alwaysOnTop: true, // 设置为置顶
        frame: false, // 隐藏窗口边框
        parent: this.mainWindow, // 设置父窗口
        // modal: false, // 阻止与弹窗之外的内容交互
        // focusable: false, // 设置为不可聚焦
        useContentSize: true, // 使用内容大小，而不是整体窗口大小
        titleBarStyle: 'hidden', // 隐藏标题栏
        transparent: true, // 设置透明
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });
      const drawHtml = join(process.env.DIST, '../draw.html')
      this.popupWindow.loadFile(drawHtml);
      this.popupWindow.webContents.openDevTools();
      // this.popupWindow.setFullScreen(true);
      // 监听从弹窗发送的消息
      ipcMain.on('popup-close', (event, message) => {
        if (!this.popupWindow) return console.log('this.popupWindow is null')
        this.popupWindow.close();
        this.popupWindow = null
      });
      //按esc退出弹窗
      globalShortcut.register('Esc', () => {
        if (!this.popupWindow) return console.log('this.popupWindow is null')
        this.popupWindow.close();
        this.popupWindow = null
        globalShortcut.unregister('Esc');
      })

    } else {
      this.popupWindow.close();
      return this.popupWindow = null
    }

  }
  // 注册 onSetTopPopupGetPosition 事件监听
  private registerSetTop(): void {
    ipcMain.handle('onSetTopPopupGetPosition', this.onPopupTop.bind(this));
  }
}

import { ipcMain, dialog, nativeTheme, shell, clipboard, nativeImage } from 'electron';
import type { BrowserWindow, App } from 'electron';
import fs from 'fs';
import { mkdirsSync, checkFileFoundError } from '../utils/utils'; // 假设您有一个名为 'utils' 的模块用于创建目录

export class WindowManager {
  private win: BrowserWindow;
  private app: App;

  constructor(win: BrowserWindow, app: App) {
    this.win = win;
    this.app = app;
    // 注册事件监听
    // 窗口操作
    this.registerHandleWin();
    // 储存录制视频
    this.registerDeviceVideo();
    // 删除指定视频
    this.registerDelToVideo();
    // 打开文件夹
    this.registerOpenFolder();
    // 复制文件进剪切板
    this.registerCopyFile()
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
    console.log(`lzy  arg:`, arg.split('/').slice(0, -1).join('/'))
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

}

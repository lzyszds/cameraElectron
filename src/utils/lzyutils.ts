import { ElNotification } from 'element-plus';
import dayjs from 'dayjs';

// Define types for the parameters and return types

interface SplitArrayReturnType<T> {
  data: T[][];
}

type TimeRule = (n: number) => boolean;
type TimeRuleFunction = (n: number) => string;


// 此函数获取一个数组并将其拆分为更小的块
export function splitArray<T>(array: T[], size: number): SplitArrayReturnType<T> {
  // 创建一个空数组以容纳较小的块
  const data: T[][] = [];
  // 在原始数组上循环
  for (let i = 0; i < array.length; i += size) {
    // 对于每个迭代，向新数组添加一个新块
    data.push(array.slice(i, i + size));
  }
  // return 一个新数组
  return { data };
}

// 时间格式化为字符串 比如说前天 几天前，几小时前
export function timeAgo(time: number): string {
  const t = dayjs().unix() - time; // 获取当前时间戳与传入时间戳的差值
  const i = 60;
  const h = i * 60;
  const d = h * 24;
  const m = d * 30;
  const y = m * 12;
  // 使用 Map 存储时间转换的规则，每个规则由一个判断函数和一个转换函数组成
  const timeRules: any = new Map([
    [n => n < i, () => '一分钟'],
    [n => n < h, n => (n / i >> 0) + '分钟'],
    [n => n < d, n => (n / h >> 0) + '小时'],
    [n => n < m, n => (n / d >> 0) + '天'],
    [n => n < y, n => (n / m >> 0) + '月'],
    [
      () => true,
      n => (n / y >> 0) + '年'
    ],
  ]);
  // 通过遍历 Map 找到符合条件的规则并执行转换函数，获取时间描述字符串
  return [...timeRules].find(([n]) => n(t))?.[1](t) + '前';
}

// 视频音频时间  格式化时间
/* 视频或音频的时长转化为标准化的xx:xx:xx格式 */
export function formatDuration(time: number): string {
  if (time > -1) {
    const hours = Math.floor(time / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((time % 3600) / 60).toString().padStart(2, '0');
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  } else {
    return '00:00:00';
  }
}
// 文件大小格式化
export function formatFileSize(fileSize: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;

  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }

  return fileSize.toFixed(2) + units[index];
}

// 将文件大小字符串（带单位，不区分大小写）转换为字节数
export function fileSizeToBytes(fileSizeStr: string): number {
  const units: { [key: string]: number } = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
  };

  const regex = /^([\d.]+)\s*(B|KB|MB|GB|TB)$/i; // 添加 i 标志，使正则匹配不区分大小写
  const match = fileSizeStr.match(regex);

  if (!match) {
    throw new Error('无效的文件大小格式。必须是带有数字和单位（B、KB、MB、GB、TB）的字符串。');
  }

  const num = parseFloat(match[1]);
  const unit = match[2].toUpperCase(); // 将单位转换为大写形式

  if (!units.hasOwnProperty(unit)) {
    throw new Error('无效的文件大小单位。必须是 B、KB、MB、GB、TB 中的一个。');
  }

  return num * units[unit];
}

// 将 base64 字符串转换为二进制流(Blob)对象
export function base64toBlob(dataurl: string): Blob {
  const [header, data] = dataurl.split(",");
  const mime = header.match(/:(.*?);/)![1]; // 从头部信息中获取文件的 MIME 类型
  const bstr = atob(data); // base64 解码
  const n = bstr.length;
  const u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    u8arr[i] = bstr.charCodeAt(i); // 将解码后的二进制数据存储为 Uint8Array
  }
  return new Blob([u8arr], { type: mime }); // 创建 Blob 对象并返回
}

// 将二进制流(Blob)对象转换为 base64 格式
export function getBase64(data: Blob | Uint8Array, type: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([data], { type });
    const reader = new FileReader();
    reader.readAsDataURL(blob); // 将 Blob 对象读取为 base64 字符串
    reader.onload = () => resolve(reader.result as string); // 读取成功时解析 base64 字符串结果
    reader.onerror = reject; // 读取错误时拒绝错误
  });
}

// 上传图片，图片太大，如何在前端实现图片压缩后上传
export function compressPic(file: File, quality: number): Promise<{ base64: string; fileCompress: Blob }> {
  return new Promise((resolve, reject) => {
    getBase64(file, file.type).then((res) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = res;
      img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0, canvas.width, canvas.height);
        // 转换成base64格式 quality为图片压缩质量 0-1之间  值越小压缩的越大 图片质量越差
        const base64 = canvas.toDataURL(file.type, quality);
        const fileCompress = base64toBlob(base64);
        resolve({ base64, fileCompress });
      };
      img.onerror = function (error) {
        reject("压缩失败：" + error);
      };
    }).catch((error) => {
      reject("获取图片数据失败：" + error.message);
    });
  });
}

// 默认弹窗
export function LNotification(val: string, time = 2000, postion: any = 'bottom-right'): void {
  ElNotification.closeAll();
  ElNotification({
    dangerouslyUseHTMLString: true,
    message: val,
    position: postion,
    duration: time,
    customClass: 'copy-success'
  });
}

// 图片加载器 将图像对象在初始化时加载，并在后续渲染时重复使用。
class ImageLoader {
  // 创建一个私有属性 imageCache，用于存储图像 URL 与图像对象的映射关系
  private imageCache: Map<string, HTMLImageElement> = new Map();
  // 异步方法，用于加载图像并缓存
  async loadImage(src: string): Promise<HTMLImageElement> {
    // 如果 imageCache 中已经有了这个 URL 对应的图像对象，直接返回已缓存的对象
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!;
    } else {
      // 创建一个新的 HTMLImageElement 对象
      const img = new Image();
      // 设置图像的 URL 为传入的 src
      img.src = src;
      // 等待图像加载和解码完成
      await img.decode();
      // 将图像对象缓存到 imageCache 中，以便下次使用
      this.imageCache.set(src, img);
      // 返回加载好的图像对象
      return img;
    }
  }
}
// 创建一个名为 imageLoader 的 ImageLoader 类的实例，用于加载和缓存图像
export const imageLoader = new ImageLoader();


/** 
  * window.Notification
  * options：一个包含其他通知参数的对象，可以用来设置通知的其他属性，如下面的参数：
  * body (正文)：通知的主要内容或消息体，通常显示在标题下面。
  * icon (图标)：通知显示的图标，可以是一个 URL 或者一个图片的相对路径。
  * badge (徽章)：通知的小图标，通常用于在桌面图标或任务栏上显示。
  * tag (标签)：通知的标签，用于将相同标签的通知归为一组，如果多次触发同样标签的通知，则只显示最后一条。
  * image (图片)：一个附加的图片，通常会显示在通知的主体内容之前。
  * vibrate (振动)：控制通知到达时设备是否振动，可以是一个持续时间的数组或布尔值。
  * renotify (再通知)：如果设置为 true，即使之前的通知已经被关闭，相同的通知标签也会再次触发通知。
  * requireInteraction (需要交互)：如果设置为 true，通知将保持可见，直到用户与之交互为止。
  * silent (静音)：如果设置为 true，通知将不会发出声音。
  * timestamp (时间戳)：通知的时间戳，用于显示通知发送的时间。
  * data (数据)：一个包含任意附加数据的对象，可以在通知的事件处理程序中使用。
*/
export function windowTipiver(option) {
  return new window.Notification(option.title, option)
}

// 复制内容提示版权信息
import { useEventListener } from "@vueuse/core";

export function copyTip(): void {
  useEventListener(window, 'keydown', e => {
    if (e.ctrlKey && e.key === 'c') {
      LNotification(`<i class="iconfont icon-tishi"></i> 复制成功,转载请声明来源！`);
    }
  });
}

// 获取cookie
export function getCookie(name: string): string | undefined {
  const cookie = document.cookie.split('; ').map((item) => {
    return item.split('=');
  });
  const cookieObj: { [key: string]: string } = Object.fromEntries(cookie);
  return cookieObj[name];
}

// 设置cookie
export function setCookie(name: string, value: string, time: number): void {
  let date = dayjs();
  date = date.add(time, 'day');
  document.cookie = `${name}=${value};expires=${date}`;
}

/* 数组去重 arr: 要处理数组, key: 去重的key值 单一数组不需要key */
export function unique<T>(arr: T[], key?: string): T[] {
  const res = new Map<string | T, T>();
  return arr.filter((a) => {
    const arrKey = key ? a[key] : a;
    // has判断当前值是否在map对象中存在 ,如果不存在则将当前值添加进map对象中
    return !res.has(arrKey) && res.set(arrKey, a);
  });
}

// 时间格式化处理
export function setTime(time: string | number): string {
  const formatted = dayjs(time).format('YYYY-MM-DD');
  return formatted;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

interface HSLColor {
  h: number; // 色相，取值范围为[0, 360]
  s: number; // 饱和度，取值范围为[0, 100]
  l: number; // 亮度，取值范围为[0, 100]
}

// RGB 转 HSL
export function rgbToHsl([r, g, b]: number[]): number[] {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

// HSL 转 RGB
export function hslToRgb([h, s, l]: number[]): number[] {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

export function setTimeoutAsync(delay: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('yes');
    }, delay);
  });
}



export default {
  splitArray,
  timeAgo,
  formatDuration,
  formatFileSize,
  fileSizeToBytes,
  base64toBlob,
  getBase64,
  compressPic,
  copyTip,
  LNotification,
  getCookie,
  setCookie,
  unique,
  setTime,
  rgbToHsl,
  hslToRgb,
  windowTipiver,
  imageLoader,
  setTimeoutAsync
};

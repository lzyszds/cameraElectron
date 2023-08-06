import { Siderbar } from "@/typing/SideBarType";
import { rgbToHsl, hslToRgb } from "@/utils/lzyutils";

//左侧工具栏列表json
export const siderbar: Siderbar[] = [
  {
    title: "调整",
    name: "adjust",
    icon: "teenyicons:adjust-horizontal-alt-outline",
  },
  {
    title: "比例",
    name: "ratio",
    icon: "solar:crop-broken",
  },
];


//根据video计算canvas需要的宽高
export function resizeRatio(videoElement, canvasElement) {
  const originalWidth = videoElement!.videoWidth;
  const originalHeight = videoElement!.videoHeight;

  // 计算视频在 Canvas 中的适配宽高
  const aspectRatio = originalWidth / originalHeight;
  let newWidth = canvasElement!.width;
  let newHeight = canvasElement!.height;

  if (aspectRatio > 1) {
    // 宽度较大，根据 Canvas 宽度计算适配高度
    newHeight = canvasElement!.width / aspectRatio;
  } else {
    // 高度较大，根据 Canvas 高度计算适配宽度
    newWidth = canvasElement!.height * aspectRatio;
  }

  // 计算视频在 Canvas 中的居中位置
  const x = (canvasElement!.width - newWidth) / 2;
  const y = (canvasElement!.height - newHeight) / 2;
  return { x, y, newWidth, newHeight };
}

// 计算某个 帧的 灰度平均值
export function getGrayAverage(imagePixArray) {
  var average = function (dataArray) {
    let pixCount = dataArray.length / 4;
    let sum = 0;
    for (let i = 0; i < pixCount; i++) {
      const pixOffset = i * 4;
      let r = dataArray[pixOffset];
      let g = dataArray[pixOffset + 1];
      let b = dataArray[pixOffset + 2];
      sum = sum + (0.299 * r + 0.587 * b + 0.114 * g);
    }
    let aver = sum / dataArray.length;
    return aver;
  };
  return average(imagePixArray);
}


/**
 * 对每个像素点进行颜色调整
 * @param {Object} param - 包含 hue, saturation 和 brightness 调整参数的对象
 * @param {Uint8ClampedArray} dataArray - 视频帧数据，通常是一个 Uint8ClampedArray 类型
 * @param {number} offset - 当前像素点在 dataArray 中的偏移量，通常是每个像素由 RGBA 四个通道组成，所以 offset 表示 R 通道的索引
 */
export function change_per_pix(param, dataArray, offset) {
  // 从 RGB 转换为 HLS
  const r = dataArray[offset];
  const g = dataArray[offset + 1];
  const b = dataArray[offset + 2];
  const from = [r, g, b];

  if (Object.keys(param).some((key) => param[key] === 0)) {
    return;
  }

  const hsl = rgbToHsl(from);

  // 处理色度
  if (param.hue && param.hue !== 0) {
    // 色度的区间 [-0.5, 0.5]
    const delta = param.hue * 360;
    let hue = hsl[0] + delta;
    hue = Math.max(0, Math.min(360, hue));
    hsl[0] = hue;
  }

  // 处理饱和度
  if (param.saturation && param.saturation !== 0) {
    // 饱和度的区间 [-0.5, 0.5]
    const delta = param.saturation * 100;
    let saturation = hsl[1] + delta;
    saturation = Math.max(0, Math.min(100, saturation));
    hsl[1] = saturation;
  }

  // 处理亮度
  if (param.brightness && param.brightness !== 0) {
    // 亮度的区间 [-0.5, 0.5]
    const delta = param.brightness * 100;
    let brightness = hsl[2] + delta;
    brightness = Math.max(0, Math.min(100, brightness));
    hsl[2] = brightness;
  }

  // 从 HLS 转换回 RGB
  const newColor = hslToRgb(hsl);
  dataArray[offset] = newColor[0];
  dataArray[offset + 1] = newColor[1];
  dataArray[offset + 2] = newColor[2];
}
// 对每个像素点 调节 对比度
export function makeContrast(dataArray, average, contrast) {
  let pixCount = dataArray.length / 4;
  for (let i = 0; i < pixCount; i++) {
    const pixOffset = i * 4;
    let r = dataArray[pixOffset];
    let g = dataArray[pixOffset + 1];
    let b = dataArray[pixOffset + 2];
    let newR = r + ((r - average) * contrast) / 255;
    let newG = g + ((g - average) * contrast) / 255;
    let newB = b + ((b - average) * contrast) / 255;
    if (newR < 0) newR = 0;
    if (newR > 255) newR = 255;
    if (newG < 0) newG = 0;
    if (newG > 255) newG = 255;
    if (newB < 0) newB = 0;
    if (newB > 255) newR = 255;
    dataArray[pixOffset] = newR;
    dataArray[pixOffset + 1] = newG;
    dataArray[pixOffset + 2] = newB;
  }
}


export default {
  siderbar,
  resizeRatio,
  getGrayAverage,
  change_per_pix,
  makeContrast

}

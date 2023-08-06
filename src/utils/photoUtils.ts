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


// 对每个像素点 调节 数值
export function change_per_pix(param, dataArray, offset) {
  // 从 rgb 转成成 hls
  let r = dataArray[offset];
  let g = dataArray[offset + 1];
  let b = dataArray[offset + 2];
  let from = [r, g, b];
  let hsl = rgbToHsl(from);

  //处理 色度
  if (param.hue && param.hue != 0) {
    // delta 的区间 [-360,360]
    const delta = param.hue * 360;
    let hue = hsl[0] + delta;
    if (hue < 0) hue = 0;
    if (hue > 360) hue = 360;
    //postMsg(str);
    hsl[0] = hue;
  }
  // 处理 饱和度
  if (param.saturation && param.saturation != 0) {
    // delta 的区间 [-100,100]
    const delta = parseFloat(param.saturation) * 100;
    let saturation = hsl[1] + delta;
    if (saturation < 0) saturation = 0;
    if (saturation > 100) saturation = 100;
    hsl[1] = saturation;
  }
  // 处理 亮度
  if (param.brightness && param.brightness != 0) {
    // delta 的区间 [-100,100]
    const delta = parseFloat(param.brightness) * 100;
    let brightness = hsl[2] + delta;
    if (brightness < 0) brightness = 0;
    if (brightness > 100) brightness = 100;
    hsl[2] = brightness;
  }

  // 从 hls 转回去 rgb
  let newColor = hslToRgb(hsl);
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

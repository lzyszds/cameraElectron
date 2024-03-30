import { Siderbar } from "@/typing/SideBarType";
import { rgbToHsl, hslToRgb } from "@/utils/lzyutils";
import axios from 'axios'

//左侧工具栏列表json
export const siderbar: Siderbar[] = [
  {
    title: "调整",
    name: "adjust",
    icon: "teenyicons:adjust-horizontal-alt-outline",
  },
  {
    title: "滤镜",
    name: "filters",
    icon: "solar:filters-broken",
  },
  {
    title: "特效",
    name: "effects",
    icon: "icon-park-outline:effects",
  },
  {
    title: "文字",
    name: "text",
    icon: "mdi:format-text",
  },
  {
    title: "贴纸",
    name: "sticker",
    icon: "mdi:sticker-emoji",
  },
  {
    title: "水印",
    name: "watermark",
    icon: "material-symbols:branding-watermark-outline-rounded",
  },
  {
    title: "画框",
    name: "frame",
    icon: "mdi:picture-in-picture-bottom-right",
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
 * @param {Object} param - 包含 hue, saturation 和 light 调整参数的对象
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
  if (param.light && param.light !== 0) {
    // 亮度的区间 [-0.5, 0.5]
    const delta = param.light * 100;
    let light = hsl[2] + delta;
    light = Math.max(0, Math.min(100, light));
    hsl[2] = light;
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

function mix(x, y, b) {
  const a = b - Math.floor(b);
  return Math.floor((x * (1 - a) + y * a) * 255);
}
//据点查询table的值
export function lut3d(targetColor, table, lut3dSize) {
  const [r, g, b] = targetColor || [];

  const tr = r / 255;
  const tg = g / 255;
  const tb = b / 255;

  // 计算最大索引值
  const n = lut3dSize - 1;
  // 计算blue索引
  const b_index = tb * n;
  // 计算red索引
  const r_index = Math.floor(tr * n);
  // 计算green索引
  const g_index = Math.floor(tg * n);

  // 计算blue的离散索引
  const b_floor_idx = Math.floor(b_index);
  const b_ceil_idx = Math.ceil(b_index);

  // 找到blue所在的位置
  const b_ceil = table[b_ceil_idx];
  const b_floor = table[b_floor_idx];

  // 找到green所在的位置
  const g_ceil = b_ceil[g_index];
  const g_floor = b_floor[g_index];

  // 找到red所在的位置， red对应的点，为将要替换的rgb目标数据
  const r_ceil = g_ceil[r_index];
  const r_floor = g_floor[r_index];

  return [
    mix(r_ceil[0], r_floor[0], tb),
    mix(r_ceil[1], r_floor[1], tb),
    mix(r_ceil[2], r_floor[2], tb),
  ]
}
//解析cube文件
export function getTable(url) {
  return axios(url, {
    method: 'GET',
  })
    .then(res => {
      const tableString = res.data;
      // 按行分割字符串
      const tempArr = tableString.split('\n');
      let lut_3d_size = 0;
      let start = -1;

      const table: any = [], resTable: any = []

      for (let i = 0; i < tempArr.length; i++) {
        const str = tempArr[i];
        // 获取采样数量
        if (str.includes('LUT_3D_SIZE')) {
          lut_3d_size = +str.replace('LUT_3D_SIZE', '');
          continue;
        }

        // 将空节点与文件头过滤掉
        if (!str || /[a-z]/i.test(str)) continue;

        // 得到色彩数据开始的索引
        if (start === -1) {
          start = i;
        }

        // 计算色彩数据真实的索引
        const idx = i - start;

        // 分割rgb的值
        const pixel = str.split(' ').map(s => Number(s));

        // 根据table的排列规律，创建二维数组(33 * 33 * 33),这里我们根据从文件中实际获取到的采样数来计算
        if (!table[Math.floor(idx / lut_3d_size)]) table[Math.floor(idx / lut_3d_size)] = [];
        table[Math.floor(idx / lut_3d_size)].push(pixel);
      }

      for (let idx = 0; idx < table.length; idx++) {
        const piece = table[idx];
        if (!resTable[Math.floor(idx / lut_3d_size)]) resTable[Math.floor(idx / lut_3d_size)] = [];
        resTable[Math.floor(idx / lut_3d_size)].push(piece);
      }

      return {
        table: resTable,
        size: lut_3d_size
      }

    })
    .catch(err => {
      console.error(err)
    })
}

export default {
  siderbar,
  resizeRatio,
  getGrayAverage,
  change_per_pix,
  makeContrast,
  lut3d

}

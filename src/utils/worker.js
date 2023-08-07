// 在 worker.js 文件中进行图像处理
// 处理滤镜问题，在主渲染进程中进行滤镜计算会导致页面其他功能卡顿
// 十分影响用户体验，所以我将滤镜计算放到 Web Worker 中进行
onmessage = (event) => {
  const imageData = event.data.imageData;
  const data = imageData.data;
  const params = event.data.params;

  // 处理图像数据，这里使用你之前定义的 change_per_pix 函数
  for (let i = 0; i < data.length; i += 4) {
    change_per_pix(params, data, i);
  }
  // 处理对比度
  if (params.contrast && params.contrast != 0) {
    const avg = getGrayAverage(data);
    makeContrast(data, avg, params.contrast * 255);
  }
  // 返回处理后的图像数据
  postMessage(imageData);
};



function change_per_pix(param, dataArray, offset) {
  // 从 RGB 转换为 HLS
  const r = dataArray[offset];
  const g = dataArray[offset + 1];
  const b = dataArray[offset + 2];
  const from = [r, g, b];

  if (
    param.hue === 0 &&
    param.saturation === 0 &&
    param.brightness === 0 &&
    param.contrast === 0
  ) {
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

// 获取灰度平均值
function getGrayAverage(imagePixArray) {
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

// 对每个像素点 调节 对比度
function makeContrast(dataArray, average, contrast) {
  let pixCount = dataArray.length / 4;
  for (let i = 0; i < pixCount; i++) {
    const pixOffset = i * 4;
    let r = dataArray[pixOffset];
    let g = dataArray[pixOffset + 1];
    let b = dataArray[pixOffset + 2];
    let newR = r + ((r - average) * contrast) / 255;
    let newG = g + ((g - average) * contrast) / 255;
    let newB = b + ((b - average) * contrast) / 255;
    if (newR < 0) {
      newR = 0;
    }
    if (newR > 255) {
      newR = 255;
    }
    if (newG < 0) {
      newG = 0;
    }
    if (newG > 255) {
      newG = 255;
    }
    if (newB < 0) {
      newB = 0;
    }
    if (newB > 255) {
      newR = 255;
    }

    dataArray[pixOffset] = newR;
    dataArray[pixOffset + 1] = newG;
    dataArray[pixOffset + 2] = newB;
  }
}

// RGB to HSL conversion
function rgbToHsl([r, g, b]) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;

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
function hslToRgb([h, s, l]) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
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

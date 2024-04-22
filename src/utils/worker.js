// 在 worker.js 文件中进行图像处理
// 处理滤镜问题，在主渲染进程中进行滤镜计算会导致页面其他功能卡顿
// 十分影响用户体验，所以我将滤镜计算放到 Web Worker 中进行
onmessage = (event) => {
  const { imageData, fillterAgg, beautyAgg, filterActive, canvasWidth, canvasHeight } = event.data;
  const data = imageData.data;
  // 将参数转换为百分比
  fillterAgg.contrast /= 100;
  fillterAgg.light /= 5;
  // fillterAgg.saturation /= 100;
  fillterAgg.hue /= 100;
  beautyAgg.beauty /= 100;
  beautyAgg.blur /= 100;
  // 处理图像数据，这里使用你之前定义的 change_per_pix 函数
  for (let i = 0; i < data.length; i += 4) {
    //色调调整
    changeTone(fillterAgg, data, i);
    //美颜设置
    // changeBeauty(beautyAgg, data, i);
    //滤镜选择
    changeFilter(filterActive, data, i, canvasWidth, canvasHeight);
  }

  // 处理对比度
  if (fillterAgg.contrast && fillterAgg.contrast != 0) {
    const avg = getGrayAverage(data);
    makeContrast(data, avg, fillterAgg.contrast * 255);
  }
  // 返回处理后的图像数据
  postMessage(imageData);
};

/**
 * 更直观的颜色描述： HSL代表色相（Hue）、饱和度（Saturation）和亮度（Lightness）
 * 这使得颜色的描述更加直观
 * 与RGB相比，HSL更接近人类对颜色的感知
 * 使得调整颜色变得更加直观和易于理解
 */
function changeTone(param, data, i) {
  if (param.hue === 0 && param.saturation === 0 && param.light === 0) {
    return;
  }
  // 从 RGB 转换为 HLS
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const from = [r, g, b];

  const hsl = rgbToHsl(from);

  // 处理色调
  if (param.hue && param.hue !== 0) {
    // 色调的区间 [0, 360]
    const hueOffset = param.hue * 360; // 将百分比转化为 [-180, 180] 的角度偏移
    let hue = (hsl[0] + hueOffset).toFixed(2);
    hsl[0] = hue;
  }

  // 处理饱和度
  if (param.saturation && param.saturation !== 0) {
    // 饱和度的区间 [-0.5, 0.5]
    const delta = param.saturation;
    // 将百分比转化为 [0, 100] 的饱和度
    let saturation = (hsl[1] + delta).toFixed(2);
    hsl[1] = saturation
  }

  // 处理亮度
  if (param.light && param.light !== 0) {
    // 亮度的区间 [-0.5, 0.5]
    const delta = param.light
    const newL = Math.min(Math.max(hsl[2] + delta, 0), 100); // 限制亮度值在0到100之间
    // if (i % 10000 == 0) {
    //   console.log(hsl[2], delta, newL)
    // }
    hsl[2] = newL;
  }
  // 从 HLS 转换回 RGB
  const newColor = hslToRgb(hsl);
  // if (offset % 10000 == 0) {
  //   console.log( hsl, newColor);
  // }
  data[i] = newColor[0];
  data[i + 1] = newColor[1];
  data[i + 2] = newColor[2];
}


// 获取灰度平均值
function getGrayAverage(imagePixArray) {
  var average = function (data) {
    let pixCount = data.length / 4;
    let sum = 0;
    for (let i = 0; i < pixCount; i++) {
      const pixOffset = i * 4;
      let r = data[pixOffset];
      let g = data[pixOffset + 1];
      let b = data[pixOffset + 2];
      sum = sum + (0.299 * r + 0.587 * b + 0.114 * g);
    }
    let aver = sum / data.length;
    return aver;
  };
  return average(imagePixArray);
}

// 对每个像素点 调节 对比度
function makeContrast(data, average, contrast) {
  const pixCount = data.length / 4;

  for (let i = 0; i < pixCount; i++) {
    const pixOffset = i * 4;
    let r = data[pixOffset];
    let g = data[pixOffset + 1];
    let b = data[pixOffset + 2];

    let newR = r + ((r - average) * contrast) / 255;
    let newG = g + ((g - average) * contrast) / 255;
    let newB = b + ((b - average) * contrast) / 255;

    if (newR < 0) {
      newR = 0;
    } else if (newR > 255) {
      newR = 255;
    }

    if (newG < 0) {
      newG = 0;
    } else if (newG > 255) {
      newG = 255;
    }

    if (newB < 0) {
      newB = 0;
    } else if (newB > 255) {
      newB = 255;
    }

    data[pixOffset] = newR;
    data[pixOffset + 1] = newG;
    data[pixOffset + 2] = newB;
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
  l /= 95;

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

function changeFilter(filterActive, data, i, canvasWidth, canvasHeight) {
  switch (filterActive) {
    case 'gray':
      // 灰度化滤镜
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg;
      data[i + 1] = avg;
      data[i + 2] = avg;
      break;
    case 'reverse':
      // 反转滤镜
      data[i] = 255 - data[i];
      data[i + 1] = 255 - data[i + 1];
      data[i + 2] = 255 - data[i + 2];
      break;
    case 'warm':
      // 暖色滤镜
      data[i] += 10;  // 增加红色分量
      data[i + 1] += 5;  // 增加绿色分量
      data[i + 2] -= 5;  // 减少蓝色分量
      break;
    case 'cooler':
      // 冷色滤镜
      data[i] -= 10;  // 减少红色分量
      data[i + 1] += 10;  // 增加绿色分量
      data[i + 2] += 30;  // 增加蓝色分量
      break;
    case 'color':
      // 色彩增强滤镜
      data[i] = Math.min(255, data[i] * 1.2);  // 增加红色分量
      data[i + 1] = Math.min(255, data[i + 1] * 1.2);  // 增加绿色分量
      data[i + 2] = Math.min(255, data[i + 2] * 1.2);  // 增加蓝色分量
      break;
    case 'cyberpunk':
      // 赛博朋克滤镜
      data[i] -= 10;  // 减少红色分量
      data[i + 1] += 20;  // 增加绿色分量
      data[i + 2] += 80;  // 增加蓝色分量
      break;
    case 'film':
      // 胶片效果滤镜
      const brightness = 10; // 亮度增强值
      const contrast = 0.9; // 对比度增强值

      // 调整亮度和对比度
      data[i] = Math.min(255, Math.max(0, data[i] + brightness));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + brightness));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + brightness));

      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
      break;
    case 'texture':
      // 纹理滤镜
      const textureSize = 12; // 纹理块的尺寸

      // 计算当前像素所属的纹理块的索引
      const textureX = Math.floor(i / textureSize);
      const textureIndex = (textureX * Math.ceil(canvasWidth / textureSize) + textureX) % 2;

      // 根据纹理块的索引设置像素的颜色
      const intensity = textureIndex === 0 ? 0 : 50; // 纹理强度

      data[i] = Math.min(255, Math.max(0, data[i] + intensity));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + intensity));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + intensity));
      break;
    case 'sharpening':
      // 锐化滤镜

      break;
    default:
      break;
  }

}



/**
 * 图像直方图均衡化 - 增强图像阴影 暗部改善效果
 * @param imageData 图像数据
 * @returns 处理后的图像数据
**/
export function enhanceShadows(imageData, enhancementAmount) {
  const { data, width, height } = imageData;

  // 计算灰度直方图
  // const histogram = new Array(256).fill(0);
  // for (let i = 0; i < data.length; i += 4) {
  //   const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
  //   histogram[gray]++;
  // }

  // // 计算累积直方图
  // const cumulativeHistogram = new Array(256).fill(0);
  // cumulativeHistogram[0] = histogram[0];
  // for (let i = 1; i < 256; i++) {
  //   cumulativeHistogram[i] = cumulativeHistogram[i - 1] + histogram[i];
  // }

  // 计算直方图均衡化映射表
  const normalizationFactor = 255 / (width * height);
  // const equalizationMap = cumulativeHistogram.map((count) => Math.round(count * normalizationFactor * enhancementAmount));

  // 应用直方图均衡化
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
    // const newValue = equalizationMap[gray];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }

  return imageData;
}
export function fadeImage(imageData, fadeAmount) {
  const { data } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 转换为HSV色彩空间
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    const v = max / 255;
    const s = max === 0 ? 0 : delta / max;

    // 降低饱和度
    const newS = s * fadeAmount
    const newValue = v * 100;

    // 转换回RGB色彩空间
    const c = (1 - Math.abs(2 * newValue / 255 - 1)) * newS;
    const x = c * (1 - Math.abs((newValue / 255 / 60) % 2 - 1));
    const m = newValue / 255 - c / 2;

    if (0 <= newValue && newValue < 42) {
      data[i] = (c + m) * 255;
      data[i + 1] = (x + m) * 255;
      data[i + 2] = m * 255;
    } else if (42 <= newValue && newValue < 85) {
      data[i] = (x + m) * 255;
      data[i + 1] = (c + m) * 255;
      data[i + 2] = m * 255;
    } else if (85 <= newValue && newValue < 128) {
      data[i] = m * 255;
      data[i + 1] = (c + m) * 255;
      data[i + 2] = (x + m) * 255;
    } else if (128 <= newValue && newValue < 171) {
      data[i] = m * 255;
      data[i + 1] = (x + m) * 255;
      data[i + 2] = (c + m) * 255;
    } else if (171 <= newValue && newValue < 213) {
      data[i] = (x + m) * 255;
      data[i + 1] = m * 255;
      data[i + 2] = (c + m) * 255;
    } else {
      data[i] = (c + m) * 255;
      data[i + 1] = m * 255;
      data[i + 2] = (x + m) * 255;
    }
  }

  return imageData;
}

export default {
  enhanceShadows
}

/**
 * getLeftEye(): 返回一个数组，包含了左眼关键点的坐标。
 * getRightEye(): 返回一个数组，包含了右眼关键点的坐标。
 * getNose(): 返回一个数组，包含了鼻子关键点的坐标。
 * getMouth(): 返回一个数组，包含了嘴巴关键点的坐标。
 * getJawOutline(): 返回一个数组，包含了下巴轮廓的关键点坐标。
 * getLeftEyeBrow(): 返回一个数组，包含了左眉毛关键点的坐标。
 * getRightEyeBrow(): 返回一个数组，包含了右眉毛关键点的坐标。
 * getChin(): 返回一个数组，包含了下巴的关键点坐标。
 */
import { imageLoader } from '@/utils/lzyutils'

export default {
  utils: {
    // 判定人物是否张嘴
    isMouthOpen: function (getParas) {
      const mouth = getParas.getMouth(); // 获取嘴巴区域的关键点信息
      const mouthHeight = (mouth[13].y + mouth[14].y) / 2 - (mouth[18].y + mouth[19].y) / 2;

      // 判断嘴巴是否张开
      const openThreshold = -20; // 定义判断为张嘴的阈值
      const isMouthOpen = mouthHeight < openThreshold;
      // 判断嘴巴是否张开
      return isMouthOpen;
    }
  },

  dogHead: async function (ctx, getParas, sizeMulitple) {
    const dogHead = await imageLoader.loadImage("src/assets/images/Effects/dogHead.png");
    dogHead.src = "src/assets/images/Effects/dogHead.png";
    ctx.drawImage(
      dogHead,
      getParas.shift.x + (30 * sizeMulitple) + 20,
      getParas.shift.y - (250 * sizeMulitple),
      597 * sizeMulitple,
      783 * sizeMulitple
    );
  },
  anger: async function (ctx, getParas) {
    //将蒙版眼睛绘制在人脸上 左眼
    const maskImgLeftEye = await imageLoader.loadImage("src/assets/images/Effects/leftEye.png");
    maskImgLeftEye.src = "src/assets/images/Effects/leftEye.png";
    const leftEye = getParas.getLeftEye();
    ctx.drawImage(
      maskImgLeftEye,
      leftEye[0].x - 15,
      leftEye[0].y - 50,
      90 * 0.7,
      120 * 0.7
    );
    //将蒙版眼睛绘制在人脸上 右眼
    const maskImgRightEye = await imageLoader.loadImage("src/assets/images/Effects/rightEye.png");
    maskImgRightEye.src = "src/assets/images/Effects/rightEye.png";
    const rightEye = getParas.getRightEye();
    ctx.drawImage(
      maskImgRightEye,
      rightEye[0].x - 15,
      rightEye[0].y - 50,
      90 * 0.7,
      120 * 0.7
    );
    //将蒙版嘴巴绘制在人脸上
    const maskImgMouth = await imageLoader.loadImage("src/assets/images/Effects/mouth.png");
    maskImgMouth.src = "src/assets/images/Effects/mouth.png";
    const mouth = getParas.getMouth();
    ctx.drawImage(
      maskImgMouth,
      mouth[0].x - 10,
      mouth[0].y - 10,
      252 * 0.3,
      111 * 0.3
    );

    //将蒙版脸颊绘制在人脸上
    const maskImgCheekLeft = await imageLoader.loadImage("src/assets/images/Effects/cheekLeft.png");
    maskImgCheekLeft.src = "src/assets/images/Effects/cheekLeft.png";
    const cheekLeft = getParas.getLeftEye();
    const noseLeft = getParas.getNose();
    ctx.drawImage(
      maskImgCheekLeft,
      cheekLeft[0].x - 20,
      noseLeft[Math.floor((noseLeft.length - 1) / 2)].y,
      40 * 0.7,
      25 * 0.7
    );
    //将蒙版脸颊绘制在人脸上
    const maskImgCheekRight = await imageLoader.loadImage("src/assets/images/Effects/cheekRight.png");
    maskImgCheekRight.src = "src/assets/images/Effects/cheekRight.png";
    const cheekRight = getParas.getRightEye();
    const noseRight = getParas.getNose();
    ctx.drawImage(
      maskImgCheekLeft,
      cheekRight[0].x + 20,
      noseRight[Math.floor((noseRight.length - 1) / 2)].y,
      40 * 0.7,
      25 * 0.7
    );
  },
  cat: async function (faceContour, ctx, getParas, sizeMultiple) {
    const getLeftEye = getParas.getLeftEye();
    const nose = getParas.getNose();
    const height = nose[Math.floor((nose.length - 1) / 2)].y;
    const deviationX = 30;
    const catParts = [
      { imgSrc: "src/assets/images/Effects/catLeft.png", x: getLeftEye[0].x - deviationX, y: height, width: 20, height: 25 },
      { imgSrc: "src/assets/images/Effects/catRight.png", x: getParas.getRightEye()[0].x + deviationX, y: height, width: 20, height: 25 },
      { imgSrc: "src/assets/images/Effects/catLeftEar.png", x: getParas.getLeftEyeBrow()[0].x - 15, y: getParas.getLeftEyeBrow()[0].y - 100, width: 33, height: 35 },
      { imgSrc: "src/assets/images/Effects/catRightEar.png", x: getParas.getRightEyeBrow()[2].x, y: getParas.getRightEyeBrow()[2].y - 100, width: 33, height: 35 }
    ];

    const loadImageAsync = async (src) => await imageLoader.loadImage(src);

    const drawCatPart = async (imgSrc, x, y, width, height) => {
      const img = await loadImageAsync(imgSrc);
      ctx.drawImage(img, x, y, width * sizeMultiple, height * sizeMultiple);
    };

    for (const part of catParts) {
      await drawCatPart(part.imgSrc, part.x, part.y, part.width, part.height);
    }
  },
  //闪电特效
  lightning: function (canv, ctx, getParas) {
    var canvWidth = canv.width;
    var canvHeight = canv.height;
    var x = (getParas.getMouth()[4].x + getParas.getMouth()[8].x) / 2;
    var y = (getParas.getMouth()[4].y + getParas.getMouth()[8].y) / 2;
    var light = function () {
      var r = 0;
      ctx.beginPath();
      ctx.moveTo(x, y);
      r = Math.floor(Math.random() * 5) * canvWidth / 50;
      if (r <= 30) {
        x += r;
      } else {
        x -= r;
      }
      y += Math.floor(Math.random() * 5) * canvHeight / 70;
      ctx.lineTo(x, y);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255, 255, 0, 1)"
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      // 清除剪切区域，以便绘制其他内容
      ctx.restore();
      requestAnimationFrame(light);
    };
    light()
  },
  mask: function (ctx, getParas) {
    // 绘制人脸轮廓
    const faceContourData = getParas.getJawOutline();
    for (let i = 1; i < faceContourData.length - 1; i++) {
      ctx.lineTo(faceContourData[i].x, faceContourData[i].y);
    }
    ctx.strokeStyle = "rgba(0, 0, 0, 1)"

    ctx.closePath();
    ctx.stroke();

    // 填充绘制的区域
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fill();
    ctx.beginPath();
    // 清除剪切区域，以便绘制其他内容
    ctx.restore();
  }
}

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

export default {
  utils: {
    // 判定人物是否张嘴
    isMouthOpen: function (getParas) {
      const mouth = getParas.getMouth(); // 获取嘴巴区域的关键点信息
      const mouthHeight = (mouth[13].y + mouth[14].y) / 2 - (mouth[18].y + mouth[19].y) / 2;
      console.log(`lzy  mouthHeight:`, mouthHeight)

      // 判断嘴巴是否张开
      const openThreshold = -20; // 定义判断为张嘴的阈值
      const isMouthOpen = mouthHeight < openThreshold;
      // 判断嘴巴是否张开
      return isMouthOpen;
    }
  },

  hashiqi: function (ctx, getParas) {
    const hashiqi = new Image();
    hashiqi.src = "src/assets/images/hashiqi.png";
    ctx.drawImage(
      hashiqi,
      getParas.positions[0].x - 40,
      getParas.positions[0].y - 300,
      597 * 0.7,
      783 * 0.7
    );
  },
  angry: function (ctx, getParas) {
    //将蒙版眼睛绘制在人脸上 左眼
    const maskImgLeftEye = new Image();
    maskImgLeftEye.src = "src/assets/images/leftEye.png";
    const leftEye = getParas.getLeftEye();
    ctx.drawImage(
      maskImgLeftEye,
      leftEye[0].x - 15,
      leftEye[0].y - 15,
      222 * 0.3,
      129 * 0.3
    );
    //将蒙版眼睛绘制在人脸上 右眼
    const maskImgRightEye = new Image();
    maskImgRightEye.src = "src/assets/images/rightEye.png";
    const rightEye = getParas.getRightEye();
    ctx.drawImage(
      maskImgRightEye,
      rightEye[0].x - 15,
      rightEye[0].y - 20,
      212 * 0.3,
      151 * 0.3
    );
    //将蒙版嘴巴绘制在人脸上
    const maskImgMouth = new Image();
    maskImgMouth.src = "src/assets/images/mouth.png";
    const mouth = getParas.getMouth();
    ctx.drawImage(
      maskImgMouth,
      mouth[0].x - 15,
      mouth[0].y - 15,
      252 * 0.5,
      111 * 0.5
    );
    //将蒙版眉毛绘制在人脸上
    const maskImgRightEyeBrow = new Image();
    maskImgRightEyeBrow.src = "src/assets/images/rightEyeBrow.png";
    const rightEyeBrow = getParas.getRightEyeBrow();
    ctx.drawImage(
      maskImgRightEyeBrow,
      rightEyeBrow[0].x + 15,
      rightEyeBrow[0].y - 45,
      164 * 0.3,
      162 * 0.3
    );
  },
  cat: function (ctx, getParas) {
    const getLeftEye = getParas.getLeftEye();
    const nost = getParas.getNose()
    const height = getParas.getNose()[Math.floor((nost.length - 1) / 3)].y
    const catLeft = new Image();
    catLeft.src = "src/assets/images/catLeft.png";
    const deviationX = 30;
    const mulitple = 2.3;
    ctx.drawImage(
      catLeft,
      getLeftEye[0].x - deviationX,
      height,
      20 * mulitple,
      25 * mulitple
    );
    const getRightEye = getParas.getRightEye();
    const catRight = new Image();
    catRight.src = "src/assets/images/catRight.png";
    ctx.drawImage(
      catRight,
      getRightEye[0].x + deviationX,
      height,
      20 * mulitple,
      25 * mulitple
    )
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
      requestAnimationFrame(light);
    };
    light()
  },
  theForeheadFont: function (ctx, getParas) {
    ctx.font = "30px dindin";
    ctx.fillStyle = "#fff";
    // 绘制文本，应用阴影
    // ctx.shadowColor = "#000"; // 阴影颜色
    // ctx.shadowOffsetX = 2; // 阴影在 x 轴上的偏移
    // ctx.shadowOffsetY = 2; // 阴影在 y 轴上的偏移
    // ctx.shadowBlur = 10; // 阴影的模糊程度
    ctx.fillText("我叫徐志伟", getParas.positions[0].x + 40, getParas.positions[0].y - 100);
  }

}

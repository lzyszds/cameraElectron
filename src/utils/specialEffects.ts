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
    console.log(`lzy  getParas:`, getParas)
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
  }

}

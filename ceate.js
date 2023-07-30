const fs = require('fs');

const siderbar= [
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
    title: "裁剪",
    name: "crop",
    icon: "mdi:crop",
  },
  {
    title: "旋转",
    name: "rotate",
    icon: "mdi:rotate-3d",
  },
  {
    name: "模糊",
    title: "blur",
    icon: "mdi:blur",
  },
  {
    title: "美颜",
    name: "beauty",
    icon: "mdi:face",
  },
  {
    title: "画框",
    name: "frame",
    icon: "mdi:picture-in-picture-bottom-right",
  },
  {
    title: "马赛克",
    name: "mosaic",
    icon: "mdi:blur-linear",
  },
  {
    title: "涂鸦",
    name: "graffiti",
    icon: "mdi:brush",
  },
];

// 生成组件内容的模板
function generateComponentTemplate(name, title) {
  return `<script setup lang='ts'>

</script>

<template>
    <div>
        调整功能页
    </div>
</template>

<style lang='scss' scoped>

</style>

`;
}

// 创建组件文件
function createComponentFile(name, title) {
  const componentContent = generateComponentTemplate(name, title);
  const fileName = `./src/components/actionbarCompontens/${name}.vue`;

  fs.writeFile(fileName, componentContent, (err) => {
    if (err) throw err;
    console.log(`已创建组件文件：${fileName}`);
  });
}

// 生成组件文件
siderbar.forEach(({ name, title }) => {
  createComponentFile(name, title);
});

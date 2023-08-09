<script setup lang='ts'>
const arr = [
    { name: '灰度化', icon: 'gray', title: '灰度化', image: '' },
    { name: '反转', icon: 'reverse', title: '反转', image: '' },
    { name: '马赛克', icon: 'mosaic', title: '马赛克', image: '' },
    { name: '边缘检测', icon: 'edge', title: '边缘检测', image: '' },
    { name: '中值滤波', icon: 'median', title: '中值滤波', image: '' },
    { name: '高斯模糊', icon: 'gaussian', title: '高斯模糊', image: '' },
    { name: '色彩增强', icon: 'color', title: '色彩增强', image: '' },
    { name: '像素化', icon: 'pixel', title: '像素化', image: '' },
    { name: '膨胀', icon: 'dilate', title: '膨胀', image: '' },
    { name: '腐蚀', icon: 'erode', title: '腐蚀', image: '' },
]
const applyFilter = (filterName) => {
    switch (filterName) {
        case '灰度化':
            // 实现灰度化滤镜
            break;
        case '反转':
            // 实现反转滤镜
            break;
        case '马赛克':
            // 实现马赛克滤镜
            break;
        case '边缘检测':
            // 实现边缘检测滤镜
            break;
        case '中值滤波':
            // 实现中值滤波滤镜
            break;
        case '高斯模糊':
            // 实现高斯模糊滤镜
            break;
        case '色彩增强':
            // 实现色彩增强滤镜
            break;
        case '像素化':
            // 实现像素化滤镜
            break;
        case '膨胀':
            // 实现膨胀滤镜
            break;
        case '腐蚀':
            // 实现腐蚀滤镜
            break;
        default:
            console.error('Unknown filter:', filterName);
    }
}
</script>

<template>
    <div v-for="(item, index) in arr" :key="index" @click="applyFilter(item.name)">
        <div class="actionItemCard cursor-pointer hover:scale-110">
            <div class="ratioItem  grid grid-cols-[80px_1fr]">
                <div class="flex gap-2">
                    <LzyIcon :name="item.icon"></LzyIcon>
                </div>
                <span>{{ item.title }}</span>
            </div>
        </div>
    </div>
</template>

<style lang='scss' scoped>
</style>


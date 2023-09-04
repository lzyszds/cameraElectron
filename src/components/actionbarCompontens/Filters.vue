<script setup lang='ts'>
import { useStore } from '@/store/store'

const arr = [
    { name: '初始参数', icon: 'init', title: '初始参数', image: '' },
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
const state = useStore()
const applyFilter = (filterName) => {
    state.activeFilterValue = filterName
}
</script>

<template>
    <div class="grid grid-cols-2 gap-2">
        <div v-for="(item, index) in arr" :key="index" @click="applyFilter(item.name)">
            <div class="actionItemCard cursor-pointer border-2 border-transparent hover:border-black "
                :class="state.activeFilterValue === item.title ? 'border-black' : ''">
                <!-- <div class="flex gap-2">
                    <LzyIcon :name="item.icon"></LzyIcon>
                </div> -->
                <span>{{ item.title }}</span>
            </div>
        </div>
    </div>
</template>

<style lang='scss' scoped>
</style>


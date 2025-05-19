<script setup lang="ts">
import type { Bed } from '@/types.d'
import { computed, reactive, ref, watch } from 'vue'
import BedSvg from '../svg/BedSvg.vue'

// 定义接收的属性
const props = defineProps<{
    width?: number
    height?: number
    bedCount: number
    isLightOn: boolean
}>()

// 定义发出的事件
const emit = defineEmits<{
    'bed-clicked': [bedId: number]
    'update-beds': [beds: Bed[]]
}>()

// 游戏尺寸
const containerWidth = computed(() => props.width || window.innerWidth)
const containerHeight = computed(() => props.height || window.innerHeight)

// 床位状态
const beds = reactive<Bed[]>([])

// 床位拖动功能控制
const bedsAreDraggable = ref(false)

// 原始床位位置存储，用于复原
const originalBedPositions = ref<{ id: number, x: number, y: number }[]>([])

// 监听容器尺寸变化
watch(
    [containerWidth, containerHeight],
    () => {
        initializeBeds(props.bedCount)
    },
    { immediate: true },
)

// 在网格布局中初始化床位位置
function initializeBeds(count: number) {
    beds.length = 0 // 清空现有床位

    const bedCount = count || 24
    const bedWidth = 60
    const bedHeight = 90
    const padding = 40 // 边缘填充，避免床位太靠近画布边缘
    
    // 计算可用区域
    const availableWidth = containerWidth.value - (2 * padding)
    const availableHeight = containerHeight.value - (2 * padding)
    
    // 清空原始位置记录
    originalBedPositions.value = []
    
    // 使用基本网格布局
    applyBasicGridLayout(bedCount, bedWidth, bedHeight, padding, availableWidth, availableHeight)

    // 通知父组件床位已更新
    emit('update-beds', [...beds])
}

// 基本网格布局算法
function applyBasicGridLayout(bedCount: number, bedWidth: number, bedHeight: number, padding: number, availableWidth: number, availableHeight: number) {
    // 计算适合的网格尺寸
    const aspectRatio = availableWidth / availableHeight
    
    // 计算适合的列数
    let columns = Math.round(Math.sqrt(bedCount * aspectRatio))
    // 确保列数至少为1
    columns = Math.max(1, columns)
    
    // 计算行数
    const rows = Math.ceil(bedCount / columns)
    
    // 计算单元格大小
    const cellWidth = availableWidth / columns
    const cellHeight = availableHeight / rows
    
    // 计算床位在单元格内部的偏移，让床位居中
    const offsetX = (cellWidth - bedWidth) / 2
    const offsetY = (cellHeight - bedHeight) / 2
    
    // 放置床位
    let bedIndex = 0
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            // 如果已经放置了所有床位，则退出循环
            if (bedIndex >= bedCount) break
            
            // 计算床位位置
            const x = padding + (col * cellWidth) + offsetX
            const y = padding + (row * cellHeight) + offsetY
            
            // 创建床位
            beds.push({
                id: bedIndex,
                x,
                y,
                width: bedWidth,
                height: bedHeight,
                isOccupied: false,
            })
            
            // 保存原始位置
            originalBedPositions.value.push({
                id: bedIndex,
                x,
                y,
            })
            
            bedIndex++
        }
    }
}

// 床事件处理
function handleBedClicked(bedId: number) {
    emit('bed-clicked', bedId)
}

// 床位拖动相关方法
function handleBedDragStart(bedId: number) {
    console.log('handleBedDragStart', bedId)
    // 在这个组件中拖动开始时没有特定的事情要做
    // BedSvg组件处理自己的拖动状态
}

function handleBedDragMove(bedId: number, dx: number, dy: number) {
    const bed = beds[bedId]
    if (!bed)
        return

    // 更新床位置
    bed.x += dx
    bed.y += dy

    // 将床保持在容器边界内
    bed.x = Math.max(0, Math.min(containerWidth.value - bed.width, bed.x))
    bed.y = Math.max(0, Math.min(containerHeight.value - bed.height, bed.y))

    // 通知父组件床位已更新
    emit('update-beds', [...beds])
}

function handleBedDragEnd(bedId: number) {
    console.log('handleBedDragEnd', bedId)
    // 在这个组件中拖动结束时没有特定的事情要做
}

// 复原床位位置
function resetBedPositions() {
    if (originalBedPositions.value.length === 0)
        return

    for (const position of originalBedPositions.value) {
        const bed = beds.find(b => b.id === position.id)
        if (bed) {
            bed.x = position.x
            bed.y = position.y
        }
    }

    // 通知父组件床位已更新
    emit('update-beds', [...beds])
}

// 切换床位拖动功能
function toggleBedDraggable() {
    bedsAreDraggable.value = !bedsAreDraggable.value
}

// 更新床位占用状态
function updateBedOccupation(bedId: number, isOccupied: boolean) {
    if (bedId >= 0 && bedId < beds.length) {
        beds[bedId].isOccupied = isOccupied
    }
}

// 获取所有床位信息
function getAllBeds() {
    return [...beds]
}

// 为GameLayer的游戏循环提供一个update方法
function updateFrame(deltaTime: number) {
    // 床位层的更新逻辑，如果有动画或状态变化可以在这里处理
    // 目前床位是静态的，所以这里可以是一个空方法
}

// 暴露方法给父组件
defineExpose({
    resetBedPositions,
    toggleBedDraggable,
    updateBedOccupation,
    getAllBeds,
    updateFrame,
})
</script>

<template>
    <svg
        :width="width"
        :height="height"
        class="bed-layer"
        :class="{ 'lights-off': !isLightOn }"
    >
        <!-- 床位 -->
        <BedSvg
            v-for="bed in beds"
            :id="bed.id"
            :key="bed.id"
            :x="bed.x"
            :y="bed.y"
            :width="bed.width"
            :height="bed.height"
            :is-occupied="bed.isOccupied"
            :is-draggable="bedsAreDraggable"
            @bed-clicked="handleBedClicked"
            @drag-start="handleBedDragStart"
            @drag-move="handleBedDragMove"
            @drag-end="handleBedDragEnd"
        />
    </svg>
</template>

<style scoped>
.bed-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;
}

.bed-layer * {
    pointer-events: auto;
}

/* 灯光关闭时的效果 */
.bed-layer.lights-off {
    filter: brightness(0.7);
}
</style>

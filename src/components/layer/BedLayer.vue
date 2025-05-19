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
        initializeBeds(17)
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
    
    // 找出最合适的网格布局
    // 我们将尝试多种网格尺寸，并选择最合适的一个
    let bestLayout = { rows: 0, cols: 0, emptySlots: Infinity, score: Infinity }
    
    // 定义一个评分函数，用于评估布局的质量
    // 评分越低越好，考虑的因素有：
    // 1. 空位数量（越少越好）
    // 2. 网格比例与画布比例的接近程度（越接近越好）
    // 3. 床位间距的均匀性（越均匀越好）
    const scoreLayout = (rows: number, cols: number) => {
        const totalSlots = rows * cols
        const emptySlots = totalSlots - bedCount
        
        // 如果空格太多，则这个布局不佳
        if (emptySlots > Math.max(3, Math.floor(bedCount * 0.2))) {
            return { score: Infinity, emptySlots }
        }
        
        // 计算理想的网格比例（宽高比）
        const idealRatio = availableWidth / availableHeight
        const actualRatio = cols / rows
        const ratioDiff = Math.abs(idealRatio - actualRatio)
        
        // 计算单元格大小
        const cellWidth = availableWidth / cols
        const cellHeight = availableHeight / rows
        
        // 计算单元格的宽高比
        const cellRatio = cellWidth / cellHeight
        const idealCellRatio = 0.8 // 理想的单元格宽高比（床位的形状是竖向的）
        const cellRatioDiff = Math.abs(cellRatio - idealCellRatio)
        
        // 计算床位间距
        const horizSpacing = (cellWidth - bedWidth) / 2
        const vertSpacing = (cellHeight - bedHeight) / 2
        
        // 确保床位不会太挤
        if (horizSpacing < 10 || vertSpacing < 10) {
            return { score: Infinity, emptySlots }
        }
        
        // 评分计算
        // 空位数量权重 * 空位数量 + 比例差异权重 * 比例差异 + 单元格比例差异权重 * 单元格比例差异
        const score = 
            3 * emptySlots + 
            2 * ratioDiff * 10 + 
            1 * cellRatioDiff * 10
            
        return { score, emptySlots }
    }
    
    // 尝试不同的行列组合
    const maxRows = Math.ceil(Math.sqrt(bedCount * 1.5))
    const maxCols = Math.ceil(Math.sqrt(bedCount * 1.5))
    
    for (let rows = 1; rows <= maxRows; rows++) {
        for (let cols = 1; cols <= maxCols; cols++) {
            if (rows * cols < bedCount) continue // 跳过容量不足的布局
            
            const { score, emptySlots } = scoreLayout(rows, cols)
            
            if (score < bestLayout.score) {
                bestLayout = { rows, cols, emptySlots, score }
            }
        }
    }
    
    // 如果没有找到合适的布局，使用默认布局
    if (bestLayout.rows === 0 || bestLayout.cols === 0) {
        const aspectRatio = availableWidth / availableHeight
        bestLayout.cols = Math.round(Math.sqrt(bedCount * aspectRatio))
        bestLayout.rows = Math.ceil(bedCount / bestLayout.cols)
    }
    
    const rows = bestLayout.rows
    const cols = bestLayout.cols
    
    // 计算单元格大小
    const cellWidth = availableWidth / cols
    const cellHeight = availableHeight / rows
    
    // 计算床位在单元格内部的偏移，让床位居中
    const offsetX = (cellWidth - bedWidth) / 2
    const offsetY = (cellHeight - bedHeight) / 2
    
    // 清空原始位置记录
    originalBedPositions.value = []
    
    // 对于有空位的情况，我们需要平衡分布空位
    const totalSlots = rows * cols
    const emptySlots = totalSlots - bedCount
    
    // 创建格子占用情况的矩阵
    // 将空位均匀分布到网格中
    const grid = Array(rows).fill(0).map(() => Array(cols).fill(true))
    
    // 如果有空位，尝试均匀分布空位
    if (emptySlots > 0) {
        // 根据空位数量和总格子数来计算空位的间隔
        const skipInterval = Math.floor(totalSlots / (emptySlots + 1))
        let skipCounter = skipInterval
        let skippedCount = 0
        
        // 标记要跳过的位置
        for (let r = 0; r < rows && skippedCount < emptySlots; r++) {
            for (let c = 0; c < cols && skippedCount < emptySlots; c++) {
                skipCounter--
                if (skipCounter === 0) {
                    grid[r][c] = false // 将此位置标记为空
                    skipCounter = skipInterval
                    skippedCount++
                }
            }
        }
    }
    
    // 放置床位
    let bedIndex = 0
    
    // 采用从中心开始的放置策略，让床位更集中在中心区域
    const centerRow = Math.floor(rows / 2)
    const centerCol = Math.floor(cols / 2)
    
    // 计算每个格子到中心的距离
    const distanceToCenter = Array(rows).fill(0).map((_, r) => 
        Array(cols).fill(0).map((_, c) => 
            Math.sqrt(Math.pow(r - centerRow, 2) + Math.pow(c - centerCol, 2))
        )
    )
    
    // 创建格子坐标列表并根据到中心的距离排序
    const cellCoords = []
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c]) { // 只添加未标记为空的位置
                cellCoords.push({
                    row: r,
                    col: c,
                    distance: distanceToCenter[r][c]
                })
            }
        }
    }
    
    // 按距离从小到大排序（从中心向外扩散）
    cellCoords.sort((a, b) => a.distance - b.distance)
    
    // 遍历排序后的位置放置床位
    for (const coord of cellCoords) {
        if (bedIndex >= bedCount) break
        
        const { row, col } = coord
        
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

    // 通知父组件床位已更新
    emit('update-beds', [...beds])
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

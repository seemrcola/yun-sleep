<script setup lang="ts">
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
const bedsCount = 24 // 床的数量固定为24
const beds = reactive<Bed[]>([])

// 床位拖动功能控制
const bedsAreDraggable = ref(false)

// 原始床位位置存储，用于复原
const originalBedPositions = ref<{ id: number, x: number, y: number }[]>([])

// 类型定义
interface Bed {
    id: number
    x: number
    y: number
    width: number
    height: number
    isOccupied: boolean
}

// 监听容器尺寸变化
watch([containerWidth, containerHeight], () => {
    initializeBeds()
})

// 初始化
watch(() => props.bedCount, () => {
    initializeBeds()
}, { immediate: true })

// 在网格布局中初始化床位位置
function initializeBeds() {
    beds.length = 0 // 清空现有床位

    // 根据床位数量计算列数和行数 一行最多六个
    const columns = Math.min(6, props.bedCount || 24)
    const rows = Math.ceil(props.bedCount / columns)

    const bedWidth = 60
    const bedHeight = 90

    const horizontalSpacing = containerWidth.value / columns
    const verticalSpacing = containerHeight.value / rows

    // 清空原始位置记录
    originalBedPositions.value = []

    for (let i = 0; i < bedsCount; i++) {
        const row = Math.floor(i / columns)
        const col = i % columns

        const x = col * horizontalSpacing + (horizontalSpacing - bedWidth) / 2
        const y = row * verticalSpacing + (verticalSpacing - bedHeight) / 2

        beds.push({
            id: i,
            x,
            y,
            width: bedWidth,
            height: bedHeight,
            isOccupied: false,
        })

        // 保存原始位置
        originalBedPositions.value.push({
            id: i,
            x,
            y,
        })
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

// 暴露方法给父组件
defineExpose({
    resetBedPositions,
    toggleBedDraggable,
    updateBedOccupation,
    getAllBeds
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

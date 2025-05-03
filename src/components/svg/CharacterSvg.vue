<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
    x: number
    y: number
    width: number
    height: number
    direction: 'up' | 'down' | 'left' | 'right'
    isMoving: boolean
    bubbleMessage?: string | null
}>()

// 计算视图框尺寸
const viewBoxWidth = 45
const viewBoxHeight = 45

// 计算角色朝向
const isFacingDown = computed(() => props.direction === 'down')
const isFacingUp = computed(() => props.direction === 'up')
const isFacingLeft = computed(() => props.direction === 'left')
const isFacingRight = computed(() => props.direction === 'right')

// 基于移动状态的动画类
const animationClass = computed(() => {
    if (!props.isMoving)
        return ''

    if (isFacingLeft.value || isFacingRight.value) {
        return 'walking-horizontal'
    }
    else {
        return 'walking-vertical'
    }
})

// 随机角色颜色生成
const skinColor = ref('#FFC58B') // 基础肤色
const hairColor = ref('#000000') // 默认发色
const shirtColor = ref('#5D7FFF') // 默认上衣颜色 - 蓝色
const pantsColor = ref('#8E4D26') // 默认裤子颜色 - 棕色
const shoesColor = ref('#775234') // 默认鞋子颜色

// 生成随机发色
const hairColors = [
    '#000000', // 黑色
    '#704214', // 棕色
    '#8B4513', // 深棕色
    '#CD853F', // 浅棕色
    '#FFD700', // 金色
    '#FF6347', // 红色
    '#A0522D', // 赤褐色
    '#808080', // 灰色
    '#4682B4', // 蓝色
    '#228B22', // 绿色
]

// 生成随机上衣颜色
const shirtColors = [
    '#5D7FFF', // 蓝色
    '#FF5D5D', // 红色
    '#5DFF7F', // 绿色
    '#FFFF5D', // 黄色
    '#C45DFF', // 紫色
    '#5DFFC4', // 青色
    '#FF8400', // 橙色
    '#F34BFF', // 粉色
]

// 随机裤子颜色
const pantsColors = [
    '#8E4D26', // 棕色
    '#3B3B3B', // 深灰
    '#262F8E', // 深蓝
    '#4D1F00', // 深棕
    '#404040', // 灰色
]

// 随机生成发型类型
const hairstyleType = ref(0) // 0-4 不同发型

// 加载或生成角色外观
onMounted(() => {
    // 尝试从localStorage加载现有发型和颜色
    const savedHairstyleType = localStorage.getItem('characterHairstyleType')
    const savedHairColor = localStorage.getItem('characterHairColor')
    const savedShirtColor = localStorage.getItem('characterShirtColor')
    const savedPantsColor = localStorage.getItem('characterPantsColor')
    
    if (savedHairstyleType !== null && savedHairColor !== null) {
        // 使用保存的值
        hairstyleType.value = Number.parseInt(savedHairstyleType)
        hairColor.value = savedHairColor
        if (savedShirtColor) shirtColor.value = savedShirtColor
        if (savedPantsColor) pantsColor.value = savedPantsColor
    }
    else {
        // 生成新的随机值
        hairstyleType.value = Math.floor(Math.random() * 5) // 0-4种不同发型
        hairColor.value = hairColors[Math.floor(Math.random() * hairColors.length)]
        shirtColor.value = shirtColors[Math.floor(Math.random() * shirtColors.length)]
        pantsColor.value = pantsColors[Math.floor(Math.random() * pantsColors.length)]

        // 保存到localStorage以持久化
        localStorage.setItem('characterHairstyleType', hairstyleType.value.toString())
        localStorage.setItem('characterHairColor', hairColor.value)
        localStorage.setItem('characterShirtColor', shirtColor.value)
        localStorage.setItem('characterPantsColor', pantsColor.value)
    }
})

// 导出角色位置信息供外部使用
defineExpose({
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height,
})
</script>

<template>
    <svg
        :x="x"
        :y="y"
        :width="width"
        :height="height"
        :viewBox="`0 0 ${viewBoxWidth} ${viewBoxHeight}`"
        class="character"
        :class="animationClass"
    >
        <!-- 泰拉瑞亚风格像素角色 -->
        <g class="pixelated-character">
            <!-- 阴影 - 像素化 -->
            <rect x="16" y="40" width="14" height="3" fill="rgba(0,0,0,0.25)" />
            
            <!-- 头部像素 - 正面 -->
            <g v-if="isFacingDown">
                <!-- 裤子 -->
                <rect x="16" y="25" width="6" height="10" :fill="pantsColor" />
                <rect x="24" y="25" width="6" height="10" :fill="pantsColor" />
                
                <!-- 鞋子 -->
                <rect x="16" y="35" width="6" height="4" :fill="shoesColor" />
                <rect x="24" y="35" width="6" height="4" :fill="shoesColor" />
                
                <!-- 上身躯干 - 衬衫 -->
                <rect x="18" y="11" width="10" height="14" :fill="shirtColor" />
                
                <!-- 手臂 -->
                <rect x="14" y="11" width="4" height="10" :fill="skinColor" />
                <rect x="28" y="11" width="4" height="10" :fill="skinColor" />
                
                <!-- 胸口/领口 -->
                <rect x="21" y="11" width="4" height="2" :fill="skinColor" />
                
                <!-- 头部 -->
                <rect x="15" y="-5" width="16" height="16" :fill="skinColor" class="head-bounce" />
                
                <!-- 耳朵 -->
                <rect x="15" y="-1" width="2" height="4" :fill="skinColor" />
                <rect x="29" y="-1" width="2" height="4" :fill="skinColor" />
                
                <!-- 眼睛 -->
                <rect x="18" y="-1" width="3" height="3" fill="#000000" />
                <rect x="25" y="-1" width="3" height="3" fill="#000000" />
                <rect x="19" y="0" width="1" height="1" fill="#FFFFFF" />
                <rect x="26" y="0" width="1" height="1" fill="#FFFFFF" />
                
                <!-- 嘴巴 -->
                <rect x="21" y="5" width="4" height="1" fill="#000000" />
                
                <!-- 发型 - 根据类型 -->
                <g v-if="hairstyleType === 0">
                    <!-- 短发 -->
                    <rect x="15" y="-9" width="16" height="4" :fill="hairColor" />
                    <rect x="13" y="-7" width="2" height="6" :fill="hairColor" />
                    <rect x="31" y="-7" width="2" height="6" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 1">
                    <!-- 刘海 -->
                    <rect x="15" y="-9" width="16" height="4" :fill="hairColor" />
                    <rect x="13" y="-7" width="2" height="8" :fill="hairColor" />
                    <rect x="31" y="-7" width="2" height="8" :fill="hairColor" />
                    <rect x="19" y="-5" width="8" height="2" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 2">
                    <!-- 长发 -->
                    <rect x="13" y="-9" width="20" height="4" :fill="hairColor" />
                    <rect x="11" y="-7" width="2" height="14" :fill="hairColor" />
                    <rect x="33" y="-7" width="2" height="14" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 3">
                    <!-- 尖刺发 -->
                    <rect x="15" y="-13" width="4" height="8" :fill="hairColor" />
                    <rect x="19" y="-11" width="4" height="6" :fill="hairColor" />
                    <rect x="23" y="-15" width="4" height="10" :fill="hairColor" />
                    <rect x="27" y="-11" width="4" height="6" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 4">
                    <!-- 莫霍克 -->
                    <rect x="19" y="-15" width="8" height="10" :fill="hairColor" />
                </g>
            </g>
            
            <!-- 头部像素 - 背面 -->
            <g v-if="isFacingUp">
                <!-- 裤子 -->
                <rect x="16" y="25" width="6" height="10" :fill="pantsColor" />
                <rect x="24" y="25" width="6" height="10" :fill="pantsColor" />
                
                <!-- 鞋子 -->
                <rect x="16" y="35" width="6" height="4" :fill="shoesColor" />
                <rect x="24" y="35" width="6" height="4" :fill="shoesColor" />
                
                <!-- 上身躯干 - 衬衫 -->
                <rect x="18" y="11" width="10" height="14" :fill="shirtColor" />
                
                <!-- 手臂 -->
                <rect x="14" y="11" width="4" height="10" :fill="skinColor" />
                <rect x="28" y="11" width="4" height="10" :fill="skinColor" />
                
                <!-- 头部 - 背面 -->
                <rect x="15" y="-5" width="16" height="16" :fill="skinColor" class="head-bounce" />
                
                <!-- 耳朵 -->
                <rect x="15" y="-1" width="2" height="4" :fill="skinColor" />
                <rect x="29" y="-1" width="2" height="4" :fill="skinColor" />
                
                <!-- 发型 - 后视图，根据类型显示 -->
                <g v-if="hairstyleType === 0">
                    <!-- 短发后视图 -->
                    <rect x="15" y="-9" width="16" height="8" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 1">
                    <!-- 中等后视图 -->
                    <rect x="13" y="-9" width="20" height="10" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 2">
                    <!-- 长发后视图 -->
                    <rect x="11" y="-9" width="24" height="14" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 3">
                    <!-- 尖刺发后视图 -->
                    <rect x="15" y="-13" width="4" height="8" :fill="hairColor" />
                    <rect x="19" y="-11" width="4" height="6" :fill="hairColor" />
                    <rect x="23" y="-15" width="4" height="10" :fill="hairColor" />
                    <rect x="27" y="-11" width="4" height="6" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 4">
                    <!-- 莫霍克后视图 -->
                    <rect x="19" y="-15" width="8" height="10" :fill="hairColor" />
                </g>
            </g>
            
            <!-- 头部像素 - 右侧面 -->
            <g v-if="isFacingRight">
                <!-- 裤子 -->
                <rect x="20" y="25" width="6" height="10" :fill="pantsColor" />
                
                <!-- 鞋子 -->
                <rect x="20" y="35" width="6" height="4" :fill="shoesColor" />
                
                <!-- 上身躯干 - 衬衫 -->
                <rect x="18" y="11" width="10" height="14" :fill="shirtColor" />
                
                <!-- 手臂 - 前臂 -->
                <rect v-if="!isMoving" x="28" y="11" width="4" height="10" :fill="skinColor" />
                
                <!-- 手臂 - 后臂 - 在身体后面 -->
                <rect v-if="!isMoving" x="14" y="13" width="4" height="10" :fill="skinColor" />
                
                <!-- 手臂 - 移动状态 -->
                <g v-if="isMoving">
                    <!-- 挥动的手臂 -->
                    <rect x="28" y="9" width="5" height="8" :fill="skinColor" />
                    <rect x="14" y="15" width="4" height="10" :fill="skinColor" />
                </g>
                
                <!-- 头部 - 侧面 -->
                <rect x="15" y="-5" width="14" height="16" :fill="skinColor" class="head-bounce" />
                
                <!-- 耳朵 -->
                <rect x="29" y="-1" width="2" height="4" :fill="skinColor" />
                
                <!-- 眼睛 - 侧面 -->
                <rect x="26" y="-1" width="3" height="3" fill="#000000" />
                <rect x="27" y="0" width="1" height="1" fill="#FFFFFF" />
                
                <!-- 嘴巴 - 侧面 -->
                <rect x="25" y="5" width="3" height="1" fill="#000000" />
                
                <!-- 发型 - 侧面视图 -->
                <g v-if="hairstyleType === 0">
                    <!-- 短发侧面 -->
                    <rect x="15" y="-9" width="14" height="4" :fill="hairColor" />
                    <rect x="29" y="-7" width="2" height="6" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 1">
                    <!-- 中等侧面 -->
                    <rect x="15" y="-9" width="14" height="4" :fill="hairColor" />
                    <rect x="29" y="-7" width="4" height="8" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 2">
                    <!-- 长发侧面 -->
                    <rect x="15" y="-9" width="14" height="4" :fill="hairColor" />
                    <rect x="29" y="-9" width="4" height="14" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 3">
                    <!-- 尖刺发侧面 -->
                    <rect x="15" y="-13" width="14" height="8" :fill="hairColor" />
                    <rect x="23" y="-15" width="6" height="2" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 4">
                    <!-- 莫霍克侧面 -->
                    <rect x="19" y="-15" width="6" height="10" :fill="hairColor" />
                </g>
            </g>
            
            <!-- 头部像素 - 左侧面 -->
            <g v-if="isFacingLeft">
                <!-- 裤子 -->
                <rect x="20" y="25" width="6" height="10" :fill="pantsColor" />
                
                <!-- 鞋子 -->
                <rect x="20" y="35" width="6" height="4" :fill="shoesColor" />
                
                <!-- 上身躯干 - 衬衫 -->
                <rect x="18" y="11" width="10" height="14" :fill="shirtColor" />
                
                <!-- 手臂 - 前臂 -->
                <rect v-if="!isMoving" x="14" y="11" width="4" height="10" :fill="skinColor" />
                
                <!-- 手臂 - 后臂 - 在身体后面 -->
                <rect v-if="!isMoving" x="28" y="13" width="4" height="10" :fill="skinColor" />
                
                <!-- 手臂 - 移动状态 -->
                <g v-if="isMoving">
                    <!-- 挥动的手臂 -->
                    <rect x="13" y="9" width="5" height="8" :fill="skinColor" />
                    <rect x="28" y="15" width="4" height="10" :fill="skinColor" />
                </g>
                
                <!-- 头部 - 侧面 -->
                <rect x="17" y="-5" width="14" height="16" :fill="skinColor" class="head-bounce" />
                
                <!-- 耳朵 -->
                <rect x="15" y="-1" width="2" height="4" :fill="skinColor" />
                
                <!-- 眼睛 - 侧面 -->
                <rect x="17" y="-1" width="3" height="3" fill="#000000" />
                <rect x="18" y="0" width="1" height="1" fill="#FFFFFF" />
                
                <!-- 嘴巴 - 侧面 -->
                <rect x="18" y="5" width="3" height="1" fill="#000000" />
                
                <!-- 发型 - 侧面视图 -->
                <g v-if="hairstyleType === 0">
                    <!-- 短发侧面 -->
                    <rect x="17" y="-9" width="14" height="4" :fill="hairColor" />
                    <rect x="15" y="-7" width="2" height="6" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 1">
                    <!-- 中等侧面 -->
                    <rect x="17" y="-9" width="14" height="4" :fill="hairColor" />
                    <rect x="13" y="-7" width="4" height="8" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 2">
                    <!-- 长发侧面 -->
                    <rect x="17" y="-9" width="14" height="4" :fill="hairColor" />
                    <rect x="13" y="-9" width="4" height="14" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 3">
                    <!-- 尖刺发侧面 -->
                    <rect x="17" y="-13" width="14" height="8" :fill="hairColor" />
                    <rect x="17" y="-15" width="6" height="2" :fill="hairColor" />
                </g>
                <g v-else-if="hairstyleType === 4">
                    <!-- 莫霍克侧面 -->
                    <rect x="21" y="-15" width="6" height="10" :fill="hairColor" />
                </g>
            </g>
            
            <!-- 腿部动画 - 移动状态 -->
            <g v-if="isMoving">
                <g v-if="isFacingDown || isFacingUp">
                    <!-- 移动时的腿部 -->
                    <rect x="16" y="25" width="6" height="14" :fill="pantsColor" class="leg-left" />
                    <rect x="24" y="25" width="6" height="14" :fill="pantsColor" class="leg-right" />
                    <!-- 鞋子 -->
                    <rect x="16" y="35" width="6" height="4" :fill="shoesColor" class="leg-left" />
                    <rect x="24" y="35" width="6" height="4" :fill="shoesColor" class="leg-right" />
                </g>
                
                <g v-if="isFacingLeft || isFacingRight">
                    <!-- 移动时的腿部 - 侧面 -->
                    <rect x="18" y="25" width="5" height="14" :fill="pantsColor" class="leg-forward" />
                    <rect x="23" y="25" width="5" height="14" :fill="pantsColor" class="leg-back" />
                    <!-- 鞋子 -->
                    <rect x="18" y="35" width="5" height="4" :fill="shoesColor" class="leg-forward" />
                    <rect x="23" y="35" width="5" height="4" :fill="shoesColor" class="leg-back" />
                </g>
            </g>
            
            <!-- 移动指示器 - 像素风格 -->
            <g v-if="isMoving" class="movement-indicator">
                <rect v-if="isFacingDown" x="21" y="39" width="4" height="4" fill="#FFFFFF" />
                <rect v-if="isFacingUp" x="21" y="2" width="4" height="4" fill="#FFFFFF" />
                <rect v-if="isFacingRight" x="39" y="21" width="4" height="4" fill="#FFFFFF" />
                <rect v-if="isFacingLeft" x="2" y="21" width="4" height="4" fill="#FFFFFF" />
            </g>
        </g>
    </svg>
</template>

<style scoped>
.character {
  will-change: transform;
  filter: drop-shadow(0px 0px 8px rgba(0,0,0,0.5));
  image-rendering: pixelated; /* 关键:添加像素化渲染 */
  shape-rendering: crispEdges; /* 使矩形边缘锐利 */
}

.pixelated-character {
  image-rendering: pixelated;
  shape-rendering: crispEdges;
}

.head-bounce {
  animation: headBounce 0.5s ease-in-out infinite alternate;
}

@keyframes headBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(1px); }
}

.leg-left {
  animation: legLeftMove 0.4s ease-in-out infinite alternate;
}

.leg-right {
  animation: legRightMove 0.4s ease-in-out infinite alternate;
}

.leg-forward {
  animation: legForward 0.4s ease-in-out infinite alternate;
}

.leg-back {
  animation: legBack 0.4s ease-in-out infinite alternate;
}

@keyframes legLeftMove {
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
}

@keyframes legRightMove {
  0% { transform: translateY(-2px); }
  100% { transform: translateY(0); }
}

@keyframes legForward {
  0% { transform: translateX(-1px); }
  100% { transform: translateX(1px); }
}

@keyframes legBack {
  0% { transform: translateX(1px); }
  100% { transform: translateX(-1px); }
}

.movement-indicator {
  animation: pulse 0.6s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.3; }
  100% { opacity: 1; }
}

.walking-vertical {
  animation: walkBounce 0.4s ease-in-out infinite alternate;
}

.walking-horizontal {
  animation: walkBounce 0.4s ease-in-out infinite alternate;
}

@keyframes walkBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
}
</style>

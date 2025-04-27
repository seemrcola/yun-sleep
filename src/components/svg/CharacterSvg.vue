<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
    x: number
    y: number
    width: number
    height: number
    direction: 'up' | 'down' | 'left' | 'right'
    isMoving: boolean
}>()

// 计算视图框尺寸
const viewBoxWidth = 80
const viewBoxHeight = 80

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

// 随机发型生成
const hairstyleType = ref(0)
const hairstyleColor = ref('#000000')

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

// 加载或生成发型
onMounted(() => {
    // 尝试从localStorage加载现有发型
    const savedHairstyleType = localStorage.getItem('characterHairstyleType')
    const savedHairstyleColor = localStorage.getItem('characterHairstyleColor')

    if (savedHairstyleType !== null && savedHairstyleColor !== null) {
    // 使用保存的值
        hairstyleType.value = Number.parseInt(savedHairstyleType)
        hairstyleColor.value = savedHairstyleColor
    }
    else {
    // 生成新的随机值
        hairstyleType.value = Math.floor(Math.random() * 5) // 0-4种不同发型
        hairstyleColor.value = hairColors[Math.floor(Math.random() * hairColors.length)]

        // 保存到localStorage以持久化
        localStorage.setItem('characterHairstyleType', hairstyleType.value.toString())
        localStorage.setItem('characterHairstyleColor', hairstyleColor.value)
    }
})

// 根据方向和随机类型获取适当的发型路径
const getHairstylePath = computed(() => {
    // 基于随机类型的不同发型
    if (hairstyleType.value === 0) {
    // 凌乱短发 - 线条风格
        if (isFacingDown.value)
            return 'M25,15 C35,10 45,10 55,15'
        if (isFacingUp.value)
            return 'M25,15 C35,10 45,10 55,15'
        if (isFacingRight.value)
            return 'M25,15 C35,10 45,10 55,15'
        return 'M25,15 C35,10 45,10 55,15'
    }
    else if (hairstyleType.value === 1) {
    // 卷发 - 线条风格
        if (isFacingDown.value)
            return 'M25,15 C30,7 35,3 40,3 C50,7 55,13 55,15'
        if (isFacingUp.value)
            return 'M25,15 C30,7 35,3 40,3 C50,7 55,13 55,15'
        if (isFacingRight.value)
            return 'M25,15 C30,7 35,3 40,3 C50,7 55,13 55,15'
        return 'M25,15 C30,7 35,3 40,3 C50,7 55,13 55,15'
    }
    else if (hairstyleType.value === 2) {
    // 长直发 - 线条风格
        if (isFacingDown.value)
            return 'M25,15 L30,5 L40,2 L50,5 L55,15'
        if (isFacingUp.value)
            return 'M25,15 L30,5 L40,2 L50,5 L55,15'
        if (isFacingRight.value)
            return 'M25,15 L30,5 L40,2 L50,5 L55,15'
        return 'M25,15 L30,5 L40,2 L50,5 L55,15'
    }
    else if (hairstyleType.value === 3) {
    // 尖刺发 - 线条风格
        if (isFacingDown.value)
            return 'M25,15 L28,3 L35,10 L40,1 L45,10 L52,3 L55,15'
        if (isFacingUp.value)
            return 'M25,15 L28,3 L35,10 L40,1 L45,10 L52,3 L55,15'
        if (isFacingRight.value)
            return 'M25,15 L28,3 L35,10 L40,1 L45,10 L52,3 L55,15'
        return 'M25,15 L28,3 L35,10 L40,1 L45,10 L52,3 L55,15'
    }
    else {
    // 莫霍克发型 - 线条风格
        if (isFacingDown.value)
            return 'M35,15 L40,1 L45,15'
        if (isFacingUp.value)
            return 'M35,15 L40,1 L45,15'
        if (isFacingRight.value)
            return 'M35,15 L40,1 L45,15'
        return 'M35,15 L40,1 L45,15'
    }
})

// 添加人物线条风格的身体部分
const getBodyPath = computed(() => {
    // 身体线条
    if (isFacingRight.value) {
        return 'M40,45 L40,60' // 右向身体线
    }
    else if (isFacingLeft.value) {
        return 'M40,45 L40,60' // 左向身体线
    }
    else if (isFacingUp.value) {
        return 'M40,45 L40,60' // 背向身体线
    }
    else {
        return 'M40,45 L40,60' // 正向身体线
    }
})

// 获取手臂路径
const getArmsPath = computed(() => {
    if (props.isMoving) {
    // 移动时的手臂
        if (isFacingRight.value) {
            return 'M40,50 L55,55 M40,50 L30,60'
        }
        else if (isFacingLeft.value) {
            return 'M40,50 L25,55 M40,50 L50,60'
        }
        else {
            return 'M40,50 L25,55 M40,50 L55,55'
        }
    }
    else {
    // 静止时的手臂
        if (isFacingRight.value) {
            return 'M40,50 L55,50 M40,50 L30,50'
        }
        else if (isFacingLeft.value) {
            return 'M40,50 L25,50 M40,50 L50,50'
        }
        else {
            return 'M40,50 L25,50 M40,50 L55,50'
        }
    }
})

// 获取腿部路径
const getLegsPath = computed(() => {
    if (props.isMoving) {
    // 移动时的腿部
        if (isFacingRight.value || isFacingLeft.value) {
            return 'M40,60 L50,75 M40,60 L30,75'
        }
        else {
            return 'M40,60 L50,75 M40,60 L30,75'
        }
    }
    else {
    // 静止时的腿部
        return 'M40,60 L35,75 M40,60 L45,75'
    }
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
        <!-- 角色线条风格 -->
        <g>
            <!-- 阴影 -->
            <ellipse
                cx="40"
                cy="75"
                rx="18"
                ry="2"
                fill="rgba(255,255,255,0.15)"
            />

            <!-- 腿部 -->
            <path
                :d="getLegsPath"
                stroke="#FFFFFF"
                stroke-width="4"
                stroke-linecap="round"
                fill="none"
            />

            <!-- 身体 -->
            <path
                :d="getBodyPath"
                stroke="#FFFFFF"
                stroke-width="4"
                stroke-linecap="round"
                fill="none"
            />

            <!-- 手臂 -->
            <path
                :d="getArmsPath"
                stroke="#FFFFFF"
                stroke-width="4"
                stroke-linecap="round"
                fill="none"
            />

            <!-- 头部 - 简单圆形轮廓 -->
            <circle
                cx="40"
                cy="25"
                r="24"
                fill="none"
                stroke="#FFFFFF"
                stroke-width="5"
                class="head-bounce"
            />

            <!-- 随机发型 -->
            <path
                :d="getHairstylePath"
                stroke="#FFFFFF"
                stroke-width="5"
                stroke-linecap="round"
                fill="none"
            />

            <!-- 面部表情 - 正面 -->
            <g v-if="isFacingDown">
                <!-- 点状眼睛 -->
                <circle cx="30" cy="25" r="4" fill="#FFFFFF" />
                <circle cx="50" cy="25" r="4" fill="#FFFFFF" />

                <!-- 微笑 -->
                <path
                    d="M30,38 Q40,45 50,38"
                    stroke="#FFFFFF"
                    stroke-width="4.5"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>

            <!-- 背面 - 没有表情 -->
            <g v-if="isFacingUp">
                <!-- 只有一个发型轮廓 -->
            </g>

            <!-- 右侧面 -->
            <g v-if="isFacingRight">
                <!-- 侧面点状眼睛 -->
                <circle cx="55" cy="20" r="4" fill="#FFFFFF" />

                <!-- 侧面嘴巴 -->
                <path
                    d="M55,35 L65,35"
                    stroke="#FFFFFF"
                    stroke-width="4.5"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>

            <!-- 左侧面 - 注意我们在这里不再依赖CSS翻转，而是直接绘制左侧朝向 -->
            <g v-if="isFacingLeft">
                <!-- 侧面点状眼睛 -->
                <circle cx="25" cy="20" r="4" fill="#FFFFFF" />

                <!-- 侧面嘴巴 -->
                <path
                    d="M15,35 L25,35"
                    stroke="#FFFFFF"
                    stroke-width="4.5"
                    stroke-linecap="round"
                    fill="none"
                />
            </g>

            <!-- 移动指示器 -->
            <g v-if="isMoving" class="movement-indicator">
                <path
                    v-if="isFacingDown"
                    d="M40,78 L40,80"
                    stroke="#FFFFFF"
                    stroke-width="3.5"
                    stroke-linecap="round"
                />

                <path
                    v-if="isFacingUp"
                    d="M40,0 L40,2"
                    stroke="#FFFFFF"
                    stroke-width="3.5"
                    stroke-linecap="round"
                />

                <path
                    v-if="isFacingRight"
                    d="M78,40 L80,40"
                    stroke="#FFFFFF"
                    stroke-width="3.5"
                    stroke-linecap="round"
                />

                <path
                    v-if="isFacingLeft"
                    d="M0,40 L2,40"
                    stroke="#FFFFFF"
                    stroke-width="3.5"
                    stroke-linecap="round"
                />
            </g>
        </g>
    </svg>
</template>

<style scoped>
.character {
  will-change: transform;
  filter: drop-shadow(0px 0px 15px rgba(0,0,0,1));
}

.head-bounce {
  animation: headBounce 0.5s ease-in-out infinite alternate;
}

@keyframes headBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(2px); }
}

.movement-indicator {
  animation: pulse 0.6s ease-in-out infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.3; stroke-width: 2.5; }
  100% { opacity: 1; stroke-width: 5; }
}

.walking-vertical {
  animation: walkBounce 0.5s ease-in-out infinite alternate;
}

.walking-horizontal {
  animation: walkBounce 0.5s ease-in-out infinite alternate;
}

@keyframes walkBounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}
</style>

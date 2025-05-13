<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{
    x: number
    y: number
    width: number
    height: number
    direction: 'up' | 'down' | 'left' | 'right'
    isMoving: boolean
    bubbleMessage?: string | null
    color?: string // 可选的颜色参数
}>()

// 随机颜色生成
const colors = [
    '#3B82F6', // 蓝色
    '#EF4444', // 红色
    '#10B981', // 绿色
    '#F59E0B', // 黄色
    '#8B5CF6', // 紫色
    '#EC4899', // 粉色
    '#6366F1', // 靛蓝色
    '#F97316', // 橙色
]

// 随机生成角色颜色
const characterColor = ref(props.color || '')

onMounted(() => {
    if (!characterColor.value) {
        // 如果没有提供颜色，随机选择一个
        characterColor.value = colors[Math.floor(Math.random() * colors.length)]
    }
})

// 计算视图框尺寸
const viewBoxWidth = 24
const viewBoxHeight = 36

// 计算角色朝向
const isFacingDown = computed(() => props.direction === 'down')
const isFacingUp = computed(() => props.direction === 'up')
const isFacingLeft = computed(() => props.direction === 'left')
const isFacingRight = computed(() => props.direction === 'right')

// 基于移动状态的动画类
const animationClass = computed(() => {
    if (!props.isMoving)
        return ''

    return 'character-moving'
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
        <!-- 简单火柴人 -->
        <g class="stick-figure" :stroke="characterColor" stroke-width="2" fill="none" stroke-linecap="round">
            <!-- 头部：圆圈 -->
            <circle cx="12" cy="6" r="5" />
            
            <!-- 身体：线条 -->
            <line x1="12" y1="11" x2="12" y2="22" />
            
            <!-- 手臂 - 正面/背面视图 -->
            <g v-if="isFacingUp || isFacingDown">
                <!-- 标准状态下的手臂 -->
                <g v-if="!isMoving">
                    <line x1="12" y1="14" x2="6" y2="18" />
                    <line x1="12" y1="14" x2="18" y2="18" />
                </g>
                
                <!-- 走路状态下的手臂 - 相反摆动 -->
                <g v-if="isMoving">
                    <line class="arm-swing-back" x1="12" y1="14" x2="6" y2="18" />
                    <line class="arm-swing-forward" x1="12" y1="14" x2="18" y2="18" />
                </g>
            </g>
            
            <!-- 侧面手臂 -->
            <g v-if="isFacingLeft || isFacingRight">
                <!-- 标准状态下的手臂 -->
                <g v-if="!isMoving">
                    <line x1="12" y1="14" x2="8" y2="18" />
                    <line x1="12" y1="14" x2="16" y2="18" />
                </g>
                
                <!-- 走路状态下的手臂 - 相反摆动 -->
                <g v-if="isMoving">
                    <line class="arm-swing-opposite" x1="12" y1="14" x2="8" y2="18" />
                    <line class="arm-swing" x1="12" y1="14" x2="16" y2="18" />
                </g>
            </g>
            
            <!-- 腿部 - 正面/背面视图 -->
            <g v-if="isFacingUp || isFacingDown">
                <!-- 标准状态下的腿部 -->
                <g v-if="!isMoving">
                    <line x1="12" y1="22" x2="8" y2="32" />
                    <line x1="12" y1="22" x2="16" y2="32" />
                </g>
                
                <!-- 走路状态下的腿部 - 相反摆动 -->
                <g v-if="isMoving">
                    <line class="leg-swing-forward" x1="12" y1="22" x2="8" y2="32" />
                    <line class="leg-swing-back" x1="12" y1="22" x2="16" y2="32" />
                </g>
            </g>
            
            <!-- 侧面腿部 -->
            <g v-if="isFacingLeft || isFacingRight">
                <!-- 标准状态下的腿部 -->
                <g v-if="!isMoving">
                    <line x1="12" y1="22" x2="8" y2="32" />
                    <line x1="12" y1="22" x2="16" y2="32" />
                </g>
                
                <!-- 走路状态下的腿部 - 模拟行走效果 -->
                <g v-if="isMoving">
                    <line class="leg-swing" x1="12" y1="22" x2="8" y2="32" />
                    <line class="leg-swing-opposite" x1="12" y1="22" x2="16" y2="32" />
                </g>
            </g>
        </g>
    </svg>
</template>

<style scoped>
.character {
  will-change: transform;
  filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.3));
}

.character-moving {
  animation: bounce 0.6s ease-in-out infinite alternate;
}

@keyframes bounce {
  0% { transform: translateY(0); }
  100% { transform: translateY(-2px); }
}

.arm-swing-forward {
  animation: armForward 0.5s infinite alternate;
  transform-origin: 12px 14px;
}

.arm-swing-back {
  animation: armBack 0.5s infinite alternate;
  transform-origin: 12px 14px;
}

.arm-swing {
  animation: armForward 0.5s infinite alternate;
  transform-origin: 12px 14px;
}

.arm-swing-opposite {
  animation: armBack 0.5s infinite alternate;
  transform-origin: 12px 14px;
}

.leg-swing-forward {
  animation: legForward 0.5s infinite alternate;
  transform-origin: 12px 22px;
}

.leg-swing-back {
  animation: legBack 0.5s infinite alternate;
  transform-origin: 12px 22px;
}

.leg-swing {
  animation: legForward 0.5s infinite alternate;
  transform-origin: 12px 22px;
}

.leg-swing-opposite {
  animation: legBack 0.5s infinite alternate;
  transform-origin: 12px 22px;
}

@keyframes armForward {
  0% { transform: rotate(-20deg); }
  100% { transform: rotate(30deg); }
}

@keyframes armBack {
  0% { transform: rotate(20deg); }
  100% { transform: rotate(-30deg); }
}

@keyframes legForward {
  0% { transform: rotate(-15deg); }
  100% { transform: rotate(20deg); }
}

@keyframes legBack {
  0% { transform: rotate(15deg); }
  100% { transform: rotate(-20deg); }
}
</style>

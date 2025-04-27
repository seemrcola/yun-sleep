<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import SpeechBubble from './SpeechBubble.vue'
import CharacterSvg from './svg/CharacterSvg.vue'
// If @vueuse/core is not available, we'll create our own window size tracking
// 使用原生方式获取窗口大小
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 监听窗口大小变化
function updateWindowSize() {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
}

onMounted(() => {
    window.addEventListener('resize', updateWindowSize)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateWindowSize)
})

interface Position {
    x: number
    y: number
}

// Character properties
const CHARACTER_WIDTH = 60 // 更新为新尺寸
const CHARACTER_HEIGHT = 80 // 更新为新尺寸
const MOVE_SPEED = 3 // 每帧移动距离
const JUMP_HEIGHT = 120 // 跳跃高度
const GRAVITY = 0.5 // 重力加速度
const FLOOR_PADDING = 2 // 底部边距

// 计算地板高度
const floorHeight = computed(() => windowHeight.value - FLOOR_PADDING)

// 角色状态
const position = ref<Position>({ x: 100, y: 0 })
const velocity = ref<Position>({ x: 0, y: 0 })
const isJumping = ref(false)
const isFacingRight = ref(true)
const isMoving = ref(false)
const inAir = ref(false)
const direction = ref<'up' | 'down' | 'left' | 'right'>('right')

// 初始定位
onMounted(() => {
    position.value.y = floorHeight.value - CHARACTER_HEIGHT
})

// 监听窗口调整
watch(floorHeight, (newFloorHeight) => {
    // 如果不在跳跃状态,则调整Y位置
    if (!isJumping.value) {
        position.value.y = newFloorHeight - CHARACTER_HEIGHT
    }
})

// 移动角色
function moveCharacter(dir: 'left' | 'right') {
    const speed = MOVE_SPEED
    isMoving.value = true

    if (dir === 'left') {
        velocity.value.x = -speed
        isFacingRight.value = false
        direction.value = 'left'
    }
    else {
        velocity.value.x = speed
        isFacingRight.value = true
        direction.value = 'right'
    }
}

// 停止移动
function stopMovement() {
    velocity.value.x = 0
    isMoving.value = false
}

// 跳跃
function jump() {
    if (!isJumping.value && !inAir.value) {
        velocity.value.y = -JUMP_HEIGHT / 10 // 初始向上速度
        isJumping.value = true
        inAir.value = true
        direction.value = 'up' // 跳跃时方向设为向上
    }
}

// 按键状态
const keys = {
    'ArrowLeft': false,
    'ArrowRight': false,
    'ArrowUp': false,
    ' ': false, // 空格键
}

// 键盘事件
function handleKeyDown(e: KeyboardEvent) {
    if (Object.prototype.hasOwnProperty.call(keys, e.key)) {
        keys[e.key as keyof typeof keys] = true
    }
}

function handleKeyUp(e: KeyboardEvent) {
    if (Object.prototype.hasOwnProperty.call(keys, e.key)) {
        keys[e.key as keyof typeof keys] = false
    }
}

// 更新循环
let animationFrameId: number | null = null

function update() {
    // 处理输入
    if (keys.ArrowLeft) {
        moveCharacter('left')
    }
    else if (keys.ArrowRight) {
        moveCharacter('right')
    }
    else {
        stopMovement()
    }

    // 处理跳跃
    if ((keys.ArrowUp || keys[' ']) && !isJumping.value && !inAir.value) {
        jump()
    }

    // 更新位置
    position.value.x += velocity.value.x
    position.value.y += velocity.value.y

    // 应用重力
    velocity.value.y += GRAVITY

    // 如果下落中，更新方向
    if (velocity.value.y > 0) {
        direction.value = 'down'
    }

    // 边界检查
    if (position.value.x < 0) {
        position.value.x = 0
    }
    else if (position.value.x > windowWidth.value - CHARACTER_WIDTH) {
        position.value.x = windowWidth.value - CHARACTER_WIDTH
    }

    // 检查是否着陆
    if (position.value.y >= floorHeight.value - CHARACTER_HEIGHT) {
        position.value.y = floorHeight.value - CHARACTER_HEIGHT
        velocity.value.y = 0
        isJumping.value = false
        inAir.value = false
        // 如果水平移动，着陆后保持水平方向
        if (velocity.value.x < 0) {
            direction.value = 'left'
        }
        else if (velocity.value.x > 0) {
            direction.value = 'right'
        }
    }
    else {
        inAir.value = true
    }

    animationFrameId = requestAnimationFrame(update)
}

// 安装和卸载事件监听器
onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    animationFrameId = requestAnimationFrame(update)
})

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
    }
})

// 滑动控制 (移动设备)
const touchStartX = ref(0)
let touchActive = false

function handleTouchStart(e: TouchEvent) {
    touchStartX.value = e.touches[0].clientX
    touchActive = true
}

function handleTouchMove(e: TouchEvent) {
    if (!touchActive)
        return

    const touchX = e.touches[0].clientX
    const diff = touchX - touchStartX.value

    if (diff > 30) {
    // 向右滑动
        moveCharacter('right')
    }
    else if (diff < -30) {
    // 向左滑动
        moveCharacter('left')
    }

    // 防止页面滚动
    e.preventDefault()
}

function handleTouchEnd() {
    stopMovement()
    touchActive = false
}

// 点击跳跃 (移动设备)
function handleTouchJump() {
    jump()
}

// Messaging system
const message = ref<string | null>(null)
const messageQueue = ref<string[]>([])
const isProcessingMessage = ref(false)

// 显示消息
function showMessage(text: string) {
    messageQueue.value.push(text)
    processMessageQueue()
}

// 处理消息队列
function processMessageQueue() {
    if (isProcessingMessage.value || messageQueue.value.length === 0) {
        return
    }

    isProcessingMessage.value = true
    message.value = messageQueue.value.shift() || null

    setTimeout(() => {
        message.value = null

        // 延迟后处理下一条消息，确保气泡完全消失
        setTimeout(() => {
            isProcessingMessage.value = false
            processMessageQueue()
        }, 500) // 等待气泡消失动画完成
    }, 3000) // 消息显示时间
}

// 导出供外部使用的显示消息方法
defineExpose({
    showMessage,
})
</script>

<template>
    <div
        class="character-container"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
    >
        <div
            class="character"
            :style="{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: isFacingRight ? 'scaleX(1)' : 'scaleX(-1)',
            }"
        >
            <CharacterSvg
                :x="position.x"
                :y="position.y"
                :width="CHARACTER_WIDTH"
                :height="CHARACTER_HEIGHT"
                :direction="direction"
                :is-moving="isMoving"
                :bubble-message="message"
            />
        </div>

        <SpeechBubble
            :message="message"
            :character-x="position.x"
            :character-y="position.y"
            :character-width="CHARACTER_WIDTH"
            :character-height="CHARACTER_HEIGHT"
        />

        <div v-if="false" class="mobile-controls">
            <button class="jump-button" @touchstart="handleTouchJump">
                Jump
            </button>
        </div>
    </div>
</template>

<style scoped>
.character-container {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 10;
}

.character {
  position: absolute;
  width: v-bind('`${CHARACTER_WIDTH}px`');
  height: v-bind('`${CHARACTER_HEIGHT}px`');
  transition: transform 0.1s ease;
  z-index: 100;
}

.mobile-controls {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  pointer-events: auto;
}

.jump-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  border: 2px solid white;
  font-size: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
  touch-action: manipulation;
}
</style>

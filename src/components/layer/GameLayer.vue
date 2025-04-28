<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import SpeechBubble from '../SpeechBubble.vue'
import BedSvg from '../svg/BedSvg.vue'
import CharacterSvg from '../svg/CharacterSvg.vue'

// 定义属性
const props = defineProps<{
    width?: number
    height?: number
}>()

// 游戏尺寸
const containerRef = ref<HTMLDivElement | null>(null)
const containerWidth = computed(() => props.width || window.innerWidth)
const containerHeight = computed(() => props.height || window.innerHeight)

// 游戏状态
const bedsCount = 24 // 将床的数量从25改为24
const beds = reactive<Bed[]>([])
const character = reactive<Character>({
    x: 100,
    y: 100,
    width: 30, // 小一点的角色宽度
    height: 30, // 小一点的角色高度
    speed: 3,
    isSleeping: false,
    currentBedIndex: -1,
    direction: 'down',
    isMoving: false,
    bubbleMessage: null,
})

// 移动控制
const keys = reactive({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
})

// 类型定义
interface Bed {
    id: number
    x: number
    y: number
    width: number
    height: number
    isOccupied: boolean
}

interface Character {
    x: number
    y: number
    width: number
    height: number
    speed: number
    isSleeping: boolean
    currentBedIndex: number
    direction: 'up' | 'down' | 'left' | 'right'
    isMoving: boolean
    bubbleMessage: string | null
}

// 角色引用，用于获取精确位置
const characterRef = ref<InstanceType<typeof CharacterSvg> | null>(null)

// 计算角色中心位置（用于气泡定位）
const characterPosition = computed(() => {
    return {
        x: character.x,
        y: character.y,
        width: character.width,
        height: character.height,
    }
})

// 初始化游戏
onMounted(() => {
    // 设置键盘控制
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 首次加载时初始化床位
    initializeBeds()

    // 启动游戏循环
    gameLoop()

    // 检查是否应该恢复睡眠状态
    const isSleeping = localStorage.getItem('isSleeping') === 'true'
    if (isSleeping) {
        const bedIndex = localStorage.getItem('currentBedIndex')
        if (bedIndex !== null) {
            const index = Number.parseInt(bedIndex)
            if (index >= 0 && index < beds.length) {
                // 延迟一下以确保床位已初始化
                setTimeout(() => {
                    character.isSleeping = true
                    character.currentBedIndex = index
                    beds[index].isOccupied = true
                    character.x = beds[index].x + (beds[index].width - character.width) / 2
                    character.y = beds[index].y + 35 // 根据火柴人大小调整位置

                    // 触发睡眠开始事件
                    window.dispatchEvent(new CustomEvent('character-sleep-start'))
                }, 100)
            }
        }
    }
})

// 监听容器尺寸变化
watch([containerWidth, containerHeight], () => {
    initializeBeds()
})

// 在网格布局中初始化床位位置
function initializeBeds() {
    beds.length = 0 // 清空现有床位

    const columns = 6 // 调整为6列4行以适应24张床
    const rows = 4
    const bedWidth = 60
    const bedHeight = 90

    const horizontalSpacing = containerWidth.value / columns
    const verticalSpacing = containerHeight.value / rows

    for (let i = 0; i < bedsCount; i++) {
        const row = Math.floor(i / columns)
        const col = i % columns

        beds.push({
            id: i,
            x: col * horizontalSpacing + (horizontalSpacing - bedWidth) / 2,
            y: row * verticalSpacing + (verticalSpacing - bedHeight) / 2,
            width: bedWidth,
            height: bedHeight,
            isOccupied: false,
        })
    }
}

// 角色移动的游戏循环
let lastTime = 0
function gameLoop(time = 0) {
    const deltaTime = time - lastTime
    lastTime = time

    updateCharacterPosition(deltaTime)
    checkCollisions()

    requestAnimationFrame(gameLoop)
}

// 根据键盘输入更新角色位置
function updateCharacterPosition(deltaTime?: number) {
    // console.log('updateCharacterPosition', deltaTime)
    if (deltaTime) void 0 // 如果deltaTime存在，则表示是游戏循环
    
    if (character.isSleeping)
        return

    const moveUp = keys.ArrowUp
    const moveDown = keys.ArrowDown
    const moveLeft = keys.ArrowLeft
    const moveRight = keys.ArrowRight

    let dx = 0
    let dy = 0

    if (moveUp) {
        dy -= character.speed
        character.direction = 'up'
    }
    if (moveDown) {
        dy += character.speed
        character.direction = 'down'
    }
    if (moveLeft) {
        dx -= character.speed
        character.direction = 'left'
    }
    if (moveRight) {
        dx += character.speed
        character.direction = 'right'
    }

    // 标准化对角线移动
    if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2)
        dx *= factor
        dy *= factor
    }

    character.isMoving = dx !== 0 || dy !== 0

    // 带边界检查的位置更新
    const newX = character.x + dx
    const newY = character.y + dy

    if (newX >= 0 && newX + character.width <= containerWidth.value) {
        character.x = newX
    }

    if (newY >= 0 && newY + character.height <= containerHeight.value) {
        character.y = newY
    }
}

// 检查角色与床之间的碰撞
function checkCollisions() {
    if (character.isSleeping)
        return

    for (const bed of beds) {
    // 为了更好的游戏体验，扩大碰撞盒
        const expandedBed = {
            x: bed.x - 5,
            y: bed.y - 5,
            width: bed.width + 10,
            height: bed.height + 10,
        }

        if (
            character.x < expandedBed.x + expandedBed.width
            && character.x + character.width > expandedBed.x
            && character.y < expandedBed.y + expandedBed.height
            && character.y + character.height > expandedBed.y
        ) {
            // 处理碰撞 - 将角色推开
            const overlapLeft = character.x + character.width - expandedBed.x
            const overlapRight = expandedBed.x + expandedBed.width - character.x
            const overlapTop = character.y + character.height - expandedBed.y
            const overlapBottom = expandedBed.y + expandedBed.height - character.y

            // 找到最小重叠并相应调整位置
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

            if (minOverlap === overlapLeft)
                character.x = expandedBed.x - character.width
            else if (minOverlap === overlapRight)
                character.x = expandedBed.x + expandedBed.width
            else if (minOverlap === overlapTop)
                character.y = expandedBed.y - character.height
            else if (minOverlap === overlapBottom)
                character.y = expandedBed.y + expandedBed.height
        }
    }
}

// 输入处理器
function handleKeyDown(e: KeyboardEvent) {
    if (e.key in keys) {
        keys[e.key as keyof typeof keys] = true
    }
}

function handleKeyUp(e: KeyboardEvent) {
    if (e.key in keys) {
        keys[e.key as keyof typeof keys] = false
    }
}

// 床事件处理
function handleBedClicked(bedId: number) {
    if (character.isSleeping) {
    // 如果已经在睡觉，醒来
        if (character.currentBedIndex === bedId) {
            wakeUpCharacter()
        }
        return
    }

    const bed = beds[bedId]
    if (!bed)
        return

    // 检查角色是否足够靠近床以便睡觉
    const characterCenterX = character.x + character.width / 2
    const characterCenterY = character.y + character.height / 2
    const bedCenterX = bed.x + bed.width / 2
    const bedCenterY = bed.y + bed.height / 2

    const distance = Math.sqrt(
        (characterCenterX - bedCenterX) ** 2
        + (characterCenterY - bedCenterY) ** 2,
    )

    // 如果足够近（60px以内），角色可以睡觉
    if (distance < 60) {
        character.isSleeping = true
        character.currentBedIndex = bedId
        bed.isOccupied = true

        // 将角色适当地放在床上 - 调整为更靠下的位置
        character.x = bed.x + (bed.width - character.width) / 2
        character.y = bed.y + 35 // 根据火柴人大小调整位置

        // 保存当前睡眠的床位索引
        localStorage.setItem('currentBedIndex', bedId.toString())

        // 触发睡眠开始事件
        window.dispatchEvent(new CustomEvent('character-sleep-start'))
    }
}

function wakeUpCharacter() {
    if (!character.isSleeping)
        return

    const bedIndex = character.currentBedIndex
    if (bedIndex >= 0 && bedIndex < beds.length) {
        beds[bedIndex].isOccupied = false
    }

    character.isSleeping = false
    character.currentBedIndex = -1

    // 清除睡眠床位索引
    localStorage.removeItem('currentBedIndex')

    // 触发睡眠结束事件
    window.dispatchEvent(new CustomEvent('character-sleep-end'))
}

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

    // 如果角色正在这张床上睡觉，同时移动角色
    if (character.isSleeping && character.currentBedIndex === bedId) {
        character.x = bed.x + (bed.width - character.width) / 2
        character.y = bed.y + 35 // 更新为相同的位置
    }
}

function handleBedDragEnd(bedId: number) {
    console.log('handleBedDragEnd', bedId)
    // 在这个组件中拖动结束时没有特定的事情要做
}

// 角色可见性的计算属性
const isCharacterVisible = computed(() => !character.isSleeping)

// 设置角色气泡消息
let bubbleMessageTimer: number | null = null
function setBubbleMessage(message: string) {
    // 设置消息
    character.bubbleMessage = message

    // 清除之前的计时器（如果有）
    if (bubbleMessageTimer) {
        clearTimeout(bubbleMessageTimer)
    }

    // 设置20秒后消失的计时器
    bubbleMessageTimer = window.setTimeout(() => {
        character.bubbleMessage = null
    }, 20000)
}

// 暴露方法给父组件使用
defineExpose({
    setBubbleMessage,
})
</script>

<template>
    <div
        ref="containerRef"
        class="game-container"
        @click="wakeUpCharacter"
    >
        <svg
            :width="containerWidth"
            :height="containerHeight"
            class="game-svg"
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
                :is-occupied="bed.id === character.currentBedIndex && character.isSleeping"
                @bed-clicked="handleBedClicked"
                @drag-start="handleBedDragStart"
                @drag-move="handleBedDragMove"
                @drag-end="handleBedDragEnd"
            />

            <!-- 角色（仅在不睡觉时显示） -->
            <CharacterSvg
                v-if="isCharacterVisible"
                ref="characterRef"
                :x="character.x"
                :y="character.y"
                :width="character.width"
                :height="character.height"
                :direction="character.direction"
                :is-moving="character.isMoving"
            />
        </svg>

        <!-- 使用DOM方式的气泡框 -->
        <SpeechBubble
            :message="character.bubbleMessage"
            :character-x="characterPosition.x"
            :character-y="characterPosition.y"
            :character-width="characterPosition.width"
            :character-height="characterPosition.height"
        />
    </div>
</template>

<style scoped>
.game-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #87CEEB; /* 天蓝色背景 */
  touch-action: none; /* 防止浏览器处理触摸事件 */
}

.game-svg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10; /* 确保SVG在正确的层级 */
}
</style>

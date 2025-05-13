<script setup lang="ts">
import { computed, onMounted, reactive, ref, onUnmounted } from 'vue'
import CharacterSvg from '../svg/CharacterSvg.vue'
import SpeechBubble from '../SpeechBubble.vue'

// 定义接收的属性
const props = defineProps<{
    width?: number
    height?: number
    beds: any[] // 床位数据
    isLightOn: boolean
}>()

// 定义发出的事件
const emit = defineEmits<{
    'character-sleep': [bedIndex: number]
    'character-wake': []
    'update-character': [character: Character]
}>()

// 角色状态
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

// 角色可见性的计算属性
const isCharacterVisible = computed(() => !character.isSleeping)

// 初始化游戏
onMounted(() => {
    // 设置键盘控制
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 启动游戏循环
    lastTime = 0
    gameLoop()

    // 检查是否应该恢复睡眠状态
    const isSleeping = localStorage.getItem('isSleeping') === 'true'
    if (isSleeping) {
        const bedIndex = localStorage.getItem('currentBedIndex')
        if (bedIndex !== null) {
            const index = Number.parseInt(bedIndex)
            if (index >= 0 && index < props.beds.length) {
                // 延迟一下以确保床位已初始化
                setTimeout(() => {
                    character.isSleeping = true
                    character.currentBedIndex = index
                    
                    // 更新角色位置到床上
                    const bed = props.beds[index]
                    character.x = bed.x + (bed.width - character.width) / 2
                    character.y = bed.y + 35 // 根据火柴人大小调整位置

                    // 触发睡眠开始事件
                    window.dispatchEvent(new CustomEvent('character-sleep-start'))

                    // 通知父组件
                    emit('character-sleep', index)
                    emit('update-character', { ...character })
                }, 100)
            }
        }
    }
})

// 组件卸载时清理
onUnmounted(() => {
    // 移除键盘事件监听
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
    
    // 清除消息气泡计时器
    if (bubbleMessageTimer) {
        clearTimeout(bubbleMessageTimer)
    }
})

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
    if (deltaTime)
        void 0 // 如果deltaTime存在，则表示是游戏循环

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

    // 无需边界检查
    const newX = character.x + dx
    const newY = character.y + dy

    character.x = newX
    character.y = newY
    
    // 通知父组件角色位置更新
    if (character.isMoving) {
        emit('update-character', { ...character })
    }
}

// 检查角色与床之间的碰撞
function checkCollisions() {
    if (character.isSleeping)
        return

    for (const bed of props.beds) {
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
            
            // 通知父组件角色位置更新
            emit('update-character', { ...character })
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

// 处理床点击
function handleBedClick(bedId: number) {
    if (character.isSleeping) {
        // 如果已经在睡觉，醒来
        if (character.currentBedIndex === bedId) {
            wakeUpCharacter()
        }
        return
    }

    const bed = props.beds[bedId]
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

        // 将角色适当地放在床上 - 调整为更靠下的位置
        character.x = bed.x + (bed.width - character.width) / 2
        character.y = bed.y + 35 // 根据火柴人大小调整位置

        // 保存当前睡眠的床位索引
        localStorage.setItem('currentBedIndex', bedId.toString())
        localStorage.setItem('isSleeping', 'true')

        // 触发睡眠开始事件
        window.dispatchEvent(new CustomEvent('character-sleep-start'))
        
        // 通知父组件
        emit('character-sleep', bedId)
        emit('update-character', { ...character })
    }
}

function wakeUpCharacter() {
    if (!character.isSleeping)
        return

    character.isSleeping = false
    character.currentBedIndex = -1

    // 清除睡眠床位索引
    localStorage.removeItem('currentBedIndex')
    localStorage.removeItem('isSleeping')

    // 触发睡眠结束事件
    window.dispatchEvent(new CustomEvent('character-sleep-end'))
    
    // 通知父组件
    emit('character-wake')
    emit('update-character', { ...character })
}

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

// 设置角色坐标 (用于外部调用)
function setCharacterPosition(x: number, y: number) {
    character.x = x
    character.y = y
    emit('update-character', { ...character })
}

// 暴露方法给父组件使用
defineExpose({
    setBubbleMessage,
    setCharacterPosition,
    wakeUpCharacter,
    handleBedClick
})
</script>

<template>
    <div class="player-layer">
        <svg
            :width="width"
            :height="height"
            class="character-svg"
            :class="{ 'lights-off': !isLightOn }"
        >
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
.player-layer {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.character-svg {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}

.character-svg * {
    pointer-events: auto;
}

/* 灯光关闭时的效果 */
.character-svg.lights-off {
    filter: brightness(0.7);
}
</style> 

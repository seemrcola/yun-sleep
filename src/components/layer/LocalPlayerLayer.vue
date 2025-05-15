<script setup lang="ts">
import type { Character } from '@/types.d'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import SpeechBubble from '../SpeechBubble.vue'
import CharacterSvg from '../svg/CharacterSvg.vue'

// 定义接收的属性
const props = defineProps<{
    width?: number
    height?: number
    beds: any[] // 床位数据
    isLightOn: boolean
    character: Character // 本地角色数据
}>()

// 定义发出的事件
const emit = defineEmits<{
    'character-sleep': [bedIndex: number]
    'character-wake': []
    'update-character': [character: Character]
}>()

// 移动控制
const keys = reactive({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
})

// 角色引用，用于获取精确位置
const characterRef = ref<InstanceType<typeof CharacterSvg> | null>(null)

// 计算本地角色中心位置（用于气泡定位）
const characterPosition = computed(() => {
    return {
        x: props.character.x,
        y: props.character.y,
        width: props.character.width,
        height: props.character.height,
    }
})

// 本地角色可见性的计算属性
const isCharacterVisible = computed(() => !props.character.isSleeping)

// 根据键盘输入更新本地角色位置
function updateCharacterPosition(deltaTime?: number) {
    if (deltaTime)
        void 0 // 如果deltaTime存在，则表示是游戏循环

    if (props.character.isSleeping)
        return

    const moveUp = keys.ArrowUp
    const moveDown = keys.ArrowDown
    const moveLeft = keys.ArrowLeft
    const moveRight = keys.ArrowRight

    let dx = 0
    let dy = 0

    if (moveUp) {
        dy -= props.character.speed
        props.character.direction = 'up'
    }
    if (moveDown) {
        dy += props.character.speed
        props.character.direction = 'down'
    }
    if (moveLeft) {
        dx -= props.character.speed
        props.character.direction = 'left'
    }
    if (moveRight) {
        dx += props.character.speed
        props.character.direction = 'right'
    }

    // 标准化对角线移动
    if (dx !== 0 && dy !== 0) {
        const factor = 1 / Math.sqrt(2)
        dx *= factor
        dy *= factor
    }

    props.character.isMoving = dx !== 0 || dy !== 0

    // 无需边界检查
    const newX = props.character.x + dx
    const newY = props.character.y + dy

    props.character.x = newX
    props.character.y = newY

    // 通知父组件角色位置更新
    if (props.character.isMoving) {
        emit('update-character', { ...props.character })
    }
}

// 检查本地角色与床之间的碰撞
function checkCollisions() {
    if (props.character.isSleeping)
        return

    for (const bed of props.beds) {
        // 为了更好的游戏体验，扩大碰撞盒
        const expandedBed = {
            x: bed.x - 2,
            y: bed.y - 2,
            width: bed.width + 4,
            height: bed.height + 4,
        }

        if (
            props.character.x < expandedBed.x + expandedBed.width
            && props.character.x + props.character.width > expandedBed.x
            && props.character.y < expandedBed.y + expandedBed.height
            && props.character.y + props.character.height > expandedBed.y
        ) {
            // 处理碰撞 - 将角色推开
            const overlapLeft = props.character.x + props.character.width - expandedBed.x
            const overlapRight = expandedBed.x + expandedBed.width - props.character.x
            const overlapTop = props.character.y + props.character.height - expandedBed.y
            const overlapBottom = expandedBed.y + expandedBed.height - props.character.y

            // 找到最小重叠并相应调整位置
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)

            if (minOverlap === overlapLeft)
                props.character.x = expandedBed.x - props.character.width
            else if (minOverlap === overlapRight)
                props.character.x = expandedBed.x + expandedBed.width
            else if (minOverlap === overlapTop)
                props.character.y = expandedBed.y - props.character.height
            else if (minOverlap === overlapBottom)
                props.character.y = expandedBed.y + expandedBed.height

            // 通知父组件角色位置更新
            emit('update-character', { ...props.character })
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
    if (props.character.isSleeping) {
        // 如果已经在睡觉，醒来
        if (props.character.currentBedIndex === bedId) {
            wakeUpCharacter()
        }
        return
    }

    const bed = props.beds[bedId]
    if (!bed)
        return

    // 检查角色是否足够靠近床以便睡觉
    const characterCenterX = props.character.x + props.character.width / 2
    const characterCenterY = props.character.y + props.character.height / 2
    const bedCenterX = bed.x + bed.width / 2
    const bedCenterY = bed.y + bed.height / 2

    const distance = Math.sqrt(
        (characterCenterX - bedCenterX) ** 2
        + (characterCenterY - bedCenterY) ** 2,
    )

    // 如果足够近（60px以内），角色可以睡觉
    if (distance < 60) {
        props.character.isSleeping = true
        props.character.currentBedIndex = bedId

        // 将角色适当地放在床上 - 调整为更靠下的位置
        props.character.x = bed.x + (bed.width - props.character.width) / 2
        props.character.y = bed.y + 35 // 根据火柴人大小调整位置

        // 保存当前睡眠的床位索引
        localStorage.setItem('currentBedIndex', bedId.toString())
        localStorage.setItem('isSleeping', 'true')

        // 触发睡眠开始事件
        window.dispatchEvent(new CustomEvent('character-sleep-start'))

        // 通知父组件
        emit('character-sleep', bedId)
        emit('update-character', { ...props.character })
    }
}

function wakeUpCharacter() {
    if (!props.character.isSleeping)
        return

    props.character.isSleeping = false
    props.character.currentBedIndex = -1

    // 清除睡眠床位索引
    localStorage.removeItem('currentBedIndex')
    localStorage.removeItem('isSleeping')

    // 触发睡眠结束事件
    window.dispatchEvent(new CustomEvent('character-sleep-end'))

    // 通知父组件
    emit('character-wake')
    emit('update-character', { ...props.character })
}

// 设置角色气泡消息
let bubbleMessageTimer: number | null = null
function setBubbleMessage(message: string) {
    // 设置消息
    props.character.bubbleMessage = message

    // 清除之前的计时器（如果有）
    if (bubbleMessageTimer) {
        clearTimeout(bubbleMessageTimer)
    }

    // 设置10秒后消失的计时器
    bubbleMessageTimer = window.setTimeout(() => {
        props.character.bubbleMessage = null
    }, 10 * 1000)
}

// 初始化游戏
onMounted(() => {
    // 设置键盘控制
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // 检查是否应该恢复睡眠状态
    const isSleeping = localStorage.getItem('isSleeping') === 'true'
    if (isSleeping) {
        const bedIndex = localStorage.getItem('currentBedIndex')
        if (bedIndex !== null) {
            const index = Number.parseInt(bedIndex)
            if (index >= 0 && index < props.beds.length) {
                // 延迟一下以确保床位已初始化
                setTimeout(() => {
                    props.character.isSleeping = true
                    props.character.currentBedIndex = index

                    // 更新角色位置到床上
                    const bed = props.beds[index]
                    props.character.x = bed.x + (bed.width - props.character.width) / 2
                    props.character.y = bed.y + 35 // 根据火柴人大小调整位置

                    // 触发睡眠开始事件
                    window.dispatchEvent(new CustomEvent('character-sleep-start'))

                    // 通知父组件
                    emit('character-sleep', index)
                    emit('update-character', { ...props.character })
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

// 为父组件的游戏循环提供一个update方法
function updateFrame(deltaTime: number) {
    updateCharacterPosition(deltaTime)
    checkCollisions()
}

// 暴露方法给父组件使用
defineExpose({
    setBubbleMessage,
    wakeUpCharacter,
    handleBedClick,
    updateFrame,
})
</script>

<template>
    <div class="local-player-layer">
        <svg
            :width="width"
            :height="height"
            class="local-character-svg"
            :class="{ 'lights-off': !isLightOn }"
        >
            <!-- 本地角色（仅在不睡觉时显示） -->
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

        <!-- 本地用户的气泡框 -->
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
.local-player-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.local-character-svg {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}

.local-character-svg * {
    pointer-events: auto;
}

/* 灯光关闭时的效果 */
.local-character-svg.lights-off {
    filter: brightness(0.7);
}
</style>

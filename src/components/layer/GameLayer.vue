<script setup lang="ts">
/**
 * 游戏层：
 * - 游戏层会负责管理BedLayer和PlayerLayer
 * - 目前游戏层会负责渲染床头柜 床头柜只会在本地玩家睡觉时显示 远端玩家睡觉状态下本地用户是看不见其床头柜的
 * 床位层：
 *  - 床位层负责渲染床位
 * 玩家层：
 *  - 玩家层分为本地玩家和远端玩家 本地玩家会负责渲染本地玩家 远端玩家会负责渲染远端玩家
 */

import type { Bed, Character } from '@/types.d'
import { computed, onMounted, reactive, ref } from 'vue'
import NightstandModal from '../NightstandModal.vue'
import NightstandItems from '../svg/NightstandItems.vue'
import NightstandSvg from '../svg/NightstandSvg.vue'
import BedLayer from './BedLayer.vue'
import PlayerLayer from './PlayerLayer.vue'

// 定义属性
const props = defineProps<{
    width?: number
    height?: number
    bedCount: number
    characters: Character[]
    roomId: number
}>()

// 定义emit
const emit = defineEmits<{
    (e: 'update-character', character: Character): void
}>()

// 游戏尺寸
const containerRef = ref<HTMLDivElement | null>(null)
const containerWidth = computed(() => props.width || window.innerWidth)
const containerHeight = computed(() => props.height || window.innerHeight)

console.log(props, '---')

// 床的集合
const beds = reactive<Bed[]>([])
// 本地玩家状态
const character = reactive<Character>({
    x: 100,
    y: 100,
    width: 30,
    height: 30,
    speed: 1,
    isSleeping: false,
    currentBedIndex: -1,
    direction: 'down',
    isMoving: false,
    bubbleMessage: null,
})

// 床头柜状态
const nightstandVisible = ref(false)
const nightstandModalVisible = ref(false)
const nightstandItems = reactive({
    eyeMask: false,
    lamp: false,
    melatonin: false,
    musicPlayer: false,
})

// 灯光控制
const isLightOn = ref(true)

// 床头柜位置计算
const nightstandPosition = computed(() => {
    if (character.currentBedIndex >= 0 && character.isSleeping) {
        const bed = beds[character.currentBedIndex]
        return {
            x: bed.x + bed.width + 5, // 床右侧
            y: bed.y + 20,
            width: 30,
            height: 40,
            visible: true,
        }
    }
    return {
        x: 0,
        y: 0,
        width: 30,
        height: 40,
        visible: false,
    }
})

// 组件引用
const bedLayerRef = ref<InstanceType<typeof BedLayer> | null>(null)
const playerLayerRef = ref<InstanceType<typeof PlayerLayer> | null>(null)

// 处理床位更新
function handleBedsUpdate(updatedBeds: Bed[]) {
    beds.length = 0
    beds.push(...updatedBeds)
}

// 处理床位点击
function handleBedClicked(bedId: number) {
    playerLayerRef.value?.handleBedClick(bedId)
}

// 处理角色睡觉
function handleCharacterSleep(bedIndex: number) {
    // 更新床占用状态
    if (bedLayerRef.value) {
        bedLayerRef.value.updateBedOccupation(bedIndex, true)
    }

    // 更新角色状态
    character.isSleeping = true
    character.currentBedIndex = bedIndex

    // 显示床头柜
    nightstandVisible.value = true

    // 保存床头柜状态
    saveNightstandItems()

    emit('update-character', character)
}

// 处理角色醒来
function handleCharacterWake() {
    // 更新床占用状态
    if (character.currentBedIndex >= 0) {
        bedLayerRef.value?.updateBedOccupation(character.currentBedIndex, false)
    }

    // 更新角色状态
    character.isSleeping = false
    character.currentBedIndex = -1

    // 隐藏床头柜
    nightstandVisible.value = false

    // 清除床头柜可见性状态
    localStorage.removeItem('nightstandVisible')

    emit('update-character', character)
}

// 更新角色信息
function handleCharacterUpdate(updatedCharacter: Partial<Character>) {
    Object.assign(character, updatedCharacter)
    emit('update-character', character)
}

// 床头柜点击处理
function handleNightstandClicked() {
    nightstandModalVisible.value = true
}

// 处理床头柜选项选择
function handleItemSelection(item: 'eyeMask' | 'lamp' | 'melatonin' | 'musicPlayer') {
    nightstandItems[item] = !nightstandItems[item]
    saveNightstandItems()
}

// 保存床头柜选项到localStorage
function saveNightstandItems() {
    localStorage.setItem('nightstandItems', JSON.stringify(nightstandItems))
    // 保存床头柜可见性状态
    localStorage.setItem('nightstandVisible', String(nightstandVisible.value))
}

// 从localStorage加载床头柜选项
function loadNightstandItems() {
    const savedItems = localStorage.getItem('nightstandItems')
    if (savedItems) {
        const items = JSON.parse(savedItems)
        Object.assign(nightstandItems, items)
    }

    // 恢复床头柜可见性状态
    const savedVisibility = localStorage.getItem('nightstandVisible')
    if (savedVisibility !== null) {
        nightstandVisible.value = savedVisibility === 'true'
    }
    else {
        // 如果没有保存过，则在睡眠状态下默认显示床头柜
        nightstandVisible.value = character.isSleeping
    }
}

// 角色移动的游戏循环
let lastTime = 0
function gameLoop(time = 0) {
    const deltaTime = time - lastTime
    lastTime = time
    // 玩家组件frame更新
    if (playerLayerRef.value) {
        playerLayerRef.value.updateFrame(deltaTime)
    }
    // 床位组件frame更新
    if (bedLayerRef.value) {
        bedLayerRef.value.updateFrame(deltaTime)
    }
    // 触发下一帧
    requestAnimationFrame(gameLoop)
}

// 处理容器点击，避免点击床头柜时唤醒角色
function handleContainerClick(event: MouseEvent) {
    // 如果点击的是床头柜或其子元素，不要唤醒角色
    const targetElement = event.target as HTMLElement

    // 检查点击的元素是否是床头柜组件的一部分或床头柜模态框
    const isNightstandClick = targetElement.closest('.nightstand') !== null
    const isNightstandModalClick = targetElement.closest('.modal-overlay') !== null

    if (isNightstandClick || isNightstandModalClick) {
        // 阻止事件冒泡，防止唤醒角色
        event.stopPropagation()
        return
    }

    // 否则，唤醒角色
    playerLayerRef.value?.wakeUpCharacter()
}

// 复原床位位置
function resetBedPositions() {
    bedLayerRef.value?.resetBedPositions()
}

// 切换床位拖动功能
function toggleBedDraggable() {
    bedLayerRef.value?.toggleBedDraggable()
}

// 切换灯光
function toggleLight() {
    isLightOn.value = !isLightOn.value
}

// 设置气泡消息
function setBubbleMessage(message: string) {
    playerLayerRef.value?.setBubbleMessage(message)
}

// 初始化游戏
onMounted(() => {
    // 加载床头柜状态
    loadNightstandItems()
    // 启动游戏循环
    gameLoop()
})

// 暴露方法给父组件使用
defineExpose({
    setBubbleMessage,
    toggleLight,
    toggleBedDraggable,
    resetBedPositions,
})
</script>

<template>
    <div
        ref="containerRef"
        class="game-layer-svg-container"
        :class="{ 'lights-off': !isLightOn }"
        @click="handleContainerClick"
    >
        <!-- 床位层 -->
        <BedLayer
            ref="bedLayerRef"
            :width="containerWidth"
            :height="containerHeight"
            :bed-count="bedCount"
            :is-light-on="isLightOn"
            @bed-clicked="handleBedClicked"
            @update-beds="handleBedsUpdate"
        />

        <!-- 玩家层 -->
        <PlayerLayer
            ref="playerLayerRef"
            :width="containerWidth"
            :height="containerHeight"
            :beds="beds"
            :room-id="roomId"
            :is-light-on="isLightOn"
            :characters="characters"
            @character-sleep="handleCharacterSleep"
            @character-wake="handleCharacterWake"
            @update-character="handleCharacterUpdate"
        />

        <!-- 床头柜相关 -->
        <svg
            :width="containerWidth"
            :height="containerHeight"
            class="furniture-svg"
        >
            <!-- 床头柜 -->
            <NightstandSvg
                v-if="character.isSleeping && character.currentBedIndex >= 0"
                :x="nightstandPosition.x"
                :y="nightstandPosition.y"
                :width="nightstandPosition.width"
                :height="nightstandPosition.height"
                :visible="nightstandVisible"
                @nightstand-clicked="handleNightstandClicked"
            />

            <!-- 床头柜物品 -->
            <NightstandItems
                v-if="character.isSleeping && character.currentBedIndex >= 0"
                :x="beds[character.currentBedIndex].x"
                :y="beds[character.currentBedIndex].y"
                :bed-width="beds[character.currentBedIndex].width"
                :bed-height="beds[character.currentBedIndex].height"
                :show-eye-mask="nightstandItems.eyeMask"
                :show-lamp="nightstandItems.lamp"
                :show-music-notes="nightstandItems.musicPlayer"
            />
        </svg>

        <!-- 床头柜弹窗 -->
        <NightstandModal
            :visible="nightstandModalVisible"
            :active-items="nightstandItems"
            @close="nightstandModalVisible = false"
            @select-item="handleItemSelection"
        />
    </div>
</template>

<style scoped>
.game-layer-svg-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #87CEEB; /* 天蓝色背景 */
  touch-action: none; /* 防止浏览器处理触摸事件 */
  transition: background-color 0.5s ease, filter 0.5s ease;
  transform-style: preserve-3d;
  transform: translateZ(0);
  will-change: background-color, filter;
}

/* 灯光关闭时的效果 */
.game-layer-svg-container.lights-off {
  background-color: #1a2939; /* 深蓝色夜间背景 */
  filter: brightness(0.7);
}

.furniture-svg {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 3;
  pointer-events: none;
}

.furniture-svg * {
  pointer-events: auto;
}
</style>

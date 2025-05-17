<script setup lang="ts">
import type { Character } from '@/types.d'
import { useUserStore } from '@/store/user'
import { onMounted, reactive, ref } from 'vue'
import LocalPlayerLayer from './LocalPlayerLayer.vue'
import RemotePlayerLayer from './RemotePlayerLayer.vue'

// 定义接收的属性
const props = defineProps<{
    width?: number
    height?: number
    beds: any[] // 床位数据
    isLightOn: boolean
    roomId: number
    characters: Character[] // 远程角色数据
}>()

// 定义发出的事件
const emit = defineEmits<{
    'character-sleep': [bedIndex: number]
    'character-wake': []
    'update-character': [character: Partial<Character>]
}>()

const userStore = useUserStore()

// 本地角色状态
const character = reactive<Character>({
    id: userStore.user.id,
    username: userStore.user.username,
    room: props.roomId || -1,
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

// 组件引用
const localPlayerLayerRef = ref<InstanceType<typeof LocalPlayerLayer> | null>(null)
const remotePlayerLayerRef = ref<InstanceType<typeof RemotePlayerLayer> | null>(null)

// 处理本地角色睡觉事件
function handleLocalCharacterSleep(bedIndex: number) {
    emit('character-sleep', bedIndex)
}

// 处理本地角色醒来事件
function handleLocalCharacterWake() {
    emit('character-wake')
}

// 处理本地角色更新事件
function handleLocalCharacterUpdate(updatedCharacter: Character) {
    // 更新本地角色状态
    Object.assign(character, updatedCharacter)
    // 传递给父组件
    emit('update-character', { ...character })
}

// 设置气泡消息
function setBubbleMessage(message: string) {
    character.bubbleMessage = message
}

// 设置角色坐标
function setCharacterPosition(x: number, y: number) {
    character.x = x
    character.y = y
    emit('update-character', { x, y })
}

// 处理床点击
function handleBedClick(bedId: number) {
    // 转发给本地玩家层
    localPlayerLayerRef.value?.handleBedClick(bedId)
}

// 唤醒角色
function wakeUpCharacter() {
    // 转发给本地玩家层
    localPlayerLayerRef.value?.wakeUpCharacter()
}

// 为GameLayer的游戏循环提供一个update方法
function updateFrame(deltaTime: number) {
    // 更新本地角色
    localPlayerLayerRef.value?.updateFrame(deltaTime)
    // 更新远程角色
    remotePlayerLayerRef.value?.updateFrame(deltaTime)
}

// 初始化游戏
onMounted(() => {
    // 不需要额外初始化，所有初始化逻辑都转移到LocalPlayerLayer
})

// 暴露方法给父组件使用
defineExpose({
    setBubbleMessage,
    setCharacterPosition,
    wakeUpCharacter,
    handleBedClick,
    updateFrame,
})
</script>

<template>
    <div class="player-layer">
        <!-- 本地玩家层 -->
        <LocalPlayerLayer
            ref="localPlayerLayerRef"
            :width="width"
            :height="height"
            :beds="beds"
            :is-light-on="isLightOn"
            :character="character"
            @character-sleep="handleLocalCharacterSleep"
            @character-wake="handleLocalCharacterWake"
            @update-character="handleLocalCharacterUpdate"
        />

        <!-- 远程玩家层 -->
        <RemotePlayerLayer
            ref="remotePlayerLayerRef"
            :width="width"
            :height="height"
            :beds="beds"
            :is-light-on="isLightOn"
            :characters="characters"
            :local-character-id="character.id"
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
</style>

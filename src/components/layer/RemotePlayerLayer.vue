<script setup lang="ts">
import type { Character } from '@/types.d'
import SpeechBubble from '../SpeechBubble.vue'
import CharacterSvg from '../svg/CharacterSvg.vue'

// 定义接收的属性
const props = defineProps<{
    width?: number
    height?: number
    beds: any[] // 床位数据
    isLightOn: boolean
    characters: Character[] // 远程角色数据
    localCharacterId: number // 本地角色ID，用于过滤
}>()

// 为父组件的游戏循环提供一个update方法
function updateFrame(deltaTime: number) {
    // 远程玩家不需要在本地进行移动逻辑更新
    // 它们的位置由服务器/socket更新
}

// 检查角色是否是远程用户（不是本地用户）
function isRemoteUser(character: Character): boolean {
    return character.id !== props.localCharacterId && character.id !== -1
}

// 暴露方法给父组件使用
defineExpose({
    updateFrame,
})
</script>

<template>
    <div class="remote-player-layer">
        <svg
            :width="width"
            :height="height"
            class="remote-character-svg"
            :class="{ 'lights-off': !isLightOn }"
        >
            <!-- 远程玩家角色 -->
            <template v-for="remoteChar in characters" :key="remoteChar.id">
                <!-- 只渲染非本地用户且ID有效的角色 -->
                <CharacterSvg
                    v-if="isRemoteUser(remoteChar)"
                    :x="remoteChar.x"
                    :y="remoteChar.y"
                    :width="remoteChar.width"
                    :height="remoteChar.height"
                    :direction="remoteChar.direction"
                    :is-moving="remoteChar.isMoving"
                />

                <!-- 远程用户的用户名 -->
                <g v-if="isRemoteUser(remoteChar) && !remoteChar.isSleeping">
                    <!-- 用户名文本 -->
                    <text
                        :x="remoteChar.x + remoteChar.width / 2"
                        :y="remoteChar.y - 5"
                        text-anchor="middle"
                        font-size="12"
                        fill="#000c"
                    >
                        {{ remoteChar.username }}
                    </text>
                </g>
            </template>
        </svg>

        <!-- 远程用户的气泡框 -->
        <template v-for="remoteChar in characters" :key="`bubble-${remoteChar.id}`">
            {{ remoteChar.bubbleMessage }}
            <SpeechBubble
                v-if="isRemoteUser(remoteChar) && remoteChar.bubbleMessage"
                :message="remoteChar.bubbleMessage"
                :character-x="remoteChar.x"
                :character-y="remoteChar.y"
                :character-width="remoteChar.width"
                :character-height="remoteChar.height"
            />
        </template>
    </div>
</template>

<style scoped>
.remote-player-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.remote-character-svg {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}

.remote-character-svg * {
    pointer-events: auto;
}

/* 灯光关闭时的效果 */
.remote-character-svg.lights-off {
    filter: brightness(0.7);
}
</style>

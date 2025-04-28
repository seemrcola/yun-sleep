<script setup lang="ts">
const props = defineProps<{
    x: number
    y: number
    width: number
    height: number
    visible: boolean
}>()

const emit = defineEmits<{
    (e: 'nightstandClicked'): void
}>()

// 处理床头柜的点击
function handleClick(event: MouseEvent) {
    emit('nightstandClicked')
    event.stopPropagation()
}
</script>

<template>
    <svg
        v-if="visible"
        :x="x"
        :y="y"
        :width="width"
        :height="height"
        viewBox="0 0 40 50"
        class="nightstand"
        @click="handleClick"
    >
        <!-- 床头柜基础框架 -->
        <rect
            x="0"
            y="0"
            width="40"
            height="50"
            rx="2"
            ry="2"
            fill="#A0522D"
            stroke="#8B4513"
            stroke-width="1"
        />

        <!-- 床头柜内部面板 -->
        <rect
            x="2"
            y="2"
            width="36"
            height="46"
            rx="1"
            ry="1"
            fill="#D2B48C"
            stroke="#8B4513"
            stroke-width="0.5"
        />

        <!-- 上抽屉 -->
        <rect
            x="4"
            y="5"
            width="32"
            height="12"
            rx="1"
            ry="1"
            fill="#D2B48C"
            stroke="#8B4513"
            stroke-width="0.5"
        />

        <!-- 上抽屉把手 -->
        <rect
            x="17"
            y="10"
            width="6"
            height="2"
            rx="1"
            ry="1"
            fill="#8B4513"
            stroke="#5D4037"
            stroke-width="0.5"
        />

        <!-- 中抽屉 -->
        <rect
            x="4"
            y="20"
            width="32"
            height="12"
            rx="1"
            ry="1"
            fill="#D2B48C"
            stroke="#8B4513"
            stroke-width="0.5"
        />

        <!-- 中抽屉把手 -->
        <rect
            x="17"
            y="25"
            width="6"
            height="2"
            rx="1"
            ry="1"
            fill="#8B4513"
            stroke="#5D4037"
            stroke-width="0.5"
        />

        <!-- 底抽屉 -->
        <rect
            x="4"
            y="35"
            width="32"
            height="12"
            rx="1"
            ry="1"
            fill="#D2B48C"
            stroke="#8B4513"
            stroke-width="0.5"
        />

        <!-- 底抽屉把手 -->
        <rect
            x="17"
            y="40"
            width="6"
            height="2"
            rx="1"
            ry="1"
            fill="#8B4513"
            stroke="#5D4037"
            stroke-width="0.5"
        />

        <!-- 床头柜顶部阴影 -->
        <rect
            x="0"
            y="0"
            width="40"
            height="2"
            fill="rgba(0,0,0,0.1)"
        />

        <!-- 提示闪光效果 -->
        <circle 
            cx="20" 
            cy="25" 
            r="18" 
            fill="rgba(255,255,255,0.0)" 
            stroke="#FFD700" 
            stroke-width="0.7"
            stroke-dasharray="2,2">
            <animate 
                attributeName="stroke-opacity" 
                values="0.8;0.1;0.8" 
                dur="2s" 
                repeatCount="indefinite" 
            />
            <animate 
                attributeName="r" 
                values="16;18;16" 
                dur="2s" 
                repeatCount="indefinite" 
            />
        </circle>
    </svg>
</template>

<style scoped>
.nightstand {
  cursor: pointer;
  transition: transform 0.3s;
}

.nightstand:hover {
  transform: scale(1.05);
}
</style> 

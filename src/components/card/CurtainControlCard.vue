<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import './BaseCardStyles.vue'

// 窗帘状态
const leftCurtainOpen = ref(true)
const rightCurtainOpen = ref(true)

// 切换左侧窗帘
function toggleLeftCurtain() {
    leftCurtainOpen.value = !leftCurtainOpen.value
    // 触发自定义事件，通知CurtainLayer组件更新窗帘状态
    if (leftCurtainOpen.value) {
        window.dispatchEvent(new CustomEvent('open-left-curtain'))
    }
    else {
        window.dispatchEvent(new CustomEvent('close-left-curtain'))
    }
}

// 切换右侧窗帘
function toggleRightCurtain() {
    rightCurtainOpen.value = !rightCurtainOpen.value
    // 触发自定义事件，通知CurtainLayer组件更新窗帘状态
    if (rightCurtainOpen.value) {
        window.dispatchEvent(new CustomEvent('open-right-curtain'))
    }
    else {
        window.dispatchEvent(new CustomEvent('close-right-curtain'))
    }
}

// 监听CurtainLayer中窗帘状态变化的事件
function updateLeftCurtainState(isOpen: boolean) {
    leftCurtainOpen.value = isOpen
}

function updateRightCurtainState(isOpen: boolean) {
    rightCurtainOpen.value = isOpen
}

// 组件挂载时添加事件监听
onMounted(() => {
    window.addEventListener('left-curtain-state-change', ((e: CustomEvent) => {
        updateLeftCurtainState(e.detail.isOpen)
    }) as EventListener)

    window.addEventListener('right-curtain-state-change', ((e: CustomEvent) => {
        updateRightCurtainState(e.detail.isOpen)
    }) as EventListener)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
    window.removeEventListener('left-curtain-state-change', ((e: CustomEvent) => {
        updateLeftCurtainState(e.detail.isOpen)
    }) as EventListener)

    window.removeEventListener('right-curtain-state-change', ((e: CustomEvent) => {
        updateRightCurtainState(e.detail.isOpen)
    }) as EventListener)
})
</script>

<template>
    <div class="control-card">
        <div class="card-header theme-blue">
            <div class="card-title">
                <span>窗帘控制</span>
            </div>
        </div>

        <div class="card-content">
            <button class="control-button" @click.stop="toggleLeftCurtain">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M20 19V3H4v16H2v2h20v-2h-2zm-2 0H6V5h12v14z" />
                    <path fill="currentColor" d="M11 10h2v4h-2z" />
                </svg>
                {{ leftCurtainOpen ? '关闭左侧' : '打开左侧' }}
            </button>

            <button class="control-button" @click.stop="toggleRightCurtain">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M20 19V3H4v16H2v2h20v-2h-2zm-2 0H6V5h12v14z" />
                    <path fill="currentColor" d="M13 10h2v4h-2z" />
                </svg>
                {{ rightCurtainOpen ? '关闭右侧' : '打开右侧' }}
            </button>

            <div class="indicator-container">
                <div style="display: flex; align-items: center;">
                    <div class="indicator-dot" :style="{ backgroundColor: leftCurtainOpen ? '#2196F3' : '#ccc', boxShadow: leftCurtainOpen ? '0 0 4px #2196F3' : 'none' }" />
                    <span>左侧</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <div class="indicator-dot" :style="{ backgroundColor: rightCurtainOpen ? '#FF9800' : '#ccc', boxShadow: rightCurtainOpen ? '0 0 4px #FF9800' : 'none' }" />
                    <span>右侧</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 组件特定样式可以添加在这里 */
</style>

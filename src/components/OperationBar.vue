<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义属性
const props = defineProps<{
    initialLightOn?: boolean
    initialDraggable?: boolean
}>()

// 定义事件
const emit = defineEmits<{
    (e: 'toggleLight'): void
    (e: 'toggleBedDraggable'): void
    (e: 'resetBedPositions'): void
}>()

// 按钮状态，使用props的初始值或默认值
const isDraggable = ref(props.initialDraggable !== undefined ? props.initialDraggable : false)
const isLightOn = ref(props.initialLightOn !== undefined ? props.initialLightOn : true)

// 监听props变化更新本地状态
watch(() => props.initialDraggable, (newVal) => {
    if (newVal !== undefined) {
        isDraggable.value = newVal
    }
}, { immediate: true })

watch(() => props.initialLightOn, (newVal) => {
    if (newVal !== undefined) {
        isLightOn.value = newVal
    }
}, { immediate: true })

// 切换拖动功能
function toggleDraggable() {
    isDraggable.value = !isDraggable.value
    emit('toggleBedDraggable')
}

// 切换灯光
function toggleLight() {
    isLightOn.value = !isLightOn.value
    emit('toggleLight')
}

// 重置床位位置
function resetPositions() {
    emit('resetBedPositions')
}

// 打开GitHub链接
function openGithub() {
    window.open('https://github.com/seemrcola/yun-sleep', '_blank')
}
</script>

<template>
    <div class="operation-bar">
        <div class="operation-button" :class="{ active: isLightOn }" @click="toggleLight">
            <div class="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            </div>
            <span class="button-label">{{ isLightOn ? '关灯' : '开灯' }}</span>
        </div>

        <div class="operation-button" :class="{ active: isDraggable }" @click="toggleDraggable">
            <div class="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
            </div>
            <span class="button-label">拖动</span>
        </div>

        <div class="operation-button" @click="resetPositions">
            <div class="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                </svg>
            </div>
            <span class="button-label">复位</span>
        </div>

        <div class="operation-button github" @click="openGithub">
            <div class="button-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            </div>
            <span class="button-label">Git</span>
        </div>
    </div>
</template>

<style scoped>
.operation-bar {
    position: fixed;
    top: 10px;
    left: 20px;
    display: flex;
    gap: 5px;
    background: rgba(255, 255, 255, 0.85);
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);
    padding: 5px;
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.8);
    transform: translateZ(0);
    will-change: transform;
    isolation: isolate;
}

.operation-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 5px 7px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    border: none;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    gap: 3px;
    min-width: 38px;
    position: relative;
    overflow: hidden;
    user-select: none;
}

.operation-button::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.8), transparent);
}

.operation-button:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
}

.operation-button:active {
    transform: translateY(0px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.operation-button.active {
    background: linear-gradient(135deg, #e0f2fe, #bae6fd);
    box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.5);
    color: #0284c7;
}

.button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 18px;
    color: #555;
    transition: all 0.2s ease;
    opacity: 0.8;
}

.operation-button.active .button-icon {
    color: #0284c7;
    opacity: 1;
}

.button-label {
    font-size: 10px;
    font-weight: 500;
    color: #555;
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
}

.operation-button.active .button-label {
    color: #0284c7;
}

.github {
    color: #333;
}

.github .button-icon {
    color: #333;
}

.github:hover {
    background: rgba(255, 255, 255, 0.9);
}

@media (max-width: 600px) {
    .operation-bar {
        flex-wrap: wrap;
        justify-content: center;
        width: auto;
        max-width: 200px;
    }

    .operation-button {
        min-width: 36px;
        padding: 4px 6px;
    }

    .button-label {
        font-size: 9px;
    }
}

/* 添加精致动画效果 */
@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

.operation-button:hover .button-icon {
    animation: pulse 1s infinite;
}
</style>

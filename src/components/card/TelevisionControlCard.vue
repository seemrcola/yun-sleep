<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import './BaseCardStyles.vue'

// 电视状态
const isTvVisible = ref(false)

// 显示电视机
function showTelevision() {
    isTvVisible.value = true
    window.dispatchEvent(new CustomEvent('turn-on-tv-exe'))
}

// 隐藏电视机
function hideTelevision() {
    isTvVisible.value = false
    window.dispatchEvent(new CustomEvent('turn-off-tv-exe'))
}

onMounted(() => {
    window.addEventListener('turn-on-tv', showTelevision)
    window.addEventListener('turn-off-tv', hideTelevision)
})

onUnmounted(() => {
    window.removeEventListener('turn-on-tv', showTelevision)
    window.removeEventListener('turn-off-tv', hideTelevision)
})
</script>

<template>
    <div class="control-card">
        <div class="card-header theme-blue">
            <div class="card-title">
                电视控制
            </div>
            <div class="card-status" :class="{ 'status-on': isTvVisible, 'status-off': !isTvVisible }">
                {{ isTvVisible ? '已显示' : '已隐藏' }}
            </div>
        </div>
        <div class="card-content">
            <div class="buttons-row">
                <button class="control-button" @click="showTelevision">
                    <span>▼</span> 降下
                </button>
                <button class="control-button" @click="hideTelevision">
                    <span>▲</span> 升起
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 组件特定样式可以添加在这里 */
</style>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

// 睡觉时间追踪
const sleepStartTime = ref<number | null>(null)
const totalSleepTime = ref(0) // 总睡觉时间（秒）
const sleepTimerInterval = ref<number | null>(null)
const isSleeping = ref(false)

// 格式化时间为 HH:MM:SS 格式
function formatTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (num: number): string => num.toString().padStart(2, '0')

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}

// 格式化的总睡眠时间
const formattedTotalSleepTime = computed(() => formatTime(totalSleepTime.value))

// 初始化组件
onMounted(() => {
    // 尝试从localStorage读取之前保存的睡觉时间
    const savedSleepTime = localStorage.getItem('totalSleepTime')
    if (savedSleepTime) {
        totalSleepTime.value = Number.parseInt(savedSleepTime)
    }

    // 监听睡眠状态事件
    window.addEventListener('character-sleep-start', onSleepStart)
    window.addEventListener('character-sleep-end', onSleepEnd)

    // 检查是否已经在睡觉
    const sleepingState = localStorage.getItem('isSleeping')
    if (sleepingState === 'true') {
        onSleepStart()
    }
})

onUnmounted(() => {
    // 清理事件监听
    window.removeEventListener('character-sleep-start', onSleepStart)
    window.removeEventListener('character-sleep-end', onSleepEnd)

    // 停止计时器
    stopSleepTimer()
})

// 开始睡觉计时
function onSleepStart() {
    isSleeping.value = true
    localStorage.setItem('isSleeping', 'true')

    if (sleepTimerInterval.value === null) {
        sleepStartTime.value = Date.now()
        sleepTimerInterval.value = window.setInterval(() => {
            // 更新总睡觉时间
            totalSleepTime.value++
            // 每10秒保存一次睡觉时间到localStorage
            if (totalSleepTime.value % 10 === 0) {
                localStorage.setItem('totalSleepTime', totalSleepTime.value.toString())
            }
        }, 1000)
    }
}

// 停止睡觉计时
function onSleepEnd() {
    isSleeping.value = false
    localStorage.setItem('isSleeping', 'false')

    if (sleepTimerInterval.value !== null) {
        clearInterval(sleepTimerInterval.value)
        sleepTimerInterval.value = null
        sleepStartTime.value = null
        // 保存总睡觉时间到localStorage
        localStorage.setItem('totalSleepTime', totalSleepTime.value.toString())
    }
}

function stopSleepTimer() {
    if (sleepTimerInterval.value !== null) {
        clearInterval(sleepTimerInterval.value)
        sleepTimerInterval.value = null
    }
}
</script>

<template>
    <div class="sleep-time-card">
        <div class="sleep-card-title">
            睡觉时间
        </div>
        <div class="sleep-card-time">
            {{ formattedTotalSleepTime }}
        </div>
        <div v-if="isSleeping" class="sleeping-now">
            正在睡觉...
        </div>
    </div>
</template>

<style scoped>
.sleep-time-card {
  position: fixed;
  top: 20px;
  left: 20px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  min-width: 150px;
  transition: all 0.3s ease;
  border: 2px solid #FFC107;
}

.sleep-card-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 6px;
  font-weight: bold;
}

.sleep-card-time {
  font-size: 22px;
  color: #3F51B5;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.sleeping-now {
  margin-top: 8px;
  font-size: 12px;
  color: #4CAF50;
  animation: pulse 1.5s infinite alternate;
}

@keyframes pulse {
  0% { opacity: 0.7; }
  100% { opacity: 1; }
}
</style>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// 电视状态
const isTvVisible = ref(false)

// 显示电视机
function showTelevision() {
    isTvVisible.value = true
    window.dispatchEvent(new CustomEvent('turn-on-tv'))
}

// 隐藏电视机
function hideTelevision() {
      isTvVisible.value = false
      window.dispatchEvent(new CustomEvent('turn-off-tv'))
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
    <div class="tv-control-card">
        <div class="card-header">
            <div class="card-title">
                电视控制
            </div>
            <div class="card-status" :class="{ 'status-on': isTvVisible }">
                {{ isTvVisible ? '已显示' : '已隐藏' }}
            </div>
        </div>
        <div class="card-content">
            <div class="buttons-row">
                <button class="control-button" @click="showTelevision">
                    <span class="arrow-icon">▼</span> 降下
                </button>
                <button class="control-button" @click="hideTelevision">
                    <span class="arrow-icon">▲</span> 升起
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.tv-control-card {
  position: fixed;
  top: 220px;
  right: 20px;
  width: 180px;
  background-color: #fff2;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #000;
  padding: 15px;
  font-family: sans-serif;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-weight: bold;
  font-size: 16px;
}

.card-status {
  font-size: 12px;
  padding: 4px 8px;
  background-color: rgba(255, 0, 0, 0.2);
  border-radius: 10px;
  color: #ff6b6b;
  transition: all 0.3s ease;
}

.status-on {
  background-color: #000d;
  color: #6bff6b;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-button {
  padding: 10px;
  border-radius: 8px;
  border: none;
  background-color: rgba(70, 70, 90, 0.8);
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-button:hover {
  background-color: rgba(90, 90, 120, 0.8);
  transform: translateY(-1px);
}

.control-button:active {
  transform: translateY(1px);
}

.toggle-button {
  background-color: #3a86ff;
  font-weight: bold;
}

.toggle-button:hover {
  background-color: #4a96ff;
}

.button-on {
  background-color: #ff477e;
}

.button-on:hover {
  background-color: #ff5a8e;
}

.buttons-row {
  display: flex;
  gap: 10px;
}

.buttons-row .control-button {
  flex: 1;
}

.arrow-icon {
  margin-right: 5px;
}
</style>

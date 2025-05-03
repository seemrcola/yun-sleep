<script setup lang="ts">
import { reactive, ref } from 'vue'

interface RoomForm {
    name: string
    description: string
    capacity: number
}

const props = defineProps<{
    onCreateRoom: (form: RoomForm) => Promise<void>
}>()

const roomForm = reactive({
    name: '',
    description: '',
    capacity: 20,
})

const isCreating = ref(false)
const errorMessage = ref('')

async function handleCreateRoom() {
    if (!roomForm.name.trim()) {
        errorMessage.value = '请输入房间名称'
        return
    }
    isCreating.value = true
    try {
        await props.onCreateRoom(roomForm)
    }
    catch (err) {
        console.log(err)
    }
    finally {
        isCreating.value = false
    }
}
</script>

<template>
    <div class="create-card">
        <div class="card-header">
            <h2 class="section-title">
                创建休息区
            </h2>
            <div class="decoration-line" />
        </div>

        <!-- 装饰性SVG -->
        <div class="decoration-container">
            <svg class="decoration-svg" viewBox="0 0 200 200" fill="none">
                <path class="deco-path" d="M40 100 Q70 40 100 100 T160 100" />
                <circle class="deco-dot" cx="40" cy="100" r="4" />
                <circle class="deco-dot" cx="160" cy="100" r="4" />
                <path class="deco-path-2" d="M60 140 Q100 180 140 140" />
                <circle class="deco-dot" cx="60" cy="140" r="3" />
                <circle class="deco-dot" cx="140" cy="140" r="3" />
            </svg>
        </div>

        <form class="create-form" @submit.prevent="handleCreateRoom">
            <div class="form-item">
                <label for="room-name">
                    <span class="label-text">房间名称</span>
                    <span class="label-desc">给你的休息区起个名字</span>
                </label>
                <div class="input-wrapper">
                    <input
                        id="room-name"
                        v-model="roomForm.name"
                        type="text"
                        placeholder="例如：深夜修仙室"
                    >
                    <span class="input-focus-border" />
                </div>
            </div>

            <div class="form-item">
                <label for="room-desc">
                    <span class="label-text">房间描述</span>
                    <span class="label-desc">简单描述一下你的休息区</span>
                </label>
                <div class="input-wrapper">
                    <textarea
                        id="room-desc"
                        v-model="roomForm.description"
                        placeholder="例如：适合深夜修仙的休息室"
                        rows="3"
                        :max-length="100"
                        class="description-textarea"
                    />
                    <span class="input-focus-border" />
                </div>
            </div>

            <div class="form-item">
                <label for="capacity">
                    <span class="label-text">容纳人数</span>
                    <span class="label-desc">选择休息区可容纳的人数</span>
                </label>
                <div class="capacity-selector">
                    <button
                        type="button"
                        class="capacity-btn minus"
                        :disabled="roomForm.capacity <= 2"
                        @click="roomForm.capacity--"
                    >
                        <span class="btn-icon">-</span>
                    </button>
                    <div class="capacity-display">
                        <span class="capacity-number">{{ roomForm.capacity }}</span>
                        <span class="capacity-text">人</span>
                    </div>
                    <button
                        type="button"
                        class="capacity-btn plus"
                        :disabled="roomForm.capacity >= 24"
                        @click="roomForm.capacity++"
                    >
                        <span class="btn-icon">+</span>
                    </button>
                </div>
            </div>

            <transition name="fade">
                <div v-if="errorMessage" class="error-message">
                    <svg class="error-icon" viewBox="0 0 24 24" width="16" height="16">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
                    </svg>
                    {{ errorMessage }}
                </div>
            </transition>

            <button type="submit" class="create-btn" :class="{ creating: isCreating }">
                <span class="btn-content">
                    <svg v-if="isCreating" class="loading-icon" viewBox="0 0 24 24">
                        <circle class="loading-circle" cx="12" cy="12" r="10" />
                    </svg>
                    <span class="btn-text">{{ isCreating ? '创建中...' : '创建休息区' }}</span>
                </span>
                <span class="btn-shine" />
            </button>
        </form>
    </div>
</template>

<style scoped>
.create-card {
  width: 100%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  padding: 32px;
  box-shadow: 0 4px 24px rgba(31, 41, 55, 0.06);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.card-header {
  position: relative;
  margin-bottom: 36px;
}

.section-title {
  font-size: 1.75rem;
  color: #1a365d;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
}

.decoration-line {
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 2px;
}

.decoration-container {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 120px;
  height: 120px;
  opacity: 0.6;
}

.decoration-svg {
  width: 100%;
  height: 100%;
}

.deco-path {
  stroke: #3b82f6;
  stroke-width: 2;
  stroke-linecap: round;
  fill: none;
  animation: pathDraw 3s ease-in-out infinite;
}

.deco-path-2 {
  stroke: #60a5fa;
  stroke-width: 2;
  stroke-linecap: round;
  fill: none;
  animation: pathDraw 3s ease-in-out infinite 1.5s;
}

.deco-dot {
  fill: #3b82f6;
  animation: dotPulse 3s ease-in-out infinite;
}

@keyframes pathDraw {
  0% { stroke-dasharray: 0 100; }
  45%, 55% { stroke-dasharray: 100 0; }
  100% { stroke-dasharray: 0 100; }
}

@keyframes dotPulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.5); opacity: 1; }
}

.create-form {
  position: relative;
  z-index: 1;
}

.form-item {
  margin-bottom: 28px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
}

.label-text {
  display: block;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 4px;
}

.label-desc {
  display: block;
  font-size: 0.85rem;
  color: #64748b;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.8);
  color: #1a365d;
  transition: all 0.3s;
}

.input-wrapper input:focus {
  border-color: #3b82f6;
  background: white;
  outline: none;
}

.input-focus-border {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #3b82f6;
  transition: all 0.3s;
  transform: translateX(-50%);
}

.input-wrapper input:focus + .input-focus-border {
  width: calc(100% - 24px);
}

.capacity-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px;
  border-radius: 12px;
  border: 1.5px solid #e2e8f0;
}

.capacity-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  background: #f1f5f9;
  color: #3b82f6;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.capacity-btn:not(:disabled):hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.capacity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.capacity-display {
  flex: 1;
  text-align: center;
  font-weight: 600;
  color: #1a365d;
}

.capacity-number {
  font-size: 1.2rem;
  margin-right: 4px;
}

.capacity-text {
  font-size: 0.9rem;
  color: #64748b;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
  font-size: 0.9rem;
  padding: 8px 12px;
  background: #fee2e2;
  border-radius: 8px;
  margin: -16px 0 20px;
}

.create-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.create-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transform: translateX(-100%);
  animation: shine 3s infinite;
}

@keyframes shine {
  to {
    transform: translateX(100%);
  }
}

.loading-icon {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

.loading-circle {
  fill: none;
  stroke: white;
  stroke-width: 2;
  stroke-dasharray: 60;
  stroke-dashoffset: 60;
  animation: circle 1.5s ease-in-out infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

@keyframes circle {
  0% { stroke-dashoffset: 60; }
  50% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: -60; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.description-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  background: rgba(255, 255, 255, 0.8);
  color: #1a365d;
  transition: all 0.3s;
  font-family: inherit;
  resize: none;
}

.description-textarea:focus {
  border-color: #3b82f6;
  background: white;
  outline: none;
}
</style>

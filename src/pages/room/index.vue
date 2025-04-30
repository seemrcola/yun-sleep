<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { createRoomAction, listRoomsAction } from './api'

interface Room {
    id: string
    name: string
    capacity: number
    current: number
    ownerName: string
    description: string
    createTime: string
}

const roomForm = reactive({
    name: '',
    description: '',
    capacity: 20,
})

const searchQuery = ref('')
const rooms = ref<Room[]>([])

searchRooms()
async function searchRooms() {
    const roomsList = await listRoomsAction()
    rooms.value = roomsList as Room[]
}

const filteredRooms = computed(() => {
    if (!searchQuery.value)
        return rooms.value
    const query = searchQuery.value.toLowerCase()
    return rooms.value.filter(room =>
        room.name.toLowerCase().includes(query)
        || room.ownerName.toLowerCase().includes(query),
    )
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
        await createRoomAction(roomForm)
    }
    catch (err) {
        console.log(err)
    }
    finally {
        isCreating.value = false
    }
}

async function handleJoinRoom(room: Room) {
    // TODO: 调用加入房间接口
    console.log('加入房间:', room)
}
</script>

<template>
    <div class="room-container">
        <!-- 左侧创建区域 -->
        <div class="create-section">
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
                                :disabled="roomForm.capacity >= 8"
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
        </div>

        <!-- 右侧列表区域 -->
        <div class="list-section">
            <div class="list-header">
                <h2 class="section-title">
                    休息区列表
                </h2>
                <div class="search-box">
                    <svg class="search-icon" viewBox="0 0 24 24" width="18" height="18">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor" />
                    </svg>
                    <input
                        v-model="searchQuery"
                        type="text"
                        placeholder="搜索房间名或创建者"
                        class="search-input"
                    >
                </div>
            </div>

            <div class="room-list">
                <div v-for="room in filteredRooms" :key="room.id" class="room-card">
                    <div class="room-info">
                        <div class="room-header">
                            <h3 class="room-name">
                                {{ room.name }}
                            </h3>
                            <span class="room-status" :class="{ 'almost-full': room.current >= room.capacity - 1 }">
                                {{ room.current >= room.capacity ? '已满' : '可加入' }}
                            </span>
                        </div>
                        <p v-if="room.description" class="room-description">
                            {{ room.description }}
                        </p>
                        <div class="room-meta">
                            <div class="meta-item creator">
                                <svg class="meta-icon" viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                                </svg>
                                <span>{{ room.ownerName }}</span>
                            </div>
                            <div class="meta-item capacity">
                                <div class="capacity-bar">
                                    <div
                                        class="capacity-fill"
                                        :style="{ width: `${room.current / room.capacity * 100}%` }"
                                    />
                                </div>
                                <span class="capacity-text">{{ room.current }}/{{ room.capacity }}</span>
                            </div>
                        </div>
                        <div class="room-footer">
                            <span class="room-time">{{ room.createTime }}</span>
                            <button
                                class="join-btn"
                                :disabled="room.current >= room.capacity"
                                @click="handleJoinRoom(room)"
                            >
                                <span class="btn-text">加入</span>
                                <svg class="btn-arrow" viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="filteredRooms.length === 0" class="no-results">
                    <svg class="empty-icon" viewBox="0 0 24 24" width="48" height="48">
                        <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" fill="currentColor" />
                    </svg>
                    <p class="empty-text">
                        没有找到匹配的休息区
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.room-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f6f9fc 0%, #edf3f8 100%);
  color: #2c3e50;
}

.create-section {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

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

.list-section {
  width: 30%;
  min-width: 320px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(31, 41, 55, 0.03);
}

.list-header {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  margin-top: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  transition: color 0.3s;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.8);
  color: #1a365d;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #3b82f6;
  background: white;
  outline: none;
}

.search-input:focus + .search-icon {
  color: #3b82f6;
}

.room-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.room-list::-webkit-scrollbar {
  width: 6px;
}

.room-list::-webkit-scrollbar-track {
  background: transparent;
}

.room-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.room-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s;
  border: 1px solid #e2e8f0;
}

.room-card:hover {
  transform: translateX(-4px);
  box-shadow: 4px 4px 20px rgba(31, 41, 55, 0.05);
  border-color: #3b82f6;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.room-name {
  font-size: 1.1rem;
  color: #1a365d;
  font-weight: 600;
  margin: 0;
}

.room-status {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  background: #dcfce7;
  color: #166534;
}

.room-status.almost-full {
  background: #fef3c7;
  color: #92400e;
}

.room-meta {
  margin-bottom: 16px;
}

.room-description {
  font-size: 0.85rem;
  color: #64748b;
  margin: 8px 0 16px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.meta-icon {
  color: #94a3b8;
}

.capacity-bar {
  flex: 1;
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
  margin: 0 8px;
}

.capacity-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 3px;
  transition: width 0.3s;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.room-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.join-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.join-btn:not(:disabled):hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
}

.join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-arrow {
  transition: transform 0.2s;
}

.join-btn:hover .btn-arrow {
  transform: translateX(2px);
}

.no-results {
  text-align: center;
  padding: 40px 0;
  color: #94a3b8;
}

.empty-icon {
  margin-bottom: 12px;
  color: #cbd5e1;
}

.empty-text {
  font-size: 0.9rem;
  margin: 0;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 1024px) {
  .room-container {
    flex-direction: column;
  }

  .create-section {
    padding: 24px;
  }

  .list-section {
    width: 100%;
    min-width: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.8);
  }
}

@media (max-width: 480px) {
  .create-card {
    padding: 24px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .room-meta {
    flex-direction: column;
  }
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

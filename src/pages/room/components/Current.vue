<script setup lang="ts">
import type { Room } from '../type'
import dayjs from 'dayjs'

defineProps<{
    room: Room | null
    onEnterRoom: () => void
    onLeaveRoom: () => void
}>()
</script>

<template>
    <div class="current-room-card">
        <div class="card-header">
            <h2 class="section-title">
                当前休息区
            </h2>
            <div class="decoration-line" />
        </div>

        <div class="current-room-content">
            <h3 class="current-room-name">
                {{ room?.name }}
            </h3>

            <div class="current-room-info">
                <p v-if="room?.description" class="current-room-description">
                    {{ room?.description }}
                </p>

                <!-- 休息区信息卡片 -->
                <div class="room-info-card">
                    <div class="info-item">
                        <div class="info-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
                            </svg>
                        </div>
                        <div class="info-content">
                            <div class="info-label">
                                创建者
                            </div>
                            <div class="info-value">
                                {{ room?.ownerName }}
                            </div>
                        </div>
                    </div>

                    <div class="info-divider" />

                    <div class="info-item">
                        <div class="info-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="currentColor" />
                            </svg>
                        </div>
                        <div class="info-content">
                            <div class="info-label">
                                人数
                            </div>
                            <div class="info-value">
                                {{ room?.current }}/{{ room?.capacity }}
                            </div>
                        </div>
                    </div>

                    <div class="info-divider" />

                    <div class="info-item">
                        <div class="info-icon">
                            <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor" />
                            </svg>
                        </div>
                        <div class="info-content">
                            <div class="info-label">
                                创建时间
                            </div>
                            <div class="info-value">
                                {{ dayjs(room?.createdAt).format('YY-MM-DD') }}
                            </div>
                            <div class="info-value">
                                {{ dayjs(room?.createdAt).format('HH:mm:ss') }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="current-room-capacity">
                    <div class="capacity-label">
                        房间容量
                    </div>
                    <div class="capacity-bar-large">
                        <div
                            class="capacity-fill-large"
                            :style="{ width: room ? `${room.current / room.capacity * 100}%` : '0%' }"
                        >
                            <span class="capacity-text-inner">{{ room?.current }}/{{ room?.capacity }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="room-action-buttons">
                <button class="enter-btn" @click="onEnterRoom">
                    <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                    </svg>
                    进入休息区
                </button>

                <button class="leave-btn" @click="onLeaveRoom">
                    <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                        <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" fill="currentColor" />
                    </svg>
                    离开休息区
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.current-room-card {
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
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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

.current-room-content {
  padding: 20px 0;
}

.current-room-name {
  font-size: 1.5rem;
  color: #1a365d;
  font-weight: 700;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.current-room-description {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
}

.room-info-card {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #3b82f6;
  position: relative;
  margin-bottom: 24px;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  padding: 8px 0;
  min-width: 0;
}

.info-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.info-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 2px;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-divider {
  width: 1px;
  height: 30px;
  background: #e2e8f0;
  flex-shrink: 0;
}

.current-room-capacity {
  margin-top: 16px;
}

.capacity-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a365d;
  margin-bottom: 8px;
}

.capacity-bar-large {
  height: 24px;
  background: #f1f5f9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.capacity-fill-large {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 12px;
  transition: width 0.5s;
  display: flex;
  align-items: center;
  padding: 0 12px;
  min-width: 60px;
}

.capacity-text-inner {
  color: white;
  font-size: 0.85rem;
  font-weight: 600;
}

.room-action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.enter-btn, .leave-btn {
  padding: 0;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  overflow: hidden;
}

.btn-icon {
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.enter-btn {
  background: linear-gradient(135deg, #4096ff 0%, #1677ff 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 150, 255, 0.2);
}

.leave-btn {
  background: white;
  color: #e11d48;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.enter-btn::before,
.leave-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.enter-btn:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 4px 12px rgba(64, 150, 255, 0.3);
}

.enter-btn:hover::before {
  opacity: 1;
}

.enter-btn:hover .btn-icon {
  transform: translateX(-2px);
}

.leave-btn:hover {
  transform: translateY(-2px) scale(1.02);
  background: #fff1f2;
  border-color: #fecdd3;
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.15);
}

.leave-btn:hover .btn-icon {
  transform: translateX(2px);
}

.enter-btn:active,
.leave-btn:active {
  transform: translateY(1px) scale(0.98);
}
</style>

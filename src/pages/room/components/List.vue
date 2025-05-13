<script setup lang="ts">
import type { Room } from '../type'
import { format } from 'date-fns/fp'
import { computed, ref } from 'vue'

const props = defineProps<{
    rooms: Room[]
    currentRoom: Room | null
    onJoinRoom: (room: Room) => void
}>()

const searchQuery = ref('')

const filteredRooms = computed(() => {
    if (!searchQuery.value)
        return props.rooms

    const query = searchQuery.value.toLowerCase()
    return props.rooms.filter(room =>
        room.name.toLowerCase().includes(query)
        || room.ownerName.toLowerCase().includes(query),
    )
})
</script>

<template>
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
                        <span class="room-time">
                            {{
                                room?.createdAt
                                    ? format('yyyy-MM-dd HH:mm:ss')(new Date(room.createdAt))
                                    : ''
                            }}
                        </span>
                        <button
                            class="join-btn"
                            :disabled="room.current >= room.capacity || (currentRoom !== null && currentRoom.id === room.id)"
                            @click="onJoinRoom(room)"
                        >
                            <span class="btn-text">{{ currentRoom && currentRoom.id === room.id ? '已加入' : '加入' }}</span>
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
</template>

<style scoped>
.list-section {
  width: 30%;
  min-width: 320px;
  background: linear-gradient(180deg, rgba(240, 249, 255, 0.9) 0%, rgba(224, 242, 254, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.8);
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 24px rgba(31, 41, 55, 0.03);
  height: 100vh;
  overflow: hidden;
}

.list-header {
  margin-bottom: 24px;
  flex-shrink: 0;
}

.section-title {
  font-size: 1.75rem;
  color: #1a365d;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.02em;
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
  margin-right: -8px;
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
  padding: 16px;
  margin-bottom: 14px;
  transition: all 0.3s ease;
  border-left: 4px solid #e2e8f0;
  position: relative;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.room-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 40%;
  height: 100%;
  background: linear-gradient(135deg, transparent, rgba(248, 250, 252, 0.8));
  pointer-events: none;
}

.room-card:hover {
  border-left-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.room-name {
  font-size: 1.1rem;
  color: #1a365d;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.room-status {
  font-size: 0.8rem;
  padding: 3px 12px;
  border-radius: 20px;
  background: #dcfce7;
  color: #166534;
  font-weight: 500;
  flex-shrink: 0;
}

.room-status.almost-full {
  background: #fef3c7;
  color: #92400e;
}

.room-description {
  font-size: 0.9rem;
  color: #64748b;
  margin: 6px 0 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #64748b;
}

.meta-item.creator {
  color: #1e40af;
  font-weight: 500;
}

.meta-icon {
  flex-shrink: 0;
  margin-right: 2px;
  color: #3b82f6;
}

.capacity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.capacity-bar {
  width: 80px;
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
  transition: width 0.3s;
}

.capacity-text {
  font-weight: 500;
  color: #334155;
}

.room-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.room-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

.join-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 12px;
  background: #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.join-btn:not(:disabled):hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.join-btn:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}

.btn-arrow {
  transition: transform 0.2s;
  width: 16px;
  height: 16px;
}

.join-btn:hover .btn-arrow {
  transform: translateX(3px);
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

@media (max-width: 1024px) {
  .list-section {
    width: 100%;
    min-width: 0;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.8);
  }
}

@media (max-width: 480px) {
  .room-card {
    padding: 14px;
  }

  .room-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>

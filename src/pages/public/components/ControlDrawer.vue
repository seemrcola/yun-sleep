<script setup lang="ts">
import CurtainControlCard from '@/components/card/CurtainControlCard.vue'
import TelevisionControlCard from '@/components/card/TelevisionControlCard.vue'
import WeatherControlCard from '@/components/card/WeatherControlCard.vue'
import { onMounted, onUnmounted, ref } from 'vue'

defineProps({
    // 在打开时是否显示半透明遮罩
    showMask: {
        type: Boolean,
        default: true,
    },
    // 抽屉打开方向，目前仅支持 'right'
    placement: {
        type: String,
        default: 'right',
        validator: (value: string) => ['right'].includes(value),
    },
    // 抽屉宽度
    width: {
        type: String,
        default: '280px',
    },
})

// 抽屉是否打开
const isOpen = ref(false)

// 切换抽屉状态
function toggleDrawer() {
    isOpen.value = !isOpen.value
}

// 关闭抽屉
function closeDrawer() {
    isOpen.value = false
}

// 监听ESC键关闭抽屉
function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
        closeDrawer()
    }
}

// 添加和移除键盘事件监听
onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
    <div>
        <!-- 触发按钮 - 允许通过slot自定义 -->
        <div @click="toggleDrawer">
          <slot name="trigger"></slot>
        </div>

        <div class="drawer-container">
            <!-- 遮罩层 -->
            <div
                v-if="showMask && isOpen"
                class="drawer-mask"
                @click="closeDrawer"
            />

            <!-- 抽屉内容 -->
            <div
                class="drawer-content"
                :class="{ open: isOpen }"
                :style="{ width }"
            >
                <!-- 抽屉标题 -->
                <div class="drawer-header">
                    <div class="header-content">
                        <div class="header-icon">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor" />
                                <path d="M13 7h-2v5.41l4.29 4.29 1.41-1.41-3.7-3.7V7z" fill="currentColor" />
                            </svg>
                        </div>
                        <div class="header-text">
                            <h3>房间控制</h3>
                            <span class="header-subtitle">调整您的个性化设置</span>
                        </div>
                    </div>
                    <button class="close-button" @click="closeDrawer">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
                        </svg>
                    </button>
                </div>

                <!-- 控制卡片容器 -->
                <div class="control-cards-container">
                    <CurtainControlCard />
                    <TelevisionControlCard />
                    <WeatherControlCard />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 控制按钮样式 */
.control-button {
  position: fixed;
  right: 24px;
  top: 24px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  z-index: 1050;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.4),
              inset 0 -1px 1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4),
              inset 0 1px 1px rgba(255, 255, 255, 0.4),
              inset 0 -1px 1px rgba(0, 0, 0, 0.1);
}

.btn-content:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2),
              inset 0 1px 1px rgba(255, 255, 255, 0.4),
              inset 0 -1px 1px rgba(0, 0, 0, 0.1);
  transition: transform 0.1s;
}

.btn-icon {
  flex-shrink: 0;
}

/* 抽屉样式 */
.drawer-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  pointer-events: none;
  z-index: 1100;
}

.drawer-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s;
  opacity: 1;
  pointer-events: auto;
}

.drawer-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 280px;
  background: rgba(248, 250, 252, 0.85);
  backdrop-filter: blur(16px);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15);
  transform: translateX(100%);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  pointer-events: auto;
  border-left: 1px solid rgba(255, 255, 255, 0.6);
}

.drawer-content.open {
  transform: translateX(0);
}

.drawer-header {
  padding: 24px 20px;
  position: relative;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(96, 165, 250, 0.12));
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.header-text {
  display: flex;
  flex-direction: column;
}

.header-text h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1e40af;
  letter-spacing: 0.5px;
}

.header-subtitle {
  font-size: 12px;
  color: #4b5563;
  margin-top: 2px;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  color: #1e40af;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: scale(1.05);
}

.control-cards-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 249, 255, 0.8) 100%);
}

.control-cards-container::-webkit-scrollbar {
  width: 4px;
}

.control-cards-container::-webkit-scrollbar-track {
  background: transparent;
}

.control-cards-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

/* 使控制卡片在抽屉内部充满宽度 */
.control-cards-container :deep(.control-card) {
  width: 100%;
  max-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.7);
}
</style>

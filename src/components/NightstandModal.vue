<script setup lang="ts">
defineProps<{
    visible: boolean
    activeItems: {
        eyeMask: boolean
        lamp: boolean
        melatonin: boolean
        musicPlayer: boolean
    }
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'selectItem', item: 'eyeMask' | 'lamp' | 'melatonin' | 'musicPlayer'): void
}>()

// 切换选择状态
function toggleSelection(item: 'eyeMask' | 'lamp' | 'melatonin' | 'musicPlayer') {
    emit('selectItem', item) // 通知父组件状态变化
}

// 关闭弹窗
function handleClose() {
    emit('close')
}
</script>

<template>
    <Teleport to="body">
        <div v-if="visible" class="modal-overlay" @click.self="handleClose">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>床头柜</h2>
                    <button class="close-button" @click="handleClose">
                        ×
                    </button>
                </div>

                <div class="modal-body">
                    <div class="item-grid">
                        <div
                            class="item-card"
                            :class="{ selected: activeItems.eyeMask }"
                            @click="toggleSelection('eyeMask')"
                        >
                            <div class="item-icon">
                                😴
                            </div>
                            <div class="item-name">
                                眼罩
                            </div>
                            <div class="item-description">
                                睡觉时佩戴眼罩
                            </div>
                        </div>

                        <div
                            class="item-card"
                            :class="{ selected: activeItems.lamp }"
                            @click="toggleSelection('lamp')"
                        >
                            <div class="item-icon">
                                💡
                            </div>
                            <div class="item-name">
                                台灯
                            </div>
                            <div class="item-description">
                                温暖的黄色光晕
                            </div>
                        </div>

                        <div
                            class="item-card"
                            :class="{ selected: activeItems.melatonin }"
                            @click="toggleSelection('melatonin')"
                        >
                            <div class="item-icon">
                                💊
                            </div>
                            <div class="item-name">
                                褪黑素
                            </div>
                            <div class="item-description">
                                睡眠更加沉稳
                            </div>
                        </div>

                        <div
                            class="item-card"
                            :class="{ selected: activeItems.musicPlayer }"
                            @click="toggleSelection('musicPlayer')"
                        >
                            <div class="item-icon">
                                🎵
                            </div>
                            <div class="item-name">
                                音乐播放器
                            </div>
                            <div class="item-description">
                                助眠音乐
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100000;
  backdrop-filter: blur(3px);
}

.modal-content {
  width: 310px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: modal-appear 0.3s ease-out;
  transform: translateY(0);
  transition: transform 0.2s;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 16px;
  background-color: #8B4513;
  color: white;
  position: relative;
}

.modal-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, #A0522D, #D2691E, #A0522D);
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 1px;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
  padding: 0;
  margin: 0;
  position: relative;
  overflow: hidden;
}

.close-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: scale(0);
  transition: transform 0.2s ease-out;
}

.close-button:hover::before {
  transform: scale(1);
}

.modal-body {
  padding: 16px;
  padding-bottom: 20px;
}

.item-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.item-card {
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.item-card:hover {
  background-color: #f0f0f0;
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.item-card.selected {
  border-color: #3498db;
  background-color: #e1f5fe;
}

.item-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.item-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.item-description {
  font-size: 12px;
  color: #666;
  text-align: center;
}
</style>

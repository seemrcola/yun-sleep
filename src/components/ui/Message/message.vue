<script setup lang="ts">
import { defineProps, onMounted } from 'vue'

const props = defineProps<{
  id?: string
  type: 'info' | 'success' | 'warning' | 'error'
  content: string
  duration: number
  close: () => void
}>()

// 调试信息
onMounted(() => {
  console.log('Message mounted:', props.id, props.content, props.type)
})
</script>

<template>
  <Transition name="fade">
    <div 
      class="__yun_sleep__message__" 
      :class="[`message-${type}`]"
    >
      <div class="message-icon">
        <svg v-if="type === 'info'" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor" />
        </svg>
        <svg v-if="type === 'success'" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor" />
        </svg>
        <svg v-if="type === 'warning'" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
        </svg>
        <svg v-if="type === 'error'" viewBox="0 0 24 24" width="20" height="20">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor" />
        </svg>
      </div>
      <div class="message-content">{{ content }}</div>
      <div class="message-close" @click="props.close">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
        </svg>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.__yun_sleep__message__ {
  position: fixed;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 1000;
  min-width: 280px;
  max-width: 80vw;
  border: 1px solid transparent;
}

.message-icon {
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-content {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  padding: 4px 0;
}

.message-close {
  margin-left: 12px;
  cursor: pointer;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: 20px;
  height: 20px;
}

.message-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* 信息提示样式 */
.message-info {
  background-color: #e6f4ff;
  border-left: 4px solid #1677ff;
  color: #0c53b7;
  border-color: #91caff;
}

.message-info .message-icon {
  color: #1677ff;
}

.message-info .message-close {
  color: rgba(12, 83, 183, 0.45);
}

.message-info .message-close:hover {
  color: rgba(12, 83, 183, 0.75);
}

/* 成功提示样式 */
.message-success {
  background-color: #f6ffed;
  border-left: 4px solid #52c41a;
  color: #2c7a12;
  border-color: #b7eb8f;
}

.message-success .message-icon {
  color: #52c41a;
}

.message-success .message-close {
  color: rgba(44, 122, 18, 0.45);
}

.message-success .message-close:hover {
  color: rgba(44, 122, 18, 0.75);
}

/* 警告提示样式 */
.message-warning {
  background-color: #fffbe6;
  border-left: 4px solid #faad14;
  color: #986b00;
  border-color: #ffe58f;
}

.message-warning .message-icon {
  color: #faad14;
}

.message-warning .message-close {
  color: rgba(152, 107, 0, 0.45);
}

.message-warning .message-close:hover {
  color: rgba(152, 107, 0, 0.75);
}

/* 错误提示样式 */
.message-error {
  background-color: #fff2f0;
  border-left: 4px solid #ff4d4f;
  color: #b10e0e;
  border-color: #ffccc7;
}

.message-error .message-icon {
  color: #ff4d4f;
}

.message-error .message-close {
  color: rgba(177, 14, 14, 0.45);
}

.message-error .message-close:hover {
  color: rgba(177, 14, 14, 0.75);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -30px);
}
</style>

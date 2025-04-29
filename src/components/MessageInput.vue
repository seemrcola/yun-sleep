<script setup lang="ts">
import { ref } from 'vue'

// 定义事件
const emit = defineEmits<{
    message: [text: string]
}>()

// 输入消息
const message = ref('')

// 处理键盘事件
function handleKeyDown(e: KeyboardEvent) {
    // 当按下回车键并且不按住Shift键时发送消息
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault() // 阻止默认的回车换行行为
        sendMessage()
    }
}

// 发送消息
function sendMessage() {
    // 检查消息是否为空
    if (message.value.trim() !== '') {
    // 发送消息
        emit('message', message.value)
        // 清空输入框
        message.value = ''
    }
}
</script>

<template>
    <div class="message-input-container">
        <div class="input-wrapper">
            <textarea
                v-model="message"
                class="message-input"
                placeholder="说点什么吧..."
                @keydown="handleKeyDown"
            />

            <button
                class="send-button"
                :disabled="!message.trim()"
                @click="sendMessage"
            >
                <span class="send-icon">↑</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.message-input-container {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 70%;
  max-width: 400px;
  z-index: 1000;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 255, 255, 0.1);
  border-radius: 18px;
  background: rgba(20, 20, 25, 0.75);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 5px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(100, 180, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

.message-input {
  flex: 1;
  height: 42px;
  padding: 8px 12px;
  border-radius: 15px;
  border: none;
  background: transparent;
  color: white;
  font-size: 14px;
  resize: none;
  transition: all 0.3s ease;
}

.message-input:focus {
  outline: none;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.3s ease;
}

.message-input:focus::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.send-button {
  margin-right: 5px;
  border: none;
  background: linear-gradient(135deg, #5e72eb, #4787ff);
  color: white;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(79, 114, 255, 0.5);
}

.send-button:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, #6a7ff4, #5a9bff);
  box-shadow: 0 4px 12px rgba(79, 114, 255, 0.7);
}

.send-button:active {
  transform: scale(0.95);
}

.send-button:disabled {
  background: linear-gradient(135deg, #4a5bbf, #3f6ccc);
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.send-icon {
  transform: translateY(-1px);
}

@media (max-width: 600px) {
  .message-input-container {
    width: 90%;
  }

  .message-input {
    font-size: 16px;
    padding: 12px 16px;
  }
}

/** 去掉滚动条样式 */
textarea::-webkit-scrollbar {
    display: none;
}
</style>

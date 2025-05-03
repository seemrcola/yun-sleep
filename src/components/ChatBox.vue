<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue'

// 定义消息对象类型
interface Message {
    id: number
    sender: string // 'user' | 'other' | 'bot'
    content: string
    timestamp: Date
}

defineProps({
    // 标题
    title: {
        type: String,
        default: '聊天区域',
    },
})

// 消息列表
const messages = ref<Message[]>([
    {
        id: 1,
        sender: 'bot',
        content: '欢迎来到云睡觉！',
        timestamp: new Date(),
    },
    {
        id: 2,
        sender: 'bot',
        content: '有什么问题随时可以在这里交流~',
        timestamp: new Date(),
    },
])

// 聊天容器引用
const chatContainer = ref<HTMLElement | null>(null)

// 滚动到底部
function scrollToBottom() {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTop = chatContainer.value.scrollHeight
        }
    })
}

// 添加消息的方法，暴露给父组件
function addMessage(sender: string, content: string) {
    const newMessage: Message = {
        id: Date.now(),
        sender,
        content,
        timestamp: new Date(),
    }
    messages.value.push(newMessage)
    scrollToBottom()
}

// 暴露方法给父组件
defineExpose({
    addMessage,
})

// 初始滚动到底部
onMounted(() => {
    scrollToBottom()
})
</script>

<template>
    <div class="chat-box">
        <!-- 聊天框标题 -->
        <div class="chat-header">
            <div class="header-icon">
                <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" fill="currentColor" />
                </svg>
            </div>
            <h3>{{ title }}</h3>
        </div>

        <!-- 消息容器 -->
        <div ref="chatContainer" class="messages-container">
            <div
                v-for="message in messages"
                :key="message.id"
                class="message"
                :class="message.sender"
            >
                <div class="message-content">
                    {{ message.content }}
                </div>
                <div class="message-time">
                    {{ message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chat-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(99, 102, 241, 0.08));
  border-bottom: 1px solid rgba(200, 219, 240, 0.5);
  border-radius: 12px 12px 0 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  margin-right: 10px;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
}

.chat-header h3 {
  font-size: 15px;
  font-weight: 600;
  margin: 0;
  color: #4338ca;
  letter-spacing: 0.3px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: rgba(255, 255, 255, 0.6);
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  margin-bottom: 8px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.user {
  align-self: flex-end;
}

.message.bot, .message.other {
  align-self: flex-start;
}

.message-content {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.4;
  position: relative;
  word-break: break-word;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.message.user .message-content {
  background: linear-gradient(135deg, #4f46e5, #6366f1);
  color: white;
  border-bottom-right-radius: 4px;
}

.message.bot .message-content, .message.other .message-content {
  background: rgba(255, 255, 255, 0.85);
  color: #1f2937;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.message-time {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  align-self: flex-end;
}

.message.bot .message-time, .message.other .message-time {
  align-self: flex-start;
}
</style>

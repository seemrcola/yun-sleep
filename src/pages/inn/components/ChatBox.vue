<script setup lang="ts">
import { SocketListenerEvent, socketService } from '@/service/createSocekt'
import { nextTick, onMounted, ref } from 'vue'

// 定义消息对象类型
interface Message {
    id: number
    sender: string // 'user' ｜ 'bot'
    content: string
    timestamp: Date
    username?: string
}

defineProps({
    // 标题
    title: {
        type: String,
        default: '聊天区域',
    },
})

// 消息列表
const messages = ref<Message[]>([])

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
function addMessage(msg: Partial<Message>) {
    const newMessage: Message = {
        id: Date.now(),
        username: msg.username || '',
        sender: msg.sender || 'bot',
        content: msg.content || '',
        timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }
    messages.value.push(newMessage)
    scrollToBottom()
}

// 监听消息
function setupSocketListener() {
    socketService.on(
        SocketListenerEvent.NEW_MESSAGE,
        (msg: Partial<Message>) => {
            console.log(msg, '1-1-1-1-1-')
            addMessage(msg)
        },
    )
}

// 暴露方法给父组件
defineExpose({
    addMessage,
})

// 初始滚动到底部
onMounted(() => {
    scrollToBottom()
    setupSocketListener()
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
                <!-- 所有消息的头像都在左侧显示 -->
                <div class="message-avatar">
                    <!-- Bot头像 -->
                    <div v-if="message.sender === 'bot'" class="avatar bot-avatar">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <rect x="7" y="4" width="10" height="16" rx="2" fill="currentColor" />
                            <rect x="9" y="8" width="2" height="2" rx="1" fill="white" />
                            <rect x="13" y="8" width="2" height="2" rx="1" fill="white" />
                            <rect x="9" y="13" width="6" height="2" rx="1" fill="white" />
                            <path d="M5 10V14H3V10H5Z" fill="currentColor" />
                            <path d="M21 10V14H19V10H21Z" fill="currentColor" />
                        </svg>
                    </div>
                    <!-- 用户头像 -->
                    <div v-else class="avatar user-avatar">
                        <svg viewBox="0 0 24 24" width="20" height="20">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z" fill="currentColor" />
                        </svg>
                    </div>
                </div>

                <div class="message-content-wrapper">
                    <!-- 发送者名称 -->
                    <div class="sender-name">
                        {{ message.sender === 'bot' ? 'BOT' : message.username }}
                    </div>
                    <div class="message-bubble">
                        <div class="message-content">
                            {{ message.content }}
                        </div>
                        <div class="message-time">
                            {{ message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                        </div>
                    </div>
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
  width: 100%;
  margin-bottom: 8px;
  animation: fadeIn 0.3s ease-out;
  align-items: flex-start;
}

.message-content-wrapper {
  display: flex;
  flex-direction: column;
  max-width: calc(100% - 40px);
  flex: 1;
}

.sender-name {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 2px;
  padding-left: 2px;
}

.message.user .sender-name {
  color: #ec4899;
}

.message.bot .sender-name {
  color: #3b82f6;
}

.message-bubble {
  display: flex;
  flex-direction: column;
}

.message-avatar {
  margin-top: 4px;
  margin-right: 8px;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: white;
  flex-shrink: 0;
}

.bot-avatar {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.user-avatar {
  background: linear-gradient(135deg, #ec4899, #f472b6);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
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
  background: linear-gradient(135deg, #ec4899, #f472b6);
  color: white;
  border-bottom-left-radius: 4px;
}

.message.bot .message-content {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 10px;
  color: #6b7280;
  margin-top: 4px;
  padding: 0 4px;
  align-self: flex-start;
}
</style>

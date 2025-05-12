<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import AirConditioner from '@/components/AirConditioner.vue'
import ChatBox from '@/components/ChatBox.vue'
import CurtainLayer from '@/components/layer/CurtainLayer.vue'
import WeatherLayer from '@/components/layer/WeatherLayer.vue'
import GameLayerSvg from '@/components/layer/GameLayer.vue'
import MessageInput from '@/components/MessageInput.vue'
import OperationBar from '@/components/OperationBar.vue'
import SleepTimeCard from '@/components/SleepTime.vue'
import Television from '@/components/Television.vue'
import XiaomiAi from '@/components/XiaoAi.vue'
import ControlDrawer from './components/ControlDrawer.vue'
import { socketService, SocketListenerEvent } from '@/service/createSocekt'
import { useRoute } from 'vue-router'

const route = useRoute()
const innId = route.params.id

// 应用尺寸
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 游戏尺寸（屏幕的70%）
const gameWidth = computed(() => Math.round(windowWidth.value * 0.7))
const gameHeight = computed(() => Math.round(windowHeight.value * 0.7))

// 游戏的位置 - 略微靠右
const gameLeft = computed(() => Math.round(windowWidth.value * 0.15))
const gameTop = computed(() => Math.round((windowHeight.value - gameHeight.value) / 2))

// 游戏层引用
const gameLayerRef = ref<InstanceType<typeof GameLayerSvg> | null>(null)
const controlDrawerRef = ref<InstanceType<typeof ControlDrawer> | null>(null)
const chatBoxRef = ref<InstanceType<typeof ChatBox> | null>(null)

// 灯光和拖动控制
const isLightOn = ref(true)
const bedsAreDraggable = ref(false)

// 处理消息输入
function handleMessageInput(text: string) {
    if (gameLayerRef.value) {
        // 触发游戏层中的setBubbleMessage方法
        gameLayerRef.value.setBubbleMessage(text)
    }
}

// 处理灯光切换
function toggleLight() {
    isLightOn.value = !isLightOn.value
    if (gameLayerRef.value) {
        // 调用游戏层中的toggleLight方法
        gameLayerRef.value.toggleLight()
    }
}

// 处理床位拖动状态切换
function toggleBedDraggable() {
    bedsAreDraggable.value = !bedsAreDraggable.value
    if (gameLayerRef.value) {
        // 调用游戏层中的toggleBedDraggable方法
        gameLayerRef.value.toggleBedDraggable()
    }
}

// 处理床位位置重置
function resetBedPositions() {
    if (gameLayerRef.value) {
        // 调用游戏层中的resetBedPositions方法
        gameLayerRef.value.resetBedPositions()
    }
}

// 处理聊天消息发送
function handleChatSend(message: string) {
    console.log('聊天消息:', message)
    // 这里可以添加消息处理逻辑，如发送到服务器等
}

// 处理窗口大小调整
function handleWindowResize() {
    windowWidth.value = window.innerWidth
    windowHeight.value = window.innerHeight
}

// 链接进入socket客栈
function joinSocketInn() {
    // 链接socket客栈
    socketService.joinRoom(Number(innId))
    socketService.on(SocketListenerEvent.PERSON_JOINED, (person) => {
        console.log('有人加入客栈', person)
    })
}

onMounted(() => {
    window.addEventListener('resize', handleWindowResize)
    joinSocketInn()
})

onUnmounted(() => {
    window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
    <div class="game-app" :style="{ width: '100vw', height: '100vh' }">
        <!-- 天气图层 - 在最底层但需覆盖整个页面 -->
        <WeatherLayer class="weather-container" :width="windowWidth" :height="windowHeight" />

        <div class="left-control-container">
            <!-- 操作栏 - 固定在左上角 -->
            <OperationBar
                :initial-light-on="isLightOn"
                :initial-draggable="bedsAreDraggable"
                @toggle-light="toggleLight"
                @toggle-bed-draggable="toggleBedDraggable"
                @reset-bed-positions="resetBedPositions"
            />

            <!-- 睡眠时间卡片 - 固定在页面左上角 -->
            <SleepTimeCard />

            <!-- 控制抽屉 -->
            <ControlDrawer ref="controlDrawerRef">
                <template #trigger>
                    <button class="control-button">
                        <svg class="control-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" />
                            <path d="M19.0711 12.7071L21.0711 14.7071C21.6566 15.2926 21.6566 16.2426 21.0711 16.8284L18.2426 19.6569C17.6569 20.2426 16.7069 20.2426 16.1213 19.6569L14.1213 17.6569C13.7308 17.2664 13.7308 16.6332 14.1213 16.2426C14.5118 15.8521 15.145 15.8521 15.5355 16.2426L17 17.7071L19.2426 15.4645L17.7782 14C17.3876 13.6095 17.3876 12.9763 17.7782 12.5858C18.1687 12.1953 18.8019 12.1953 19.1924 12.5858L19.0711 12.7071ZM4.92893 11.2929L2.92893 9.29289C2.34315 8.70711 2.34315 7.75711 2.92893 7.17133L5.75736 4.34289C6.34315 3.75711 7.29315 3.75711 7.87893 4.34289L9.87868 6.34264C10.2692 6.73316 10.2692 7.36633 9.87868 7.75685C9.48816 8.14738 8.85499 8.14738 8.46447 7.75685L7 6.29238L4.75736 8.53501L6.22182 9.99948C6.61235 10.39 6.61235 11.0232 6.22182 11.4137C5.8313 11.8042 5.19813 11.8042 4.80761 11.4137L4.92893 11.2929ZM12 8C11.4696 8 10.9609 8.21071 10.5858 8.58579C10.2107 8.96086 10 9.46957 10 10V10.5C10 10.7761 9.77614 11 9.5 11C9.22386 11 9 10.7761 9 10.5V10C9 9.20435 9.31607 8.44129 9.87868 7.87868C10.4413 7.31607 11.2044 7 12 7C12.7956 7 13.5587 7.31607 14.1213 7.87868C14.6839 8.44129 15 9.20435 15 10V14C15 14.7956 14.6839 15.5587 14.1213 16.1213C13.5587 16.6839 12.7956 17 12 17C11.2044 17 10.4413 16.6839 9.87868 16.1213C9.31607 15.5587 9 14.7956 9 14V13.5C9 13.2239 9.22386 13 9.5 13C9.77614 13 10 13.2239 10 13.5V14C10 14.5304 10.2107 15.0391 10.5858 15.4142C10.9609 15.7893 11.4696 16 12 16C12.5304 16 13.0391 15.7893 13.4142 15.4142C13.7893 15.0391 14 14.5304 14 14V10C14 9.46957 13.7893 8.96086 13.4142 8.58579C13.0391 8.21071 12.5304 8 12 8Z" fill="currentColor" />
                        </svg>
                        <span>控制房间</span>
                    </button>
                </template>
            </ControlDrawer>
        </div>

        <!-- 空调组件 - 固定在页面顶部中央 -->
        <AirConditioner />

        <!-- 电视机组件 - 从顶部降下 -->
        <Television :width="gameWidth * 0.8" :height="gameHeight * 0.5" />

        <div
            class="game-container" :style="{
                width: `${gameWidth}px`,
                height: `${gameHeight}px`,
                left: `${gameLeft}px`,
                top: `${gameTop}px`,
            }"
        >
            <!-- 游戏层（床和角色） -->
            <div class="game-layer-wrapper">
                <GameLayerSvg ref="gameLayerRef" :width="gameWidth * 0.75" :height="gameHeight" :bed-count="24" />

                <!-- 幕布层（位于其他所有层之上） -->
                <CurtainLayer :width="gameWidth * 0.75" :height="gameHeight" />
            </div>

            <!-- 聊天框 -->
            <div class="chat-wrapper">
                <ChatBox ref="chatBoxRef" title="聊天交流" @send="handleChatSend" />
            </div>
        </div>

        <!-- 消息输入框 -->
        <MessageInput @message="handleMessageInput" />

        <!-- 小爱同学 -->
        <XiaomiAi class="xiao-ai" />
    </div>
</template>

<style scoped>
/* 全局样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: #EFEFEF;
    /* 浅色背景 */
}

.game-app {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
}

.weather-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
}

.left-control-container {
    position: fixed;
    left: 20px;
    top: 20px;
    overflow: hidden;
    border-radius: 10px;
    z-index: 5;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.game-container {
    position: absolute;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 5;
    display: flex;
    flex-direction: row;
    gap: 6px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
}

.game-layer-wrapper {
    width: 75%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 8px 0 0 8px;
}

.chat-wrapper {
    width: 25%;
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.15);
}

/* 控制按钮样式 */
.control-button {
    border: none;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    padding: 14px 18px;
    background: #2563eb;
    border-radius: 10px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
    transition: all 0.2s ease;
}

.control-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(37, 99, 235, 0.4);
    background: #1d4ed8;
}

.control-button:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(37, 99, 235, 0.3);
}

.control-icon {
    color: white;
    transition: transform 0.2s ease;
}

.control-button:hover .control-icon {
    transform: rotate(15deg);
}

.xiao-ai {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 1000;
}
</style>

<script setup lang="ts">
import AirConditioner from '@/components/AirConditioner.vue'
import ChatBox from '@/components/ChatBox.vue'
import CurtainLayer from '@/components/layer/CurtainLayer.vue'
import GameLayerSvg from '@/components/layer/GameLayer.vue'
import WeatherLayer from '@/components/layer/WeatherLayer.vue'
import MessageInput from '@/components/MessageInput.vue'
import OperationBar from '@/components/OperationBar.vue'
import SleepTimeCard from '@/components/SleepTime.vue'
import Television from '@/components/Television.vue'
import XiaomiAi from '@/components/XiaoAi.vue'
import { computed, onMounted, ref } from 'vue'
import ControlDrawer from './components/ControlDrawer.vue'

// 应用尺寸
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 游戏尺寸（屏幕的70%）
const gameWidth = computed(() => Math.round(windowWidth.value * 0.7))
const gameHeight = computed(() => Math.round(windowHeight.value * 0.7))

// 游戏的位置 - 略微靠右
const gameLeft = computed(() => Math.round(windowWidth.value * 0.15))
const gameTop = computed(() => Math.round((windowHeight.value - gameHeight.value) / 2))

// 聊天框的尺寸和位置不再单独指定

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
onMounted(() => {
    window.addEventListener('resize', () => {
        windowWidth.value = window.innerWidth
        windowHeight.value = window.innerHeight
    })
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

<style>
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
    gap: 15px;
    padding: 0;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(5px);
}

.game-layer-wrapper {
    width: 75%;
    height: 100%;
    position: relative;
    overflow: hidden;
    border-radius: 8px;
}

.chat-wrapper {
    width: 25%;
    height: 100%;
    padding: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.15);
}

/* 左侧边栏样式 */
.left-sidebar {
    position: fixed;
    left: 20px;
    top: 100px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 900;
}

/* 控制按钮样式 */
.control-button {
    border: none;
    cursor: pointer;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 10px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    border-radius: 12px;
    color: white;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.4);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.control-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(99, 102, 241, 0.5);
    background: linear-gradient(135deg, #4338ca, #4f46e5);
}

.control-button:active {
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(99, 102, 241, 0.3);
}

.icon-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    position: relative;
    overflow: hidden;
}

.icon-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    border-radius: inherit;
}

.control-icon {
    position: relative;
    z-index: 2;
}

.xiao-ai {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 1000;
}
</style>

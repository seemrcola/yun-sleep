<script setup lang="ts">
import AirConditioner from '@/components/AirConditioner.vue'
import CurtainControlCard from '@/components/card/CurtainControlCard.vue'
import TelevisionControlCard from '@/components/card/TelevisionControlCard.vue'
import WeatherControlCard from '@/components/card/WeatherControlCard.vue'
import CurtainLayer from '@/components/layer/CurtainLayer.vue'
import GameLayerSvg from '@/components/layer/GameLayer.vue'
import WeatherLayer from '@/components/layer/WeatherLayer.vue'
import MessageInput from '@/components/MessageInput.vue'
import OperationBar from '@/components/OperationBar.vue'
import SleepTimeCard from '@/components/SleepTime.vue'
import Television from '@/components/Television.vue'
import XiaoAi from '@/components/XiaoAi.vue'
import useToken from '@/utils/token'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

// 路由
const router = useRouter()

// 应用尺寸
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// 游戏尺寸（屏幕的70%）
const gameWidth = computed(() => Math.round(windowWidth.value * 0.7))
const gameHeight = computed(() => Math.round(windowHeight.value * 0.7))

// 居中游戏的位置
const gameLeft = computed(() => Math.round((windowWidth.value - gameWidth.value) / 2))
const gameTop = computed(() => Math.round((windowHeight.value - gameHeight.value) / 2))

// 游戏层引用
const gameLayerRef = ref<InstanceType<typeof GameLayerSvg> | null>(null)

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

// 前往公共休息区
function goToPublicArea() {
    const isLoggedIn = !!useToken.getToken()
    if (isLoggedIn) {
        router.push('/room')
    }
    else {
        router.push('/login')
    }
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
        <div class="weather-container">
            <WeatherLayer :width="windowWidth" :height="windowHeight" />
        </div>

        <!-- 睡眠时间卡片 - 固定在页面左上角 -->
        <SleepTimeCard />

        <!-- 空调组件 - 固定在页面顶部中央 -->
        <AirConditioner />

        <!-- 操作栏 - 固定在左上角 -->
        <OperationBar
            :initial-light-on="isLightOn"
            :initial-draggable="bedsAreDraggable"
            @toggle-light="toggleLight"
            @toggle-bed-draggable="toggleBedDraggable"
            @reset-bed-positions="resetBedPositions"
        />

        <div class="control-container">
            <!-- 窗帘控制卡片 - 固定在右上角 -->
            <CurtainControlCard />

            <!-- 电视控制卡片 - 固定在右上角下方 -->
            <TelevisionControlCard />

            <!-- 天气控制卡片 - 固定在左上角下方 -->
            <WeatherControlCard />
        </div>

        <!-- 电视机组件 - 从顶部降下 -->
        <Television :width="gameWidth * 0.8" :height="gameHeight * 0.5" />

        <!-- 小爱同学 - 固定在右下角 -->
        <XiaoAi />

        <div
            class="game-container" :style="{
                width: `${gameWidth}px`,
                height: `${gameHeight}px`,
                left: `${gameLeft}px`,
                top: `${gameTop}px`,
            }"
        >
            <!-- 不再需要背景层，因为天气图层已经代替它 -->
            <!-- <BackgroundLayer :width="gameWidth" :height="gameHeight" /> -->

            <!-- 游戏层（床和角色） -->
            <GameLayerSvg ref="gameLayerRef" :width="gameWidth" :height="gameHeight" :bed-count="24" />

            <!-- 幕布层（位于其他所有层之上） -->
            <CurtainLayer :width="gameWidth" :height="gameHeight" />
        </div>

        <!-- 消息输入框 -->
        <MessageInput @message="handleMessageInput" />

        <!-- 前往公共休息区按钮 -->
        <button class="public-area-btn" @click="goToPublicArea">
            <div class="btn-content">
                <span class="btn-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zm-9 .7c0-1.1.9-2 2-2s2 .9 2 2h-4z" fill="currentColor" />
                    </svg>
                </span>
                <span class="btn-text">前往公共休息区</span>
                <span class="btn-arrow">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" fill="currentColor" />
                    </svg>
                </span>
            </div>
            <div class="btn-ripple" />
        </button>
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

.game-container {
    position: absolute;
    overflow: hidden;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    z-index: 5;
}

.control-container {
    position: fixed;
    top: 20px;
    right: 0;
    width: 210px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 5px;
}

/* 前往公共休息区按钮样式 */
.public-area-btn {
    position: fixed;
    bottom: 24px;
    left: 24px;
    display: flex;
    align-items: center;
    padding: 0;
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s;
    overflow: hidden;
    border-radius: 16px;
}

.btn-content {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    background: linear-gradient(135deg, #3b82f6, #60a5fa);
    color: white;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3),
                inset 0 1px 1px rgba(255, 255, 255, 0.4),
                inset 0 -1px 1px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.public-area-btn:hover .btn-content {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4),
                inset 0 1px 1px rgba(255, 255, 255, 0.4),
                inset 0 -1px 1px rgba(0, 0, 0, 0.1);
}

.public-area-btn:active .btn-content {
    transform: translateY(0) scale(0.98);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2),
                inset 0 1px 1px rgba(255, 255, 255, 0.4),
                inset 0 -1px 1px rgba(0, 0, 0, 0.1);
    transition: transform 0.1s;
}

.btn-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    padding: 6px;
    transition: all 0.3s ease;
}

.public-area-btn:hover .btn-icon {
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.3);
}

.btn-text {
    font-weight: 600;
    letter-spacing: 0.5px;
    transition: all 0.3s ease;
}

.public-area-btn:hover .btn-text {
    transform: translateX(2px);
}

.btn-arrow {
    display: flex;
    align-items: center;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    opacity: 0.8;
}

.public-area-btn:hover .btn-arrow {
    transform: translateX(4px);
    opacity: 1;
}

.btn-ripple {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%);
    transform: scale(0);
    border-radius: 16px;
    z-index: 1;
}

.public-area-btn:active .btn-ripple {
    animation: ripple-effect 0.6s ease-out;
}

@keyframes ripple-effect {
    0% {
        transform: scale(0);
        opacity: 0.6;
    }
    80% {
        transform: scale(1.8);
        opacity: 0;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

/* 给按钮添加漂浮动画 */
.public-area-btn {
    animation: float 6s ease-in-out infinite;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-6px);
    }
}

/* 使按钮在初始状态下半透明，悬停时完全不透明 */
.public-area-btn {
    opacity: 0.85;
    transition: opacity 0.3s ease;
}

.public-area-btn:hover {
    opacity: 1;
}
</style>

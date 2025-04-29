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
import { computed, onMounted, ref } from 'vue'

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
            <GameLayerSvg ref="gameLayerRef" :width="gameWidth" :height="gameHeight" />

            <!-- 幕布层（位于其他所有层之上） -->
            <CurtainLayer :width="gameWidth" :height="gameHeight" />
        </div>

        <!-- 消息输入框 -->
        <MessageInput @message="handleMessageInput" />
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
</style>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
    width?: number
    height?: number
}>()

// 电视机状态
const isVisible = ref(false)
const tvPosition = ref(-200) // 初始位置在屏幕外
const isOn = ref(false) // 电视机开关状态

// 电视机尺寸 - 调整为16:9比例
const tvWidth = computed(() => props.width || 400)
// 高度根据16:9比例计算 (宽度 / 16 * 9)
const tvHeight = computed(() => props.height || Math.round(tvWidth.value / 16 * 9))

// 频道控制
const channels = [
    { id: 1, name: '自然风光', color: '#3498db' },
    { id: 2, name: '动画世界', color: '#e74c3c' },
    { id: 3, name: '音乐频道', color: '#2ecc71' },
    { id: 4, name: '静态杂波', color: '#000000' },
]
const currentChannel = ref(0)

// 监听全局事件以控制电视机
onMounted(() => {
    window.addEventListener('turn-on-tv', handleTvShow)
    window.addEventListener('turn-off-tv', handleTvHide)
})

// 显示电视机 - 调整位置更靠下
function handleTvShow() {
    if (isVisible.value)
        return
    isVisible.value = true
    // 动画过渡到屏幕内更下方的位置
    const targetPosition = 120 // 增加距离顶部的位置
    animateTv(tvPosition.value, targetPosition)
    // 打开电视
    isOn.value = true
}

// 隐藏电视机
function handleTvHide() {
    if (!isVisible.value)
        return
    // 动画过渡到屏幕外的位置
    const targetPosition = -tvHeight.value
    animateTv(tvPosition.value, targetPosition, () => {
        isVisible.value = false
        // 关闭电视
        isOn.value = false
    })
}

// 电视机动画
function animateTv(from: number, to: number, callback?: () => void) {
    const duration = 1000 // 1秒动画
    const startTime = Date.now()

    function animate() {
        const currentTime = Date.now()
        const elapsed = currentTime - startTime

        if (elapsed < duration) {
            const progress = elapsed / duration
            // 使用缓动函数使动画更自然
            const easeProgress = 1 - (1 - progress) ** 3 // 缓出效果
            tvPosition.value = from + (to - from) * easeProgress
            requestAnimationFrame(animate)
        }
        else {
            tvPosition.value = to
            if (callback)
                callback()
        }
    }

    animate()
}

// 切换频道
function changeChannel() {
    currentChannel.value = (currentChannel.value + 1) % channels.length
}

// 开关电视
function togglePower() {
    isOn.value = !isOn.value
}
</script>

<template>
    <div
        class="television-container"
        :style="{
            width: `${tvWidth}px`,
            height: isVisible ? `${tvHeight}px` : '0px',
            top: `${tvPosition}px`,
        }"
    >
        <!-- 左侧电视挂件 -->
        <div v-if="isVisible" class="tv-mount tv-mount-left" />

        <!-- 右侧电视挂件 -->
        <div v-if="isVisible" class="tv-mount tv-mount-right" />

        <!-- 电视信号线 -->
        <div v-if="isVisible" class="tv-cable-left" />
        <div v-if="isVisible" class="tv-cable-right" />

        <!-- 电视机框架 -->
        <div class="tv-frame">
            <!-- 电视机屏幕 -->
            <div class="tv-screen" :class="{ 'tv-off': !isOn }">
                <div v-if="isOn" class="tv-content">
                    <!-- 不同频道内容 -->
                    <div v-if="currentChannel === 0" class="tv-program nature">
                        <div class="sun" />
                        <div class="cloud cloud1" />
                        <div class="cloud cloud2" />
                        <div class="mountain" />
                        <div class="tree tree1" />
                        <div class="tree tree2" />
                    </div>

                    <div v-else-if="currentChannel === 1" class="tv-program animation">
                        <div class="bounce-ball" />
                        <div class="square" />
                    </div>

                    <div v-else-if="currentChannel === 2" class="tv-program music">
                        <div class="bar bar1" />
                        <div class="bar bar2" />
                        <div class="bar bar3" />
                        <div class="bar bar4" />
                        <div class="bar bar5" />
                    </div>

                    <div v-else class="tv-program static">
                        <div class="tv-static" />
                    </div>

                    <!-- 频道信息 -->
                    <div class="tv-channel-info">
                        频道 {{ channels[currentChannel].id }}: {{ channels[currentChannel].name }}
                    </div>
                </div>
                <!-- 关机效果 -->
                <div v-if="!isOn" class="tv-off-effect">
                    <div class="tv-off-dot" />
                </div>
            </div>

            <!-- 电视机控制区域 -->
            <div class="tv-controls">
                <button class="tv-button power-button" @click="togglePower">
                    <div class="button-icon">
                        <div class="power-icon" />
                    </div>
                    <span class="button-label">电源</span>
                </button>
                <button class="tv-button channel-button" @click="changeChannel">
                    <div class="button-icon">
                        <div class="channel-icon" />
                    </div>
                    <span class="button-label">频道</span>
                </button>
                <button class="tv-button volume-button">
                    <div class="button-icon">
                        <div class="volume-icon" />
                    </div>
                    <span class="button-label">音量</span>
                </button>
            </div>

            <!-- 电视机底座 -->
            <div class="tv-stand">
                <div class="tv-stand-neck" />
                <div class="tv-stand-base" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.television-container {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  transition: height 0.5s ease;
}

/* 电视机支架 */
.tv-mount {
  position: absolute;
  width: 18px;
  height: 50px;
  background: linear-gradient(to bottom, #444, #222);
  border-radius: 3px;
  top: -48px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
  z-index: -1;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.tv-mount-left {
  left: 10%;
  transform: rotate(-8deg);
}

.tv-mount-right {
  right: 10%;
  transform: rotate(8deg);
}

/* 电视挂线 */
.tv-cable-left, .tv-cable-right {
  position: absolute;
  width: 3px;
  height: 180px;
  background: linear-gradient(to bottom, #666, #222);
  top: -180px;
  z-index: -2;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
}

.tv-cable-left {
  left: calc(10% + 7px);
  transform-origin: bottom center;
  transform: rotate(-5deg);
}

.tv-cable-right {
  right: calc(10% + 7px);
  transform-origin: bottom center;
  transform: rotate(5deg);
}

.tv-frame {
  width: 100%;
  height: 100%;
  background-color: #222;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
}

.tv-screen {
  width: calc(100% - 20px);
  height: calc(100% - 40px);
  margin: 10px;
  background-color: #000;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.tv-screen.tv-off {
  background-color: #111;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
}

.tv-content {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tv-off-effect {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tv-off-dot {
  width: 2px;
  height: 2px;
  background-color: #fff;
  border-radius: 50%;
  animation: tvOffDot 1s ease-out forwards;
}

/* 频道节目样式 */
.tv-program {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* 自然风光频道 */
.nature {
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%);
}

.sun {
  position: absolute;
  top: 20px;
  right: 40px;
  width: 40px;
  height: 40px;
  background: #FFD700;
  border-radius: 50%;
  box-shadow: 0 0 20px #FFA500;
}

.cloud {
  position: absolute;
  background: white;
  border-radius: 50px;
}

.cloud1 {
  top: 30px;
  left: 60px;
  width: 100px;
  height: 30px;
  animation: cloudMove 20s linear infinite;
}

.cloud2 {
  top: 50px;
  left: 200px;
  width: 60px;
  height: 20px;
  animation: cloudMove 15s linear infinite 5s;
}

.mountain {
  position: absolute;
  bottom: 50px;
  left: 0;
  width: 100%;
  height: 100px;
  background: linear-gradient(135deg, #6A9C78 20%, #2C3E50 80%);
  clip-path: polygon(0% 100%, 30% 20%, 50% 60%, 70% 30%, 100% 100%);
}

.tree {
  position: absolute;
  bottom: 50px;
  width: 20px;
  height: 60px;
}

.tree1 {
  left: 25%;
  background: linear-gradient(to bottom, #228B22 0%, #8B4513 80%);
  clip-path: polygon(50% 0%, 20% 40%, 30% 40%, 10% 70%, 30% 70%, 0% 100%, 100% 100%, 70% 70%, 90% 70%, 70% 40%, 80% 40%);
}

.tree2 {
  right: 30%;
  background: linear-gradient(to bottom, #228B22 0%, #8B4513 80%);
  clip-path: polygon(50% 0%, 20% 40%, 30% 40%, 10% 70%, 30% 70%, 0% 100%, 100% 100%, 70% 70%, 90% 70%, 70% 40%, 80% 40%);
}

/* 动画世界频道 */
.animation {
  background: #9C27B0;
}

.bounce-ball {
  position: absolute;
  width: 30px;
  height: 30px;
  background: #FFEB3B;
  border-radius: 50%;
  left: 30%;
  animation: bounceBall 2s ease-in-out infinite;
}

.square {
  position: absolute;
  width: 40px;
  height: 40px;
  background: #4CAF50;
  right: 30%;
  animation: rotateSquare 3s linear infinite;
}

/* 音乐频道 */
.music {
  background: #2c3e50;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.bar {
  width: 12%;
  height: 30%;
  margin: 0 2%;
  background: linear-gradient(to top, #e74c3c, #f39c12);
  border-radius: 5px 5px 0 0;
}

.bar1 { animation: barDance 0.5s ease-in-out infinite alternate; }
.bar2 { animation: barDance 0.7s ease-in-out infinite alternate 0.1s; }
.bar3 { animation: barDance 0.3s ease-in-out infinite alternate 0.2s; }
.bar4 { animation: barDance 0.8s ease-in-out infinite alternate 0.3s; }
.bar5 { animation: barDance 0.6s ease-in-out infinite alternate 0.4s; }

/* 静态频道 */
.tv-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(
    0deg,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 50%
  ),
  linear-gradient(90deg, rgba(255, 255, 255, 0.1) 50%, transparent 50%);
  background-size: 2px 2px;
  animation: tvStatic 0.2s infinite;
  opacity: 0.3;
}

.tv-channel-info {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-family: monospace;
  font-size: 14px;
  color: #fff;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  background-color: rgba(0, 0, 0, 0.5);
  padding: 3px 6px;
  border-radius: 3px;
  z-index: 5;
}

.tv-controls {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  gap: 15px;
}

.tv-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ddd;
  padding: 0;
}

.tv-button:hover {
  transform: translateY(-2px);
  color: #fff;
}

.tv-button:active {
  transform: translateY(1px);
}

.button-icon {
  width: 36px;
  height: 36px;
  background: rgba(40, 40, 40, 0.9);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3),
              inset 0 1px 1px rgba(255, 255, 255, 0.2),
              inset 0 -1px 1px rgba(0, 0, 0, 0.3);
  border: 1px solid #1a1a1a;
}

.power-button .button-icon {
  background: linear-gradient(145deg, #2c2c2c, #232323);
}

.power-button:hover .button-icon {
  background: linear-gradient(145deg, #3a3a3a, #2c2c2c);
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
}

.channel-button .button-icon {
  background: linear-gradient(145deg, #2c2c2c, #232323);
}

.channel-button:hover .button-icon {
  background: linear-gradient(145deg, #3a3a3a, #2c2c2c);
  box-shadow: 0 0 10px rgba(0, 170, 255, 0.3);
}

.volume-button .button-icon {
  background: linear-gradient(145deg, #2c2c2c, #232323);
}

.volume-button:hover .button-icon {
  background: linear-gradient(145deg, #3a3a3a, #2c2c2c);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
}

.button-label {
  font-size: 12px;
  font-weight: 500;
  margin-top: 2px;
}

/* 电源图标 */
.power-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #e74c3c;
  position: relative;
}

.power-icon:before {
  content: '';
  position: absolute;
  top: -7px;
  left: 5px;
  width: 2px;
  height: 12px;
  background-color: #e74c3c;
}

/* 频道图标 */
.channel-icon {
  width: 18px;
  height: 18px;
  position: relative;
}

.channel-icon:before,
.channel-icon:after {
  content: '';
  position: absolute;
  background-color: #3498db;
}

.channel-icon:before {
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  transform: translateY(-50%);
}

.channel-icon:after {
  top: 0;
  left: 50%;
  width: 2px;
  height: 100%;
  transform: translateX(-50%);
}

/* 音量图标 */
.volume-icon {
  width: 18px;
  height: 18px;
  position: relative;
  overflow: hidden;
}

.volume-icon:before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 3px 0 3px 6px;
  border-color: transparent transparent transparent #2ecc71;
}

.volume-icon:after {
  content: '';
  position: absolute;
  left: 8px;
  top: 3px;
  width: 9px;
  height: 9px;
  border: 2px solid #2ecc71;
  border-left: none;
  border-radius: 0 50% 50% 0;
}

.tv-stand {
  position: absolute;
  bottom: -50px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tv-stand-neck {
  width: 10px;
  height: 30px;
  background-color: #333;
}

.tv-stand-base {
  width: 100px;
  height: 10px;
  background-color: #333;
  border-radius: 5px;
}

/* 动画 */
@keyframes tvStatic {
  0% { background-position: 0 0; }
  100% { background-position: 2px 2px; }
}

@keyframes cloudMove {
  from { transform: translateX(-100px); }
  to { transform: translateX(calc(100% + 100px)); }
}

@keyframes bounceBall {
  0%, 100% { top: 70%; transform: scale(1.2, 0.8); }
  50% { top: 30%; transform: scale(0.8, 1.2); }
}

@keyframes rotateSquare {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes barDance {
  0% { height: 30%; }
  100% { height: 70%; }
}

@keyframes tvOffDot {
  0% { transform: scale(20); opacity: 0.7; }
  100% { transform: scale(0.1); opacity: 0.1; }
}
</style>

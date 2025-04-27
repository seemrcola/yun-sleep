<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

// 定义属性
defineProps({
    width: {
        type: Number,
        default: 300,
    },
    height: {
        type: Number,
        default: 100,
    },
})

// 空调状态
const isPowered = ref(false)
const isControlPanelOpen = ref(false)

// 空调设置
const temperature = ref(25)
const mode = ref('制冷') // 制冷, 制热, 抽湿, 自动
const fanSpeed = ref('中') // 低, 中, 高, 自动
const swingMode = ref(false) // 摆风模式

// 声音效果
const beepSound = ref<HTMLAudioElement | null>(null)
const windSound = ref<HTMLAudioElement | null>(null)
const isPlayingWind = ref(false)

// 吹风效果
const windParticles = ref<{
    id: number
    x: number
    y: number
    size: number
    speed: number
    opacity: number
    active: boolean
}[]>([])
const maxParticles = 20

// 模式选项
const modeOptions = ['制冷', '制热', '抽湿', '自动']
const fanSpeedOptions = ['低', '中', '高', '自动']

// 空调显示温度（计算属性）
const displayTemperature = computed(() => {
    return temperature.value.toString().padStart(2, '0')
})

// 空调状态指示灯颜色
const statusLightColor = computed(() => {
    if (!isPowered.value)
        return '#888'

    switch (mode.value) {
        case '制冷': return '#00a0e9'
        case '制热': return '#ff4500'
        case '抽湿': return '#24d396'
        case '自动': return '#ffd700'
        default: return '#00a0e9'
    }
})

// 空调风向指示器动画
const showAnimation = computed(() => isPowered.value)

// 风速强度
const fanSpeedIntensity = computed(() => {
    if (!isPowered.value)
        return 0

    switch (fanSpeed.value) {
        case '低': return 1
        case '中': return 2
        case '高': return 3
        case '自动': return 2
        default: return 0
    }
})

// 风的颜色
const windColor = computed(() => {
    if (!isPowered.value)
        return 'rgba(255, 255, 255, 0.5)'

    switch (mode.value) {
        case '制冷': return 'rgba(0, 160, 233, 0.5)'
        case '制热': return 'rgba(255, 69, 0, 0.3)'
        case '抽湿': return 'rgba(36, 211, 150, 0.3)'
        case '自动': return 'rgba(255, 215, 0, 0.3)'
        default: return 'rgba(255, 255, 255, 0.5)'
    }
})

// 初始化
onMounted(() => {
    // 创建音效元素
    createSoundEffects()

    // 初始化风粒子
    for (let i = 0; i < maxParticles; i++) {
        windParticles.value.push({
            id: i,
            x: Math.random() * 300,
            y: 80 + Math.random() * 20,
            size: 2 + Math.random() * 3,
            speed: 0.5 + Math.random() * 1.5,
            opacity: 0.1 + Math.random() * 0.4,
            active: false,
        })
    }

    // 开始风粒子动画
    requestAnimationFrame(animateWind)

    // 添加事件监听器来响应小爱同学的命令
    window.addEventListener('turn-on-ac', () => {
        console.log('接收到打开空调事件')
        if (!isPowered.value) {
            togglePower()
        }
    })

    window.addEventListener('turn-off-ac', () => {
        console.log('接收到关闭空调事件')
        if (isPowered.value) {
            togglePower()
        }
    })
})

// 创建音效
function createSoundEffects() {
    // // 蜂鸣声
    // const beep = new Audio()
    // beep.src = ''
    // beep.volume = 0
    // beepSound.value = beep

    // // 风声
    // const wind = new Audio()
    // wind.src = 'data:audio/wav;base64,UklGRiQDAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEACAAZGF0YQADAACBgIF/gn6AfIB7gn2EfYZ7iXmLeY14kHKXb5tsnGudaKFho2ClXKlZrFSvULJNtUm4RbtDvkHBP8Q9xzvKOc02zzTSMtUw2C7bLd4r4SnkKOYm6STsIu8g8h70HPca+Rj8FgAUAxEGDwkNDAoQBxMFFQMYARr/Hf0g+yL5JfYo9CnxLO0u6DHlM+E23jngNt0503XWcttv33Lkb+hw7G/wbfVr+WkAZghlBmsDcAB7/Yb6kfeX9J7xpO6q67DovOXH4tPf3dzn2vLXANUL0h3PKMw2yUPGUcNgwG+9frqQuJ+1r7LBrx2sOKlWpnWjlqCxncuazZcBlt2WApeWlo6WcJb8lBeUjJPkkkSSeZE6kbyQ75CPkeSQeJDTj3ePuI7qjWqNGI30jMuMp4yGjGaMR4wrjA6M9ovji9GLxIu3i6uLn4uTi4eLfIt0i3ONb5Wqm3KitaiOrs60w7rJwUrIZ9B20IfYl9+o5rbtvPW4/KoDpwqnEa0YsB8rJi0wKTs0RCpNJ1YkXyFoHnEbehh/FQUSBg8LDA8JEwYXAzsARPxG+VP2V/NY8FrqXORc3l7YYMJZ0VzLXsZgwWO8Zrdpt2q0bbBvq3CmcqF0nHaYeJN6jnuJfIR+gIB7gneFdYdwim2MaI5kkWCTXJVZl1aZUptHnjqhLqQhpxSq/KzlsMO0prh+vFnARMUxySfNGdEG1fHY3dzJ4LLkm+iF7G3wVfQ9+CX8DP70Adv/w/Kt9f34mPuWAIb8JAtJB9YWkxsUGokdVSJUJzcq+S0TMdQ0jTgpPAA/0kKZRllKCE23T1JSIVXsV7RaiV1WYCJj7GW1aIVrUW4ccOdyk3U+eOd6j30ygOCCh4UuiNiKgovejfeQ5JO1lnqZBJ1eoF6lRKtlsGS1TrpDvyvEEcn5zebSt9eP3FrhJeag6h/v0/O6+Ib9TgIhBfEJtA5hEykYyxygIU0g/iTnKa4uZjMzONw8YUDzRHpJ/01IUnpWkFqXXo1iaGZva15vUnM8dzB7G39hgfuJtIxHkN2TYJfKmjGexp/hou6lgql+rTKx3bSIt+a6PL6GwcrEAMgrzGDQh9Sd2KXct+DG5NTo4+zx8Pf0A/kH/QwBDgUTCRIMEBQIGP0b7x/hI9InwCuiL3Qz9DOjPihEwkiATO1PUVOJVp9ZpFyWX4hipWWbaIZrc24ncNdy/XjGgHqFLYrGjU6RzpROmLSbeJ4IoXKjyqfhp4utvbSHunG/WMQbyejNsdJt18nc+eGS40LsJPLn+L39VwJjCV8MZBIdE/8YPxvWIV8muCe9LF8yxTYKOgg/zUKUSI1M51CYVCpYt1vzXt9hkmRwZ0dq/Wy+b19yBXW3d1p63Hz/f7eCR4XWh2SKoozpjiyR6ZLjldyYz5vHnrmhoaSKp3Wqa63Tpru1XrpHvj3CAMbyyerNzNGz1Z3ZhN1r4U7lL+kT7fTwtPSA+Fj8KADlA7cHfguADzgT5RaKGiUepiFJJdQo+yuELvcx7TJlO4w+X0UKROVLh0+5U+RXCFwWYA1k5mcCapNtUHDNcs11aHgZe8l9YIAKg62FU4jfioONF5CakiiVm5fimSKcWJ51oI2ihqRypn6oEapcq6mtCK8nsDmy+LE+tF20srX0s1q1zbX/tSG2QLbGtRq2OreLt9K3CLdztwa27bYBt7O3sLeitwO41rhDuby58rknut65ZrrNula7ybsyvK28Gr18vQO+j75vvy3A6MCwwX3CQMM' // 循环风声音效
    // wind.volume = 0.2
    // wind.loop = true
    // windSound.value = wind
}

// 播放蜂鸣声
function playBeep() {
    if (beepSound.value) {
        beepSound.value.currentTime = 0
        beepSound.value.play().catch(err => console.log('无法播放音效:', err))
    }
}

// 控制风声
function controlWindSound() {
    if (!windSound.value)
        return

    if (isPowered.value && !isPlayingWind.value) {
        windSound.value.play().catch(err => console.log('无法播放风声:', err))
        isPlayingWind.value = true
    }
    else if (!isPowered.value && isPlayingWind.value) {
        windSound.value.pause()
        isPlayingWind.value = false
    }
}

// 更新风声音量
function updateWindVolume() {
    if (!windSound.value || !isPlayingWind.value)
        return

    switch (fanSpeed.value) {
        case '低':
            windSound.value.volume = 0.1
            break
        case '中':
            windSound.value.volume = 0.2
            break
        case '高':
            windSound.value.volume = 0.3
            break
        case '自动':
            windSound.value.volume = 0.2
            break
    }
}

// 风粒子动画
function animateWind() {
    if (isPowered.value) {
        const intensity = fanSpeedIntensity.value

        windParticles.value.forEach((particle) => {
            if (particle.active) {
                // 移动粒子
                particle.y += particle.speed * intensity

                // 如果粒子超出屏幕，重置位置
                if (particle.y > 300) {
                    resetParticle(particle)
                }
            }
            else if (Math.random() < 0.05 * intensity) {
                // 随机激活粒子
                particle.active = true
                particle.x = 50 + Math.random() * 200 // 空调出风口范围
                particle.y = 80
                particle.opacity = 0.1 + Math.random() * 0.4
            }
        })
    }
    else {
    // 空调关闭时，停止所有粒子
        windParticles.value.forEach((particle) => {
            particle.active = false
        })
    }

    requestAnimationFrame(animateWind)
}

// 重置粒子
function resetParticle(particle: {
    active: boolean
    y: number
}) {
    particle.active = false
    particle.y = 80
}

// 切换电源
function togglePower() {
    isPowered.value = !isPowered.value
    playBeep()

    // 如果关闭电源，同时关闭控制面板
    if (!isPowered.value) {
        isControlPanelOpen.value = false
    }

    // 控制风声
    controlWindSound()
}

// 打开/关闭控制面板
function toggleControlPanel() {
    // 只有在空调开启时才能操作控制面板
    if (isPowered.value) {
        isControlPanelOpen.value = !isControlPanelOpen.value
        playBeep()
    }
}

// 调节温度
function changeTemperature(delta: number) {
    const newTemp = temperature.value + delta
    // 温度范围限制：16-30°C
    if (newTemp >= 16 && newTemp <= 30) {
        temperature.value = newTemp
        playBeep()
    }
}

// 调节模式
function changeMode(newMode: string) {
    mode.value = newMode
    playBeep()
}

// 调节风速
function changeFanSpeed(newSpeed: string) {
    fanSpeed.value = newSpeed
    playBeep()
    updateWindVolume()
}

// 切换摆风模式
function toggleSwing() {
    swingMode.value = !swingMode.value
    playBeep()
}

// 监听风速变化
watch(fanSpeed, () => {
    updateWindVolume()
})

onUnmounted(() => {
    // 移除事件监听器
    window.removeEventListener('turn-on-ac', togglePower)
    window.removeEventListener('turn-off-ac', togglePower)
})
</script>

<template>
    <div class="air-conditioner-container">
        <!-- 空调主体 -->
        <div
            class="air-conditioner"
            :class="{ powered: isPowered }"
            @click="toggleControlPanel"
        >
            <!-- 空调外壳 -->
            <div class="ac-body">
                <!-- 空调格栅 -->
                <div class="ac-grilles">
                    <div
                        v-for="i in 8"
                        :key="`grille-${i}`"
                        class="ac-grille"
                        :class="{ swing: swingMode && isPowered }"
                        :style="{
                            animationPlayState: showAnimation ? 'running' : 'paused',
                            animationDuration: `${5 - fanSpeedIntensity * 0.5}s`,
                        }"
                    />
                </div>

                <!-- 空调显示屏 -->
                <div class="ac-display">
                    <div v-if="isPowered" class="display-content">
                        <div class="temperature">
                            {{ displayTemperature }}°C
                        </div>
                        <div class="mode-indicator">
                            {{ mode }}
                        </div>
                        <div class="fan-speed-indicator">
                            <span>风速 · {{ fanSpeed }}</span>
                            <div class="fan-level">
                                <div
                                    v-for="n in 3"
                                    :key="`fan-level-${n}`"
                                    :class="{ active: fanSpeedIntensity >= n || fanSpeed === '自动' }"
                                    class="fan-bar"
                                />
                            </div>
                        </div>
                    </div>
                    <div class="status-light" :style="{ backgroundColor: statusLightColor }" />
                </div>

                <!-- 电源按钮 -->
                <div class="power-button" @click.stop="togglePower">
                    <div class="power-icon">
                        ⏻
                    </div>
                </div>
            </div>

            <!-- 风效果 -->
            <div v-if="isPowered" class="wind-effect">
                <!-- 风粒子 -->
                <div
                    v-for="particle in windParticles"
                    v-show="particle.active"
                    :key="`particle-${particle.id}`"
                    class="wind-particle"
                    :style="{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size * 3}px`,
                        opacity: particle.opacity,
                        backgroundColor: windColor,
                    }"
                />
            </div>
        </div>

        <!-- 控制面板 (弹出层) -->
        <div
            v-if="isControlPanelOpen && isPowered"
            class="control-panel"
            @click.stop
        >
            <div class="panel-header">
                <span>空调控制</span>
                <button class="close-button" @click="isControlPanelOpen = false">
                    ×
                </button>
            </div>

            <div class="panel-body">
                <!-- 温度控制 -->
                <div class="control-section temperature-control">
                    <div class="section-header">
                        <div class="section-icon">
                            🌡️
                        </div>
                        <h3>温度调节</h3>
                    </div>
                    <div class="temp-controls">
                        <button class="temp-btn temp-down" @click="changeTemperature(-1)">
                            −
                        </button>
                        <div class="temp-display">
                            {{ displayTemperature }}°C
                        </div>
                        <button class="temp-btn temp-up" @click="changeTemperature(1)">
                            +
                        </button>
                    </div>
                    <div class="temp-slider">
                        <div class="slider-track">
                            <div class="slider-progress" :style="{ width: `${((temperature - 16) / 14) * 100}%` }" />
                        </div>
                        <div class="slider-markers">
                            <span>16°</span>
                            <span>23°</span>
                            <span>30°</span>
                        </div>
                    </div>
                </div>

                <!-- 模式选择 -->
                <div class="control-section mode-control">
                    <div class="section-header">
                        <div class="section-icon">
                            ⚙️
                        </div>
                        <h3>运行模式</h3>
                    </div>
                    <div class="mode-buttons">
                        <button
                            v-for="option in modeOptions"
                            :key="option"
                            :class="{ active: mode === option }"
                            @click="changeMode(option)"
                        >
                            <span class="mode-icon">
                                {{ option === '制冷' ? '❄️'
                                    : option === '制热' ? '🔥'
                                        : option === '抽湿' ? '💧' : '🔄' }}
                            </span>
                            <span>{{ option }}</span>
                        </button>
                    </div>
                </div>

                <!-- 风速选择 -->
                <div class="control-section fan-control">
                    <div class="section-header">
                        <div class="section-icon">
                            💨
                        </div>
                        <h3>风速设置</h3>
                    </div>
                    <div class="fan-buttons">
                        <button
                            v-for="option in fanSpeedOptions"
                            :key="option"
                            :class="{ active: fanSpeed === option }"
                            @click="changeFanSpeed(option)"
                        >
                            {{ option }}
                        </button>
                    </div>
                </div>

                <!-- 摆风模式 -->
                <div class="control-section swing-control">
                    <div class="section-header">
                        <div class="section-icon">
                            ↕️
                        </div>
                        <h3>摆风模式</h3>
                    </div>
                    <label class="switch">
                        <input type="checkbox" :checked="swingMode" @change="toggleSwing">
                        <span class="slider round" />
                    </label>
                </div>
            </div>

            <div class="panel-footer">
                <button class="power-toggle" @click="togglePower">
                    <span class="power-icon">⏻</span>
                    {{ isPowered ? '关闭电源' : '开启电源' }}
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.air-conditioner-container {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.air-conditioner {
  width: 300px;
  height: 80px;
  background: linear-gradient(to bottom, #ffffff, #f0f0f0);
  border-radius: 0 0 15px 15px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  border-top: none;
  overflow: visible;
}

.air-conditioner:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transform: translateY(2px);
}

.air-conditioner.powered {
  background: linear-gradient(to bottom, #ffffff, #f5f5f5);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2), 0 0 15px rgba(0, 160, 233, 0.3);
}

.ac-body {
  display: flex;
  height: 100%;
  position: relative;
  padding: 10px;
}

.ac-grilles {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: 60%;
  height: 100%;
  padding: 5px 0;
}

.ac-grille {
  background-color: #e0e0e0;
  height: 3px;
  margin: 2px 10px;
  border-radius: 1px;
  transition: all 0.3s ease;
  position: relative;
  transform-origin: center left;
  animation: grille-move 5s infinite alternate ease-in-out;
  animation-play-state: paused;
}

.ac-grille.swing {
  animation: grille-swing 3s infinite alternate ease-in-out;
}

@keyframes grille-move {
  0% { transform: scaleX(0.8) rotate(0deg); opacity: 0.5; }
  100% { transform: scaleX(1) rotate(3deg); opacity: 0.8; }
}

@keyframes grille-swing {
  0% { transform: scaleX(0.9) rotate(-5deg); opacity: 0.6; }
  50% { transform: scaleX(1) rotate(0deg); opacity: 0.8; }
  100% { transform: scaleX(0.9) rotate(5deg); opacity: 0.6; }
}

.ac-display {
  width: 40%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #2c2c2c, #1a1a1a);
  border-radius: 8px;
  position: relative;
  color: #fff;
  font-family: 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8), 0 0 5px rgba(255, 255, 255, 0.1);
  padding: 8px;
  overflow: hidden;
}

.ac-display::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  z-index: 1;
}

.display-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: fade-in 0.5s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.temperature {
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(0, 160, 233, 0.8);
  letter-spacing: 1px;
}

.mode-indicator {
  font-size: 10px;
  margin-top: 2px;
  color: #bbb;
  font-weight: 500;
  letter-spacing: 1px;
}

.fan-speed-indicator {
  font-size: 8px;
  margin-top: 3px;
  color: #999;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.fan-level {
  display: flex;
  gap: 3px;
  margin-top: 2px;
}

.fan-bar {
  width: 6px;
  height: 3px;
  background-color: #555;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.fan-bar.active {
  background-color: #00a0e9;
  box-shadow: 0 0 8px rgba(0, 160, 233, 0.8);
}

.status-light {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #888;
  box-shadow: 0 0 5px currentColor;
  transition: all 0.3s ease;
}

.power-button {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(to bottom, #f8f8f8, #e0e0e0);
  border: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: all 0.2s ease;
  color: #555;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.power-button:hover {
  background: linear-gradient(to bottom, #f0f0f0, #d8d8d8);
  transform: scale(1.1);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.power-icon {
  font-size: 14px;
  line-height: 1;
}

/* 风效果 */
.wind-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 300px;
  overflow: hidden;
  pointer-events: none;
}

.wind-particle {
  position: absolute;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  transform: rotate(5deg);
  pointer-events: none;
}

/* 控制面板样式 */
.control-panel {
  position: absolute;
  top: 85px;
  width: 280px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1);
  z-index: 101;
  overflow: hidden;
  animation: panel-appear 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes panel-appear {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: linear-gradient(135deg, #00a0e9, #1e88e5);
  color: white;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  padding: 0;
  min-width: 24px;
  min-height: 24px;
  box-sizing: border-box;
  line-height: 1;
}

.close-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.panel-body {
  padding: 15px;
}

.control-section {
  margin-bottom: 18px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.section-icon {
  font-size: 14px;
  margin-right: 8px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-section h3 {
  margin: 0;
  color: #333;
  font-size: 14px;
  font-weight: 600;
}

.temp-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.temp-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(to bottom, #f8f8f8, #e6e6e6);
  color: #333;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 0;
  min-width: 32px;
  min-height: 32px;
  box-sizing: border-box;
  line-height: 1;
}

.temp-btn:hover {
  background: linear-gradient(to bottom, #f0f0f0, #d8d8d8);
  transform: scale(1.05);
}

.temp-btn:active {
  transform: scale(0.95);
}

.temp-down {
  color: #00a0e9;
}

.temp-up {
  color: #ff4500;
}

.temp-display {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  width: 100px;
  text-align: center;
  font-family: 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 1px;
}

.temp-slider {
  margin-top: 8px;
  padding: 0 8px;
}

.slider-track {
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

.slider-progress {
  position: absolute;
  height: 100%;
  background: linear-gradient(to right, #00a0e9, #1e88e5);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  color: #999;
  font-size: 10px;
}

.mode-buttons, .fan-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mode-buttons button {
  flex: 1;
  min-width: calc(50% - 4px);
  padding: 8px 0;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #555;
  font-weight: 500;
  font-size: 12px;
}

.mode-icon {
  font-size: 14px;
}

.fan-buttons button {
  flex: 1;
  padding: 8px 0;
  border: 1px solid #eee;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;
  color: #555;
  font-weight: 500;
  font-size: 12px;
}

.mode-buttons button:hover, .fan-buttons button:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.mode-buttons button.active, .fan-buttons button.active {
  background: linear-gradient(135deg, #00a0e9, #1e88e5);
  color: white;
  border-color: transparent;
  box-shadow: 0 5px 15px rgba(0, 160, 233, 0.3);
}

/* 摆风模式开关 */
.swing-control {
  display: flex;
  flex-direction: column;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  margin-top: 5px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ddd;
  transition: .4s;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background: linear-gradient(135deg, #00a0e9, #1e88e5);
}

input:focus + .slider {
  box-shadow: 0 0 1px #00a0e9;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.slider.round {
  border-radius: 26px;
}

.slider.round:before {
  border-radius: 50%;
}

.panel-footer {
  padding: 12px 15px;
  display: flex;
  justify-content: center;
  background-color: #f9f9f9;
  border-top: 1px solid #f0f0f0;
}

.power-toggle {
  padding: 8px 18px;
  border-radius: 20px;
  border: none;
  background: linear-gradient(135deg, #ff4757, #ff2d3f);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 600;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 5px 15px rgba(255, 71, 87, 0.3);
}

.power-toggle:hover {
  background: linear-gradient(135deg, #ff2d3f, #ff1f33);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 71, 87, 0.4);
}

.power-toggle:active {
  transform: translateY(0);
}

.power-toggle .power-icon {
  font-size: 14px;
}
</style>

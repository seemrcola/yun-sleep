<script setup lang="ts">
import { onMounted, ref, onBeforeUnmount } from 'vue'

// 天气类型
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'storm'

// 当前天气
const currentWeather = ref<WeatherType>('sunny')

// 音频状态
const audioEnabled = ref(false)

// 天气选项
const weatherOptions = [
    { id: 'sunny', name: '晴天', icon: '☀️', sound: '/sounds/sunnySound.mp3' },
    { id: 'cloudy', name: '阴天', icon: '☁️', sound: '/sounds/cloudySound.mp3' },
    { id: 'rainy', name: '雨天', icon: '🌧️', sound: '/sounds/rainySound.mp3' },
    { id: 'storm', name: '雷雨', icon: '⛈️', sound: '/sounds/stormSound.mp3' },
]

// 音频对象
let audioPlayer: HTMLAudioElement | null = null

// 更改天气
function changeWeather(type: WeatherType) {
    if (currentWeather.value !== type) {
        console.log(`Changing weather to: ${type}`)
        currentWeather.value = type

        // 发送全局事件
        window.dispatchEvent(new CustomEvent('change-weather', {
            detail: { type },
        }))

        // 如果音频已启用，则播放对应天气的声音
        if (audioEnabled.value) {
            playWeatherSound()
        }
    }
}

// 播放天气声音
function playWeatherSound() {
    try {
        const weather = weatherOptions.find(w => w.id === currentWeather.value)
        if (!weather) return

        console.log(`开始播放${weather.name}音效`, weather.sound)

        // 如果已有音频在播放，先停止
        if (audioPlayer) {
            audioPlayer.pause()
            audioPlayer = null
        }

        // 创建并播放新的音频
        audioPlayer = new Audio()
        audioPlayer.src = weather.sound
        audioPlayer.loop = true
        audioPlayer.volume = 0.3

        // 添加错误处理
        audioPlayer.onerror = (e) => {
            console.error('音频播放失败:', e)
        }

        // 添加加载完成事件
        audioPlayer.oncanplaythrough = () => {
            console.log('音频已加载完成，开始播放')
            if (audioPlayer) {
                audioPlayer.play().catch(err => {
                    console.error('播放音频失败:', err)
                })
            }
        }

        // 尝试预加载音频
        audioPlayer.load()
    } catch (error) {
        console.error('播放天气音效时出错:', error)
    }
}

// 切换音频状态
function toggleAudio() {
    audioEnabled.value = !audioEnabled.value
    console.log(`音频状态: ${audioEnabled.value ? '开启' : '关闭'}`)

    if (audioEnabled.value) {
        playWeatherSound()
    } else if (audioPlayer) {
        audioPlayer.pause()
        audioPlayer = null
    }
}

// 在组件卸载前停止音频
onBeforeUnmount(() => {
    if (audioPlayer) {
        audioPlayer.pause()
        audioPlayer = null
    }
})

// 在组件挂载后初始化天气
onMounted(() => {
    // 初始化时发送一次事件来设置默认天气
    setTimeout(() => {
        changeWeather('sunny')
    }, 500)

    // 预加载所有音频以提高响应速度
    weatherOptions.forEach(option => {
        const audio = new Audio()
        audio.src = option.sound
        audio.preload = 'auto'
    })
})
</script>

<template>
    <div class="control-card">
        <div class="card-header theme-blue">
            <div class="card-title">
                天气控制
            </div>
            <div class="card-status">
                <span class="weather-icon">{{weatherOptions.find(w => w.id === currentWeather)?.icon}}</span>
                {{weatherOptions.find(w => w.id === currentWeather)?.name}}
            </div>
        </div>

        <div class="card-content">
            <div class="weather-options-grid">
                <div v-for="option in weatherOptions" :key="option.id" class="weather-option"
                    :class="{ active: currentWeather === option.id }" @click="changeWeather(option.id as WeatherType)">
                    <div class="option-icon">
                        {{ option.icon }}
                    </div>
                    <div class="option-name">
                        {{ option.name }}
                    </div>
                </div>
            </div>
        </div>

        <div class="audio-control">
            <button class="audio-button" :class="{ active: audioEnabled }" @click="toggleAudio">
                <span class="audio-icon">{{ audioEnabled ? '🔊' : '🔇' }}</span>
                {{ audioEnabled ? '关闭音效' : '开启音效' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.weather-options-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.weather-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 10px 5px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 1px solid #eee;
    background-color: rgba(240, 240, 240, 0.5);
    position: relative;
    overflow: hidden;
}

.weather-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: rgba(230, 230, 230, 0.8);
}

.weather-option:active {
    transform: scale(0.95);
}

.option-icon {
    font-size: 24px;
    margin-bottom: 5px;
    position: relative;
    z-index: 2;
}

.option-name {
    font-size: 12px;
    color: #444;
    font-weight: 500;
    position: relative;
    z-index: 2;
}

.weather-option.active {
    background-color: #e0f2fe;
    border-color: #7dd3fc;
    box-shadow: 0 0 8px rgba(125, 211, 252, 0.5);
}

.weather-option.active .option-name {
    color: #0284c7;
    font-weight: bold;
}

.weather-icon {
    margin-right: 4px;
}

/* 音频控制样式 */
.audio-control {
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
}

.audio-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 8px 12px;
    font-size: 12px;
    background-color: rgba(240, 240, 240, 0.8);
    border: 1px solid #ddd;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.audio-button:hover {
    background-color: rgba(230, 230, 230, 0.9);
    transform: translateY(-1px);
}

.audio-button:active {
    transform: scale(0.97);
}

.audio-icon {
    font-size: 16px;
}

.audio-button.active {
    background-color: #e1f5fe;
    border-color: #4fc3f7;
}
</style>

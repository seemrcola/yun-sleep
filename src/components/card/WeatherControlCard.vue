<script setup lang="ts">
import { onMounted, ref } from 'vue'
import './BaseCardStyles.vue'

// 天气类型
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'storm'

// 当前天气
const currentWeather = ref<WeatherType>('sunny')

// 天气选项
const weatherOptions = [
    { id: 'sunny', name: '晴天', icon: '☀️' },
    { id: 'cloudy', name: '阴天', icon: '☁️' },
    { id: 'rainy', name: '雨天', icon: '🌧️' },
    { id: 'storm', name: '雷雨', icon: '⛈️' },
]

// 更改天气
function changeWeather(type: WeatherType) {
    if (currentWeather.value !== type) {
        console.log(`Changing weather to: ${type}`)
        currentWeather.value = type

        // 发送全局事件
        window.dispatchEvent(new CustomEvent('change-weather', {
            detail: { type },
        }))
    }
}

// 在组件挂载后初始化天气
onMounted(() => {
    // 初始化时发送一次事件来设置默认天气
    setTimeout(() => {
        changeWeather('sunny')
    }, 500)
})
</script>

<template>
    <div class="control-card">
        <div class="card-header theme-blue">
            <div class="card-title">
                天气控制
            </div>
            <div class="card-status">
                <span class="weather-icon">{{ weatherOptions.find(w => w.id === currentWeather)?.icon }}</span>
                {{ weatherOptions.find(w => w.id === currentWeather)?.name }}
            </div>
        </div>

        <div class="card-content">
            <div class="weather-options-grid">
                <div
                    v-for="option in weatherOptions"
                    :key="option.id"
                    class="weather-option"
                    :class="{ active: currentWeather === option.id }"
                    @click="changeWeather(option.id as WeatherType)"
                >
                    <div class="option-icon">
                        {{ option.icon }}
                    </div>
                    <div class="option-name">
                        {{ option.name }}
                    </div>
                </div>
            </div>
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
</style>

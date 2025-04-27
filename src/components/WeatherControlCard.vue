<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 天气类型
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'storm';

// 当前天气
const currentWeather = ref<WeatherType>('sunny');

// 天气选项
const weatherOptions = [
  { id: 'sunny', name: '晴天', icon: '☀️' },
  { id: 'cloudy', name: '阴天', icon: '☁️' },
  { id: 'rainy', name: '雨天', icon: '🌧️' },
  { id: 'storm', name: '雷雨', icon: '⛈️' }
];

// 更改天气
function changeWeather(type: WeatherType) {
  if (currentWeather.value !== type) {
    console.log(`Changing weather to: ${type}`);
    currentWeather.value = type;
    
    // 发送全局事件
    window.dispatchEvent(new CustomEvent('change-weather', {
      detail: { type }
    }));
  }
}

// 在组件挂载后初始化天气
onMounted(() => {
  // 初始化时发送一次事件来设置默认天气
  setTimeout(() => {
    changeWeather('sunny');
  }, 500);
});
</script>

<template>
  <div class="weather-control-card">
    <div class="card-header">
      <div class="card-title">天气控制</div>
      <div class="current-weather">
        <span class="weather-icon">{{ weatherOptions.find(w => w.id === currentWeather)?.icon }}</span>
        {{ weatherOptions.find(w => w.id === currentWeather)?.name }}
      </div>
    </div>
    
    <div class="card-content">
      <div 
        v-for="option in weatherOptions" 
        :key="option.id"
        class="weather-option"
        :class="{ active: currentWeather === option.id }"
        @click="changeWeather(option.id as WeatherType)"
      >
        <div class="option-icon">{{ option.icon }}</div>
        <div class="option-name">{{ option.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.weather-control-card {
  position: fixed;
  top: 360px;
  right: 20px;
  width: 180px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 15px;
  font-family: sans-serif;
  backdrop-filter: blur(10px);
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.current-weather {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.weather-icon {
  font-size: 18px;
}

.card-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.weather-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
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
  background-color: #e1f5fe;
  border-color: #4fc3f7;
  animation: pulseOption 1s ease-in-out;
}

.weather-option.active::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(79, 195, 247, 0.2) 0%, rgba(225, 245, 254, 0) 70%);
  animation: ripple 1.5s linear infinite;
}

@keyframes ripple {
  0% { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes pulseOption {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.weather-option.active .option-name {
  color: #0288d1;
  font-weight: bold;
}
</style> 

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps<{
  width?: number;
  height?: number;
}>();

// 天气类型
type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'storm';

// 天气状态
const weatherType = ref<WeatherType>('sunny');

// 接收全局事件更改天气
onMounted(() => {
  console.log("Weather layer mounted, listening for events");
  
  window.addEventListener('change-weather', (e: any) => {
    if (e.detail && e.detail.type) {
      console.log(`Weather layer received event: ${e.detail.type}`);
      weatherType.value = e.detail.type as WeatherType;
    }
  });
});

// 雨滴数量
const raindropsCount = 80;
const lightningTimeout = ref<number | null>(null);
const showLightning = ref(false);

// 生成雨滴
const raindrops = Array.from({ length: raindropsCount }, (_, i) => ({
  id: i,
  x: Math.random() * 100, // 随机位置，百分比
  y: Math.random() * 100,
  size: Math.random() * 3 + 1, // 随机大小
  opacity: Math.random() * 0.4 + 0.3, // 随机透明度
  speed: Math.random() * 15 + 8, // 随机速度，调整更自然
}));

// 生成云朵
const clouds = [
  { id: 1, x: 10, y: 20, size: 60, speed: 90, opacity: 0.9 },
  { id: 2, x: 30, y: 10, size: 40, speed: 120, opacity: 0.7 },
  { id: 3, x: 60, y: 15, size: 70, speed: 100, opacity: 0.8 },
  { id: 4, x: 80, y: 25, size: 50, speed: 110, opacity: 0.6 },
  { id: 5, x: 50, y: 30, size: 45, speed: 95, opacity: 0.75 }
];

// 闪电效果
function triggerLightning() {
  if (weatherType.value === 'storm' && !showLightning.value) {
    showLightning.value = true;
    console.log("Lightning triggered!");
    
    // 闪电持续时间
    setTimeout(() => {
      showLightning.value = false;
      
      // 随机安排下一次闪电
      lightningTimeout.value = window.setTimeout(
        triggerLightning, 
        Math.random() * 8000 + 2000
      );
    }, 200);
  }
}

// 切换到暴风雨天气时自动触发闪电
watch(weatherType, (newType) => {
  console.log(`Weather changed to: ${newType}`);
  
  if (newType === 'storm') {
    if (lightningTimeout.value) {
      clearTimeout(lightningTimeout.value);
    }
    lightningTimeout.value = window.setTimeout(triggerLightning, 1000);
  } else {
    if (lightningTimeout.value) {
      clearTimeout(lightningTimeout.value);
      lightningTimeout.value = null;
    }
    showLightning.value = false;
  }
});
</script>

<template>
  <div 
    class="weather-layer"
    :style="{ 
      width: width ? `${width}px` : '100vw',
      height: height ? `${height}px` : '100vh'
    }"
    :class="weatherType"
  >
    <!-- 太阳 - 晴天 -->
    <div class="sun" v-if="weatherType === 'sunny'">
      <div class="sun-rays"></div>
    </div>
    
    <!-- 云朵 - 阴天或雨天 -->
    <div 
      v-for="cloud in clouds" 
      :key="cloud.id"
      class="cloud"
      :class="{ 'dark-cloud': weatherType === 'rainy' || weatherType === 'storm' }"
      :style="{
        left: `${cloud.x}%`,
        top: `${cloud.y}%`,
        transform: `scale(${cloud.size / 50})`,
        opacity: weatherType === 'sunny' ? 0.5 : cloud.opacity,
        animationDuration: `${cloud.speed}s`
      }"
    ></div>
    
    <!-- 雨滴 - 雨天或雷雨 -->
    <div 
      v-if="weatherType === 'rainy' || weatherType === 'storm'"
      class="rain-container"
    >
      <div 
        v-for="raindrop in raindrops" 
        :key="raindrop.id"
        class="raindrop"
        :style="{
          left: `${raindrop.x}%`,
          top: `${raindrop.y}%`,
          width: `${raindrop.size}px`,
          height: `${raindrop.size * 10}px`,
          opacity: raindrop.opacity,
          animationDuration: `${raindrop.speed / 10}s`
        }"
      ></div>
    </div>
    
    <!-- 闪电 - 雷雨 -->
    <div 
      v-if="weatherType === 'storm' && showLightning"
      class="lightning"
    ></div>
  </div>
</template>

<style scoped>
.weather-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
  transition: all 2s ease;
}

/* 天气背景色 */
.sunny {
  background: linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 100%);
}

.cloudy {
  background: linear-gradient(to bottom, #90A4AE 0%, #CFD8DC 100%);
}

.rainy {
  background: linear-gradient(to bottom, #546E7A 0%, #78909C 100%);
}

.storm {
  background: linear-gradient(to bottom, #37474F 0%, #455A64 100%);
}

/* 太阳 */
.sun {
  position: absolute;
  top: 50px;
  right: 100px;
  width: 80px;
  height: 80px;
  background: #FFC107;
  border-radius: 50%;
  box-shadow: 0 0 50px #FFC107;
  animation: rotateSun 20s linear infinite;
}

.sun-rays {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255,193,7,0) 30%, rgba(255,193,7,0.5) 100%);
  animation: pulseSun 5s ease-in-out infinite;
}

@keyframes rotateSun {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulseSun {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

/* 云朵 */
.cloud {
  position: absolute;
  width: 100px;
  height: 50px;
  background: white;
  border-radius: 50px;
  animation: floatCloud linear infinite;
  box-shadow: 
    0 0 30px rgba(255, 255, 255, 0.3),
    0 0 10px rgba(255, 255, 255, 0.5);
}

.cloud:before,
.cloud:after {
  content: '';
  position: absolute;
  background: white;
  border-radius: 50%;
}

.cloud:before {
  width: 50px;
  height: 50px;
  top: -20px;
  left: 15px;
}

.cloud:after {
  width: 60px;
  height: 60px;
  top: -30px;
  right: 15px;
}

.dark-cloud {
  background: #90A4AE;
  box-shadow: 
    0 0 30px rgba(0, 0, 0, 0.2),
    0 0 10px rgba(0, 0, 0, 0.3);
}

.dark-cloud:before,
.dark-cloud:after {
  background: #90A4AE;
}

@keyframes floatCloud {
  from { transform: translateX(-120%); }
  to { transform: translateX(calc(100vw + 120%)); }
}

/* 雨滴 */
.rain-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.raindrop {
  position: absolute;
  background: linear-gradient(to bottom, rgba(174, 213, 237, 0.5), rgba(196, 220, 235, 0.8));
  border-radius: 50% 50% 0 0;
  animation: rainFall linear infinite;
  pointer-events: none;
}

@keyframes rainFall {
  from { transform: translateY(-100px); }
  to { transform: translateY(calc(100vh + 100px)); }
}

/* 闪电 */
.lightning {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.3);
  z-index: 2;
  animation: flash 0.2s ease-out;
  pointer-events: none;
}

@keyframes flash {
  0%, 100% { opacity: 0; }
  10%, 90% { opacity: 0.3; }
  50% { opacity: 0.8; }
}
</style> 

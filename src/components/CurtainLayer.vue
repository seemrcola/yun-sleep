<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';

// Props
const props = defineProps({
  width: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  }
});

// 窗帘状态
const leftCurtainOpen = ref(true);
const rightCurtainOpen = ref(true);

// 窗帘元素引用
const leftCurtainRef = ref(null);
const rightCurtainRef = ref(null);

// 计算窗帘宽度（总宽度的一半）
const curtainWidth = computed(() => Math.round(props.width / 2));

// 光线状态
const isLightDimmed = computed(() => !leftCurtainOpen.value || !rightCurtainOpen.value);

// 直接操作DOM移动窗帘
function moveCurtains() {
  // 移动左侧窗帘
  if (leftCurtainRef.value) {
    const leftPos = leftCurtainOpen.value ? -curtainWidth.value : 0;
    leftCurtainRef.value.style.transform = `translateX(${leftPos}px)`;
  }
  
  // 移动右侧窗帘
  if (rightCurtainRef.value) {
    const rightPos = rightCurtainOpen.value ? props.width - curtainWidth.value : curtainWidth.value - curtainWidth.value;
    rightCurtainRef.value.style.transform = `translateX(${rightPos}px)`;
    console.log('右侧窗帘位置:', rightPos, '打开状态:', rightCurtainOpen.value);
  }
}

// 切换左侧窗帘
async function toggleLeftCurtain() {
  leftCurtainOpen.value = !leftCurtainOpen.value;
  await nextTick();
  moveCurtains();
}

// 切换右侧窗帘
async function toggleRightCurtain() {
  rightCurtainOpen.value = !rightCurtainOpen.value;
  await nextTick();
  moveCurtains();
}

// 紧急关闭右侧窗帘
function forceCloseRightCurtain() {
  rightCurtainOpen.value = false;
  nextTick(() => {
    if (rightCurtainRef.value) {
      rightCurtainRef.value.style.transition = 'transform 1.5s ease-in-out';
      rightCurtainRef.value.style.transform = 'translateX(0px)';
      console.log('强制关闭右侧窗帘');
    }
  });
}

// 紧急打开右侧窗帘
function forceOpenRightCurtain() {
  rightCurtainOpen.value = true;
  nextTick(() => {
    if (rightCurtainRef.value) {
      rightCurtainRef.value.style.transition = 'transform 1.5s ease-in-out';
      rightCurtainRef.value.style.transform = `translateX(${props.width - curtainWidth.value}px)`;
      console.log('强制打开右侧窗帘');
    }
  });
}

// 组件挂载时初始化
onMounted(() => {
  console.log('窗帘组件已挂载，宽度:', props.width, '半宽:', curtainWidth.value);
  
  // 确保默认窗帘都是打开的
  leftCurtainOpen.value = true;
  rightCurtainOpen.value = true;
  
  // 等待DOM更新后移动窗帘到初始位置
  nextTick(() => {
    moveCurtains();
  });
});
</script>

<template>
  <div class="curtain-container" :style="{ width: `${width}px`, height: `${height}px` }">
    <!-- 窗帘控制卡片 (屏幕右上角) -->
    <div class="curtain-controls">
      <div class="curtain-card-header">
        <span class="curtain-title">窗帘控制</span>
      </div>
      
      <div class="curtain-buttons">
        <div class="curtain-control-btn" @click.stop="toggleLeftCurtain">
          <div class="curtain-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M20 19V3H4v16H2v2h20v-2h-2zm-2 0H6V5h12v14z"/>
              <path fill="currentColor" d="M11 10h2v4h-2z"/>
            </svg>
          </div>
          <span>{{ leftCurtainOpen ? '关闭左侧' : '打开左侧' }}</span>
        </div>
        
        <div class="curtain-control-btn" @click.stop="toggleRightCurtain">
          <div class="curtain-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M20 19V3H4v16H2v2h20v-2h-2zm-2 0H6V5h12v14z"/>
              <path fill="currentColor" d="M13 10h2v4h-2z"/>
            </svg>
          </div>
          <span>{{ rightCurtainOpen ? '关闭右侧' : '打开右侧' }}</span>
        </div>
      </div>
      
      <div class="curtain-state-indicator">
        <div class="indicator-dot left" :class="{'active': leftCurtainOpen}"></div>
        <span>左侧</span>
        <div class="indicator-dot right" :class="{'active': rightCurtainOpen}"></div>
        <span>右侧</span>
      </div>
    </div>
    
    <!-- 光线变暗效果 -->
    <div class="light-dimmer" :class="{ 'dimmed': isLightDimmed }"></div>
    
    <!-- 左侧窗帘 -->
    <div ref="leftCurtainRef" class="curtain left-curtain">
      <div class="curtain-inner">
        <div class="cloud-pattern"></div>
        <div class="curtain-fold" v-for="i in 10" :key="`left-fold-${i}`" 
             :style="{ left: `${i * 10 - 5}%` }"></div>
      </div>
      <div class="curtain-pull-cord left-cord"></div>
    </div>
    
    <!-- 右侧窗帘 -->
    <div ref="rightCurtainRef" class="curtain right-curtain">
      <div class="curtain-inner">
        <div class="cloud-pattern"></div>
        <div class="curtain-fold" v-for="i in 10" :key="`right-fold-${i}`" 
             :style="{ left: `${i * 10 - 5}%` }"></div>
      </div>
      <div class="curtain-pull-cord right-cord"></div>
    </div>
    
    <!-- 窗帘杆 -->
    <div class="curtain-rod"></div>
    <div class="curtain-rod-end left-end"></div>
    <div class="curtain-rod-end right-end"></div>
  </div>
</template>

<style scoped>
.curtain-container {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10; /* 将z-index恢复为高值，使窗帘显示在所有元素之上 */
  overflow: hidden;
  pointer-events: none; /* 允许点击穿透到底层 */
}

.curtain-controls {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  pointer-events: auto;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  overflow: hidden;
  width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transform: scale(1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: float 6s infinite ease-in-out;
}

.curtain-controls:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.8);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.curtain-card-header {
  background: linear-gradient(to right, #B5985A, #D6B964);
  padding: 8px 12px;
  color: #fff;
  font-weight: bold;
  text-align: center;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.curtain-title {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.curtain-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.curtain-control-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #f9f9f9, #e9e9e9);
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.curtain-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8B4513;
}

.curtain-control-btn:hover {
  background: linear-gradient(to bottom, #fff, #f0f0f0);
  transform: translateY(-1px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.curtain-control-btn:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.curtain-state-indicator {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.05);
  font-size: 12px;
  color: #555;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 4px;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background-color: #4CAF50;
  box-shadow: 0 0 4px rgba(76, 175, 80, 0.5);
}

.indicator-dot.left.active {
  background-color: #2196F3;
  box-shadow: 0 0 4px rgba(33, 150, 243, 0.5);
}

.indicator-dot.right.active {
  background-color: #FF9800;
  box-shadow: 0 0 4px rgba(255, 152, 0, 0.5);
}

/* 光线变暗效果 */
.light-dimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 1.5s ease-in-out;
  pointer-events: none;
  z-index: 1; /* 恢复光线变暗效果的z-index */
}

.light-dimmer.dimmed {
  background-color: rgba(0, 0, 0, 0.3);
}

.curtain {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: #87CEEB; /* 天蓝色窗帘 */
  will-change: transform;
  pointer-events: auto; /* 使窗帘可点击 */
  box-shadow: inset 0 0 50px rgba(0,0,0,0.1);
  transition: transform 1.5s ease-in-out;
}

.curtain-inner {
  position: relative;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to bottom, 
    #B0E2FF 0%, 
    #87CEEB 40%, 
    #73B6E6 70%, 
    #5CACEE 100%);
  overflow: hidden;
}

/* 白云图案 */
.cloud-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 30% 20%, rgba(255,255,255,0.95) 5%, rgba(255,255,255,0.2) 15%),
    radial-gradient(circle at 70% 40%, rgba(255,255,255,0.95) 8%, rgba(255,255,255,0.2) 20%),
    radial-gradient(circle at 20% 60%, rgba(255,255,255,0.95) 6%, rgba(255,255,255,0.2) 15%),
    radial-gradient(circle at 60% 80%, rgba(255,255,255,0.95) 7%, rgba(255,255,255,0.2) 18%),
    radial-gradient(circle at 90% 10%, rgba(255,255,255,0.95) 5%, rgba(255,255,255,0.2) 15%),
    radial-gradient(circle at 10% 40%, rgba(255,255,255,0.95) 4%, rgba(255,255,255,0.2) 12%),
    radial-gradient(circle at 80% 70%, rgba(255,255,255,0.95) 6%, rgba(255,255,255,0.2) 18%);
  opacity: 0.9;
}

.curtain-fold {
  position: absolute;
  top: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, 
    rgba(255,255,255,0.5) 0%, 
    rgba(255,255,255,0.3) 50%, 
    rgba(0,0,0,0.05) 50%, 
    rgba(0,0,0,0.1) 100%);
  z-index: 3;
}

.left-curtain {
  left: 0;
  border-right: 5px solid #4A95D0; /* 深色边框 */
  transform: translateX(-50%); /* 初始位置 */
}

.right-curtain {
  right: 0;
  border-left: 5px solid #4A95D0; /* 深色边框 */
  transform: translateX(50%); /* 初始位置 */
}

.curtain-rod {
  position: absolute;
  top: 5px;
  left: 0;
  width: 100%;
  height: 12px;
  background: linear-gradient(to bottom, #B5985A, #D6B964, #B5985A);
  border-radius: 6px;
  z-index: 5;
  pointer-events: none;
}

.curtain-rod-end {
  position: absolute;
  top: -5px;
  width: 24px;
  height: 24px;
  background-color: #D6B964;
  border: 2px solid #B5985A;
  border-radius: 50%;
  z-index: 6;
  pointer-events: none;
}

.left-end {
  left: -12px;
}

.right-end {
  right: -12px;
}

.curtain-pull-cord {
  position: absolute;
  width: 4px;
  bottom: 20px;
  height: 30%;
  background-color: #FEF5E7;
  z-index: 4;
}

.left-cord {
  right: 40px;
}

.right-cord {
  left: 40px;
}

@media (max-width: 768px) {
  .curtain-control-btn {
    padding: 10px 15px;
    font-size: 14px;
    min-width: 120px;
  }
  
  .curtain-rod {
    height: 8px;
    top: 3px;
  }
  
  .curtain-rod-end {
    width: 16px;
    height: 16px;
    top: -4px;
  }
  
  .left-end {
    left: -8px;
  }
  
  .right-end {
    right: -8px;
  }
}
</style> 

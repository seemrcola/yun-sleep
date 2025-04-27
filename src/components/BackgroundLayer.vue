<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

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

// Canvas reference and context
const canvasRef = ref<HTMLCanvasElement | null>(null);
let ctx: CanvasRenderingContext2D | null = null;

// Cloud properties
interface Cloud {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

// Create clouds with different sizes and positions
const clouds: Cloud[] = [];
const cloudCount = 10;

// Animation loop
let animationFrameId: number | null = null;

// Initialize clouds
function initClouds() {
  clouds.length = 0;
  
  for (let i = 0; i < cloudCount; i++) {
    clouds.push({
      x: Math.random() * props.width,
      y: Math.random() * (props.height / 2),
      width: Math.random() * 100 + 50,
      height: Math.random() * 40 + 20,
      speed: Math.random() * 0.5 + 0.1
    });
  }
}

// Draw a single cloud
function drawCloud(cloud: Cloud) {
  if (!ctx) return;
  
  const { x, y, width, height } = cloud;
  
  ctx.fillStyle = '#ffffff';
  
  // Draw multiple circles to form a cloud
  const circleCount = Math.floor(width / 30) + 2;
  const radiusBase = height / 2;
  
  for (let i = 0; i < circleCount; i++) {
    const circleX = x + (i * (width / circleCount));
    const circleY = y;
    const radius = radiusBase * (0.7 + Math.sin(i) * 0.3);
    
    ctx.beginPath();
    ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Update cloud positions
function updateClouds() {
  clouds.forEach(cloud => {
    cloud.x += cloud.speed;
    
    // Wrap clouds around when they move off-screen
    if (cloud.x > props.width + cloud.width) {
      cloud.x = -cloud.width;
      cloud.y = Math.random() * (props.height / 2);
    }
  });
}

// Main render function
function render() {
  if (!ctx) return;
  
  // Clear canvas
  ctx.clearRect(0, 0, props.width, props.height);
  
  // Draw sky gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, props.height);
  gradient.addColorStop(0, '#87CEEB'); // Sky blue at top
  gradient.addColorStop(1, '#E0F7FA'); // Lighter blue at bottom
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, props.width, props.height);
  
  // Draw all clouds
  clouds.forEach(drawCloud);
  
  // Update cloud positions
  updateClouds();
  
  // Continue animation loop
  animationFrameId = requestAnimationFrame(render);
}

// Setup and cleanup
onMounted(() => {
  const canvas = canvasRef.value;
  if (canvas) {
    ctx = canvas.getContext('2d');
    initClouds();
    render();
  }
});

onBeforeUnmount(() => {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
  }
});
</script>

<template>
  <canvas
    ref="canvasRef"
    :width="width"
    :height="height"
    class="background-canvas"
  ></canvas>
</template>

<style scoped>
.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}
</style> 

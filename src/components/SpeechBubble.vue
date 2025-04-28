<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    message: string | null
    characterX: number
    characterY: number
    characterWidth: number
    characterHeight: number
}>()

// 控制气泡显示与否
const isVisible = computed(() => !!props.message)

// 计算气泡位置
const bubbleStyle = computed(() => {
    // 获取角色中心顶部位置
    const topCenterX = props.characterX + props.characterWidth / 2
    const topY = props.characterY - 20 // 增加顶部间距以适应新的角色尺寸

    // 计算气泡位置
    return {
        left: `${topCenterX}px`,
        top: `${topY}px`,
        transform: 'translate(-50%, -100%)', // 居中并定位在角色上方
        maxWidth: '220px', // 调整气泡最大宽度
        display: isVisible.value ? 'block' : 'none',
    }
})

// 处理气泡消息变化的动画
const bubbleClass = ref('speech-bubble')
watch(() => props.message, (newVal) => {
    if (newVal) {
    // 当有新消息时，重新触发动画
        bubbleClass.value = 'speech-bubble'
        setTimeout(() => {
            bubbleClass.value = 'speech-bubble show'
        }, 10)
    }
    else {
    // 无消息时，移除动画
        bubbleClass.value = 'speech-bubble hide'
        // 添加淡出动画效果
        setTimeout(() => {
            bubbleClass.value = 'speech-bubble'
        }, 400) // 动画持续时间
    }
}, { immediate: true })
</script>

<template>
    <div
        v-if="isVisible"
        :class="bubbleClass"
        :style="bubbleStyle"
    >
        <div class="bubble-content">
            {{ message }}
        </div>
        <div class="bubble-pointer" />
    </div>
</template>

<style scoped>
.speech-bubble {
  position: absolute;
  background: rgba(14, 22, 33, 0.6);
  border-radius: 12px;
  padding: 8px 12px;
  box-shadow: 0 3px 15px rgba(79, 172, 254, 0.4), 0 0 5px rgba(0, 242, 254, 0.5);
  border: 1px solid rgba(79, 172, 254, 0.6);
  z-index: 2000;
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.5);
  transition: all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  transform-origin: bottom center;
  pointer-events: none; /* 不参与鼠标交互 */
  backdrop-filter: blur(5px);
}

.speech-bubble.show {
  opacity: 1;
  transform: translate(-50%, -100%) scale(1);
}

.speech-bubble.hide {
  opacity: 0;
  transform: translate(-50%, -100%) scale(0.5);
}

.bubble-content {
  font-size: 14px;
  color: #ffffff;
  line-height: 1.4;
  text-align: center;
  word-break: break-word;
  min-width: 100px;
  font-weight: 500;
  text-shadow: 0 0 5px rgba(0, 242, 254, 0.3);
}

.bubble-pointer {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 12px solid rgba(14, 22, 33, 0.5);
  filter: drop-shadow(0 3px 3px rgba(79, 172, 254, 0.5));
}

.bubble-pointer:after {
  content: '';
  position: absolute;
  bottom: 1px;
  left: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 12px solid rgba(79, 172, 254, 0.1);
  z-index: -1;
  filter: blur(2px);
}
</style>

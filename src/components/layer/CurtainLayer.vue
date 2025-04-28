<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

// Props
const props = defineProps({
    width: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
})

// 窗帘状态
const leftCurtainOpen = ref(true)
const rightCurtainOpen = ref(true)

// 窗帘元素引用
const leftCurtainRef = ref<HTMLElement | null>(null)
const rightCurtainRef = ref<HTMLElement | null>(null)

// 计算窗帘宽度（总宽度的一半）
const curtainWidth = computed(() => Math.round(props.width / 2))

// 光线状态
const isLightDimmed = computed(() => !leftCurtainOpen.value || !rightCurtainOpen.value)

// 直接操作DOM移动窗帘
function moveCurtains() {
    // 移动左侧窗帘
    if (leftCurtainRef.value) {
        const leftPos = leftCurtainOpen.value ? -curtainWidth.value : 0
        leftCurtainRef.value.style.transform = `translateX(${leftPos}px)`
    }

    // 移动右侧窗帘 - 修复右侧窗帘位置计算
    if (rightCurtainRef.value) {
    // 右侧窗帘在打开状态下，移动到右边缘外侧
    // 在关闭状态下，移动到中间位置
        const rightPos = rightCurtainOpen.value ? curtainWidth.value : 0
        rightCurtainRef.value.style.transform = `translateX(${rightPos}px)`
        console.log('右侧窗帘位置:', rightPos, '打开状态:', rightCurtainOpen.value, '窗帘宽度:', curtainWidth.value)
    }
}

// 切换左侧窗帘
async function toggleLeftCurtain() {
    console.log('切换左侧窗帘')
    leftCurtainOpen.value = !leftCurtainOpen.value
    await nextTick()
    moveCurtains()
}

// 切换右侧窗帘
async function toggleRightCurtain() {
    rightCurtainOpen.value = !rightCurtainOpen.value
    await nextTick()
    moveCurtains()
}

// 窗帘状态变化时触发事件
watch(leftCurtainOpen, (newValue) => {
    window.dispatchEvent(new CustomEvent('left-curtain-state-change', {
        detail: { isOpen: newValue },
    }))
})

watch(rightCurtainOpen, (newValue) => {
    window.dispatchEvent(new CustomEvent('right-curtain-state-change', {
        detail: { isOpen: newValue },
    }))
})

// 组件挂载时初始化
onMounted(() => {
    console.log('窗帘组件已挂载，宽度:', props.width, '半宽:', curtainWidth.value)

    // 确保默认窗帘都是打开的
    leftCurtainOpen.value = true
    rightCurtainOpen.value = true

    // 等待DOM更新后移动窗帘到初始位置
    nextTick(() => {
        moveCurtains()
    })

    // 监听窗口大小变化，重新计算窗帘位置
    window.addEventListener('resize', () => {
        moveCurtains()
    })

    // 定义事件处理函数
    const handleOpenCurtains = () => {
        console.log('接收到打开窗帘事件')
        if (!leftCurtainOpen.value)
            toggleLeftCurtain()
        if (!rightCurtainOpen.value)
            toggleRightCurtain()
    }

    const handleCloseCurtains = () => {
        console.log('接收到关闭窗帘事件')
        if (leftCurtainOpen.value)
            toggleLeftCurtain()
        if (rightCurtainOpen.value)
            toggleRightCurtain()
    }

    const handleOpenLeftCurtain = () => {
        console.log('接收到打开左侧窗帘事件')
        if (!leftCurtainOpen.value)
            toggleLeftCurtain()
    }

    const handleCloseLeftCurtain = () => {
        console.log('接收到关闭左侧窗帘事件')
        if (leftCurtainOpen.value)
            toggleLeftCurtain()
    }

    const handleOpenRightCurtain = () => {
        console.log('接收到打开右侧窗帘事件')
        if (!rightCurtainOpen.value)
            toggleRightCurtain()
    }

    const handleCloseRightCurtain = () => {
        console.log('接收到关闭右侧窗帘事件')
        if (rightCurtainOpen.value)
            toggleRightCurtain()
    }

    // 添加事件监听器来响应小爱同学的命令
    window.addEventListener('open-curtains', handleOpenCurtains)
    window.addEventListener('close-curtains', handleCloseCurtains)

    // 单独控制左右窗帘的事件
    window.addEventListener('open-left-curtain', handleOpenLeftCurtain)
    window.addEventListener('close-left-curtain', handleCloseLeftCurtain)
    window.addEventListener('open-right-curtain', handleOpenRightCurtain)
    window.addEventListener('close-right-curtain', handleCloseRightCurtain);

    // 将事件处理函数添加到组件实例上，以便在卸载时移除
    (window as any).curtainHandlers = {
        handleOpenCurtains,
        handleCloseCurtains,
        handleOpenLeftCurtain,
        handleCloseLeftCurtain,
        handleOpenRightCurtain,
        handleCloseRightCurtain,
    }
})

// 组件卸载时移除事件监听器
onUnmounted(() => {
    const handlers = (window as any).curtainHandlers

    // 移除窗口大小变化监听
    window.removeEventListener('resize', moveCurtains)

    if (handlers) {
        window.removeEventListener('open-curtains', handlers.handleOpenCurtains)
        window.removeEventListener('close-curtains', handlers.handleCloseCurtains)
        window.removeEventListener('open-left-curtain', handlers.handleOpenLeftCurtain)
        window.removeEventListener('close-left-curtain', handlers.handleCloseLeftCurtain)
        window.removeEventListener('open-right-curtain', handlers.handleOpenRightCurtain)
        window.removeEventListener('close-right-curtain', handlers.handleCloseRightCurtain)

        // 清除引用
        delete (window as any).curtainHandlers
    }
})
</script>

<template>
    <div class="curtain-container" :style="{ width: `${width}px`, height: `${height}px` }">
        <!-- 光线变暗效果 -->
        <div class="light-dimmer" :class="{ dimmed: isLightDimmed }" />

        <!-- 左侧窗帘 -->
        <div ref="leftCurtainRef" class="curtain left-curtain">
            <div class="curtain-inner">
                <div class="cloud-pattern" />
                <div
                    v-for="i in 10" :key="`left-fold-${i}`" class="curtain-fold"
                    :style="{ left: `${i * 10 - 5}%` }"
                />
            </div>
            <div class="curtain-pull-cord left-cord" />
        </div>

        <!-- 右侧窗帘 -->
        <div ref="rightCurtainRef" class="curtain right-curtain">
            <div class="curtain-inner">
                <div class="cloud-pattern" />
                <div
                    v-for="i in 10" :key="`right-fold-${i}`" class="curtain-fold"
                    :style="{ left: `${i * 10 - 5}%` }"
                />
            </div>
            <div class="curtain-pull-cord right-cord" />
        </div>

        <!-- 窗帘支架 -->
        <div class="curtain-bracket left-bracket" />
        <div class="curtain-bracket right-bracket" />

        <!-- 窗帘杆 -->
        <div class="curtain-rod">
            <div class="curtain-rod-highlight" />
        </div>
        
        <!-- 窗帘杆端点 -->
        <div class="curtain-rod-end left-end">
            <div class="rod-end-inner" />
            <div class="rod-end-highlight" />
        </div>
        <div class="curtain-rod-end right-end">
            <div class="rod-end-inner" />
            <div class="rod-end-highlight" />
        </div>
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
  top: 9px;
  width: 50%;
  height: calc(100% - 9px);
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
  transform: translateX(0%); /* 修正初始位置 */
}

/* 窗帘支架 */
.curtain-bracket {
  position: absolute;
  width: 14px;
  height: 20px;
  background: linear-gradient(to right, #8B6914, #D6B964, #8B6914);
  border-radius: 0 0 7px 7px;
  top: 0;
  z-index: 4;
  pointer-events: none;
  box-shadow: 0 2px 3px rgba(0,0,0,0.2);
}

.left-bracket {
  left: 15%;
}

.right-bracket {
  right: 15%;
}

/* 窗帘杆 */
.curtain-rod {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 14px;
  background: linear-gradient(to bottom, 
    #8B4513 0%, 
    #CD853F 20%, 
    #D2B48C 50%, 
    #CD853F 80%, 
    #8B4513 100%);
  border-radius: 7px;
  z-index: 5;
  pointer-events: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.curtain-rod-highlight {
  position: absolute;
  top: 3px;
  left: 5%;
  width: 90%;
  height: 2px;
  background: linear-gradient(to right,
    rgba(255,255,255,0) 0%,
    rgba(255,255,255,0.7) 50%,
    rgba(255,255,255,0) 100%);
  border-radius: 1px;
  opacity: 0.7;
}

/* 窗帘杆端点 */
.curtain-rod-end {
  position: absolute;
  top: -8px;
  width: 30px;
  height: 30px;
  background: radial-gradient(circle at center, 
    #D4AF37 30%, 
    #B8860B 70%, 
    #8B6914 100%);
  border-radius: 50%;
  z-index: 6;
  pointer-events: none;
  box-shadow: 0 2px 5px rgba(0,0,0,0.4);
  overflow: hidden;
}

.rod-end-inner {
  position: absolute;
  top: 5px;
  left: 5px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle at center, 
    #FFD700 30%, 
    #DAA520 80%, 
    #B8860B 100%);
  border-radius: 50%;
}

.rod-end-highlight {
  position: absolute;
  top: 6px;
  left: 8px;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle at center, 
    rgba(255,255,255,0.9) 0%, 
    rgba(255,255,255,0) 80%);
  border-radius: 50%;
}

.left-end {
  left: -15px;
}

.right-end {
  right: -15px;
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

  .curtain {
    top: 7px;
    height: calc(100% - 7px);
  }

  .curtain-rod {
    height: 10px;
    top: 0;
    border-radius: 5px;
  }

  .curtain-rod-highlight {
    top: 2px;
    height: 1px;
  }

  .curtain-rod-end {
    width: 20px;
    height: 20px;
    top: -5px;
  }

  .rod-end-inner {
    top: 3px;
    left: 3px;
    width: 14px;
    height: 14px;
  }

  .rod-end-highlight {
    top: 4px;
    left: 6px;
    width: 5px;
    height: 5px;
  }

  .left-end {
    left: -10px;
  }

  .right-end {
    right: -10px;
  }

  .curtain-bracket {
    width: 10px;
    height: 16px;
    border-radius: 0 0 5px 5px;
    top: 0;
  }
}
</style>

<script setup lang="ts">
const props = defineProps<{
    id: number
    x: number
    y: number
    width: number
    height: number
    isOccupied: boolean
}>()

const emit = defineEmits<{
    (e: 'bedClicked', id: number): void
    (e: 'dragStart', id: number, event: MouseEvent | TouchEvent): void
    (e: 'dragMove', id: number, dx: number, dy: number): void
    (e: 'dragEnd', id: number): void
}>()

// 处理床的点击
function handleClick(event: MouseEvent) {
    emit('bedClicked', props.id)
    event.stopPropagation()
}

// 拖动处理
let isDragging = false
let lastX = 0
let lastY = 0

function handleMouseDown(event: MouseEvent) {
    isDragging = true
    lastX = event.clientX
    lastY = event.clientY
    emit('dragStart', props.id, event)
    event.stopPropagation()

    // 添加全局事件监听器
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(event: MouseEvent) {
    if (!isDragging)
        return

    const dx = event.clientX - lastX
    const dy = event.clientY - lastY

    lastX = event.clientX
    lastY = event.clientY

    emit('dragMove', props.id, dx, dy)
}

function handleMouseUp() {
    if (!isDragging)
        return

    isDragging = false
    emit('dragEnd', props.id)

    // 移除全局事件监听器
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
}

// 触摸事件处理器
function handleTouchStart(event: TouchEvent) {
    if (event.touches.length > 0) {
        isDragging = true
        lastX = event.touches[0].clientX
        lastY = event.touches[0].clientY
        emit('dragStart', props.id, event)
        event.stopPropagation()
        event.preventDefault()
    }
}

function handleTouchMove(event: TouchEvent) {
    if (!isDragging || event.touches.length === 0)
        return

    const dx = event.touches[0].clientX - lastX
    const dy = event.touches[0].clientY - lastY

    lastX = event.touches[0].clientX
    lastY = event.touches[0].clientY

    emit('dragMove', props.id, dx, dy)
    event.preventDefault()
}

function handleTouchEnd(event: TouchEvent) {
    if (!isDragging)
        return

    isDragging = false
    emit('dragEnd', props.id)
    event.preventDefault()
}
</script>

<template>
    <svg
        :x="x"
        :y="y"
        :width="width"
        :height="height"
        viewBox="0 0 60 90"
        class="bed"
        :class="{ 'bed-occupied': isOccupied }"
        @click="handleClick"
        @mousedown="handleMouseDown"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
    >
        <!-- 床架（外部） -->
        <rect
            x="0"
            y="0"
            width="60"
            height="90"
            rx="3"
            ry="3"
            fill="#8B4513"
            stroke="#5D4037"
            stroke-width="1.5"
        />

        <!-- 床架内部装饰边缘 -->
        <rect
            x="1.5"
            y="1.5"
            width="57"
            height="87"
            rx="2"
            ry="2"
            fill="none"
            stroke="#A0522D"
            stroke-width="0.5"
            stroke-dasharray="2,1"
        />

        <!-- 床垫 -->
        <rect
            x="3"
            y="3"
            width="54"
            height="84"
            rx="2"
            ry="2"
            fill="#F5F5DC"
            stroke="#D7CCC8"
            stroke-width="0.5"
        />

        <!-- 床垫纹理渐变 -->
        <rect
            x="3"
            y="3"
            width="54"
            height="84"
            rx="2"
            ry="2"
            fill="url(#mattress-gradient)"
            opacity="0.5"
        />

        <!-- 床垫缝线 -->
        <path
            d="M3,45 H57 M3,65 H57"
            stroke="#D7CCC8"
            stroke-width="0.7"
            stroke-dasharray="1,1"
        />

        <!-- 床垫绗缝线 -->
        <path
            d="M20,3 V87 M40,3 V87"
            stroke="#D7CCC8"
            stroke-width="0.5"
            stroke-dasharray="1,1"
        />

        <!-- 绗缝床垫图案 -->
        <g opacity="0.2">
            <path d="M10,15 L13,12 M10,25 L13,22 M10,35 L13,32 M10,55 L13,52 M10,75 L13,72" stroke="#D7CCC8" stroke-width="0.5" />
            <path d="M30,15 L33,12 M30,25 L33,22 M30,35 L33,32 M30,55 L33,52 M30,75 L33,72" stroke="#D7CCC8" stroke-width="0.5" />
            <path d="M50,15 L53,12 M50,25 L53,22 M50,35 L53,32 M50,55 L53,52 M50,75 L53,72" stroke="#D7CCC8" stroke-width="0.5" />
        </g>

        <!-- 枕头 - 俯视图带增强3D效果 -->
        <rect
            x="10"
            y="10"
            width="40"
            height="20"
            rx="3"
            ry="3"
            fill="url(#pillow-gradient)"
            stroke="#E0E0E0"
            stroke-width="0.7"
        />

        <!-- 枕头高光 -->
        <ellipse
            cx="30"
            cy="20"
            rx="18"
            ry="7"
            fill="none"
            stroke="#FFFFFF"
            stroke-width="0.5"
            opacity="0.6"
        />

        <!-- 枕头凹痕/折痕 -->
        <path
            d="M30,10 V30"
            stroke="#E0E0E0"
            stroke-width="0.5"
            stroke-dasharray="1,1"
        />

        <!-- 枕头边角阴影增加3D效果 -->
        <path
            d="M10,15 Q12,12 15,10 M50,15 Q48,12 45,10 M10,25 Q12,28 15,30 M50,25 Q48,28 45,30"
            stroke="#D0D0D0"
            stroke-width="0.3"
            fill="none"
        />

        <!-- 被子带折线 - 俯视图 -->
        <rect
            x="10"
            y="40"
            width="40"
            height="40"
            fill="url(#blanket-gradient)"
            stroke="#3F51B5"
            stroke-width="0.5"
        />

        <!-- 被子折线/折痕 - 更多细节 -->
        <path
            d="M10,50 H50 M10,55 H50 M10,60 H50 M10,65 H50 M10,70 H50 M10,75 H50"
            stroke="#3F51B5"
            stroke-width="0.4"
            stroke-opacity="0.3"
        />

        <!-- 被子上的压痕纹理 -->
        <path
            d="M13,40 C15,45 15,50 13,55 C15,60 15,65 13,70 C15,75 15,80 13,80"
            stroke="#3F51B5"
            stroke-width="0.3"
            stroke-opacity="0.4"
            fill="none"
        />
        <path
            d="M23,40 C25,45 25,50 23,55 C25,60 25,65 23,70 C25,75 25,80 23,80"
            stroke="#3F51B5"
            stroke-width="0.3"
            stroke-opacity="0.4"
            fill="none"
        />
        <path
            d="M37,40 C35,45 35,50 37,55 C35,60 35,65 37,70 C35,75 35,80 37,80"
            stroke="#3F51B5"
            stroke-width="0.3"
            stroke-opacity="0.4"
            fill="none"
        />
        <path
            d="M47,40 C45,45 45,50 47,55 C45,60 45,65 47,70 C45,75 45,80 47,80"
            stroke="#3F51B5"
            stroke-width="0.3"
            stroke-opacity="0.4"
            fill="none"
        />

        <!-- 被子边缘高光 -->
        <path
            d="M10,40 H50"
            stroke="#FFFFFF"
            stroke-width="1"
            stroke-opacity="0.5"
        />

        <!-- 被子折角 - 更丰富 -->
        <path
            d="M10,40 L15,45 M50,40 L45,45"
            stroke="#3F51B5"
            stroke-width="0.5"
            stroke-opacity="0.7"
        />
        <path
            d="M10,80 L15,75 M50,80 L45,75"
            stroke="#3F51B5"
            stroke-width="0.5"
            stroke-opacity="0.7"
        />

        <!-- 被子顶部翻折 -->
        <path
            d="M10,40 Q30,35 50,40"
            fill="url(#blanket-fold-gradient)"
            stroke="#3F51B5"
            stroke-width="0.4"
        />

        <!-- 被子纹理图案 -->
        <rect
            x="10"
            y="40"
            width="40"
            height="40"
            fill="url(#blanket-pattern)"
            opacity="0.4"
        />

        <!-- 床上有人时显示 -->
        <g v-if="isOccupied" class="sleeping-person">
            <!-- 被子下身体形状带3D效果 -->
            <ellipse
                cx="30"
                cy="60"
                rx="20"
                ry="25"
                fill="url(#body-gradient)"
                filter="url(#bump)"
                opacity="0.9"
            />

            <!-- 被子围绕身体的褶皱 - 增强版 -->
            <path
                d="M15,45 Q30,53 45,45 M12,55 Q30,68 48,55 M15,75 Q30,67 45,75"
                stroke="#3F51B5"
                stroke-width="0.5"
                fill="none"
                opacity="0.7"
            />
            <path
                d="M18,50 Q30,58 42,50 M18,65 Q30,72 42,65 M18,80 Q30,73 42,80"
                stroke="#3F51B5"
                stroke-width="0.3"
                fill="none"
                opacity="0.5"
            />

            <!-- 被子边缘的拱起细节 -->
            <path
                d="M10,42 Q20,39 30,41 Q40,39 50,42"
                stroke="#3F51B5"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />
            <path
                d="M10,78 Q20,81 30,79 Q40,81 50,78"
                stroke="#3F51B5"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />

            <!-- 被子侧边的褶皱效果 -->
            <path
                d="M10,50 Q8,55 10,60 Q8,65 10,70"
                stroke="#3F51B5"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />
            <path
                d="M50,50 Q52,55 50,60 Q52,65 50,70"
                stroke="#3F51B5"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />

            <!-- 枕头凹陷 -->
            <path
                d="M20,15 Q30,22 40,15"
                stroke="#E0E0E0"
                stroke-width="0.8"
                fill="none"
                opacity="0.8"
            />

            <!-- 枕头上的头部 - 蜡笔小新风格 -->
            <g>
                <!-- 圆形头部 -->
                <circle
                    cx="30"
                    cy="20"
                    r="12"
                    fill="#FFE0BD"
                    stroke="#000000"
                    stroke-width="0.9"
                />

                <!-- 头发 - 云朵状蓬松头发，多层次效果 -->
                <path
                    d="M18,14 C20,9 18,6 22,5 C25,4 27,4 30,4 C33,4 35,4 38,5 C42,6 40,9 42,14"
                    fill="#222222"
                    stroke="#000000"
                    stroke-width="0.8"
                    stroke-linejoin="round"
                />
                <!-- 头发内部层次 -->
                <path
                    d="M22,12 C24,8 26,7 30,7 C34,7 36,8 38,12"
                    fill="#333333"
                    stroke="none"
                />

                <!-- 小新特征：眉毛 -->
                <path
                    d="M22,16 L26,16 M34,16 L38,16"
                    stroke="#000000"
                    stroke-width="0.9"
                    stroke-linecap="round"
                    fill="none"
                />

                <!-- 小新特征：小眼睛（睡眠时是闭着的） -->
                <path
                    d="M24,18 L26,18 M34,18 L36,18"
                    stroke="#000000"
                    stroke-width="1.1"
                    stroke-linecap="round"
                    fill="none"
                />

                <!-- 小新特征：经典笑容/睡觉时的嘴 -->
                <path
                    d="M25,25 Q30,27 35,25"
                    stroke="#000000"
                    stroke-width="1"
                    fill="none"
                />

                <!-- 腮红 -->
                <circle cx="22" cy="22" r="2.5" fill="#FF9999" opacity="0.6" />
                <circle cx="38" cy="22" r="2.5" fill="#FF9999" opacity="0.6" />
            </g>

            <!-- 被子纹理增强 -->
            <g class="blanket-details">
                <!-- 几条更明显的被子褶皱 -->
                <path
                    d="M10,44 Q30,42 50,44"
                    stroke="#3F51B5"
                    stroke-width="0.4"
                    fill="none"
                    opacity="0.6"
                />
                <path
                    d="M10,52 Q25,56 50,52"
                    stroke="#3F51B5"
                    stroke-width="0.4"
                    fill="none"
                    opacity="0.6"
                />
                <path
                    d="M12,65 Q35,60 48,65"
                    stroke="#3F51B5"
                    stroke-width="0.4"
                    fill="none"
                    opacity="0.6"
                />

                <!-- 立体褶皱效果 -->
                <path
                    d="M20,45 Q25,43 30,45 Q35,43 40,45"
                    stroke="#FFFFFF"
                    stroke-width="0.3"
                    fill="none"
                    opacity="0.6"
                />
                <path
                    d="M15,58 Q20,56 25,58 Q30,56 35,58 Q40,56 45,58"
                    stroke="#FFFFFF"
                    stroke-width="0.3"
                    fill="none"
                    opacity="0.6"
                />
                <path
                    d="M20,70 Q25,72 30,70 Q35,72 40,70"
                    stroke="#FFFFFF"
                    stroke-width="0.3"
                    fill="none"
                    opacity="0.6"
                />
            </g>

            <!-- 手臂露出被子 -->
            <g class="arm-out">
                <path
                    d="M47,57 Q50,53 48,48"
                    fill="#FFE0BD"
                    stroke="#EECFBA"
                    stroke-width="0.3"
                />
                <ellipse
                    cx="48"
                    cy="48"
                    rx="2"
                    ry="1.5"
                    fill="#FFE0BD"
                    stroke="#EECFBA"
                    stroke-width="0.2"
                />
            </g>

            <!-- 带更好动画的睡眠指示符 -->
            <g class="sleep-indicators">
                <text
                    x="43"
                    y="12"
                    font-family="Arial"
                    font-size="8"
                    font-weight="bold"
                    fill="#333333"
                    class="z1"
                >Z</text>
                <text
                    x="48"
                    y="8"
                    font-family="Arial"
                    font-size="6"
                    font-weight="bold"
                    fill="#333333"
                    class="z2"
                >Z</text>
                <text
                    x="52"
                    y="4"
                    font-family="Arial"
                    font-size="4"
                    font-weight="bold"
                    fill="#333333"
                    class="z3"
                >Z</text>
            </g>
        </g>

        <!-- 床腿（四角）带3D效果 -->
        <g class="bed-legs">
            <circle cx="6" cy="6" r="2.5" fill="url(#leg-gradient)" />
            <circle cx="54" cy="6" r="2.5" fill="url(#leg-gradient)" />
            <circle cx="6" cy="84" r="2.5" fill="url(#leg-gradient)" />
            <circle cx="54" cy="84" r="2.5" fill="url(#leg-gradient)" />

            <!-- 床腿阴影 -->
            <ellipse cx="6" cy="87" rx="2" ry="0.7" fill="rgba(0,0,0,0.2)" />
            <ellipse cx="54" cy="87" rx="2" ry="0.7" fill="rgba(0,0,0,0.2)" />
            <ellipse cx="6" cy="9" rx="2" ry="0.7" fill="rgba(0,0,0,0.1)" transform="rotate(-180 6 9)" />
            <ellipse cx="54" cy="9" rx="2" ry="0.7" fill="rgba(0,0,0,0.1)" transform="rotate(-180 54 9)" />
        </g>

        <!-- 视觉效果的滤镜和图案 -->
        <defs>
            <!-- 床垫渐变 -->
            <linearGradient id="mattress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F5F5DC" />
                <stop offset="50%" stop-color="#FFFFFF" />
                <stop offset="100%" stop-color="#F5F5DC" />
            </linearGradient>

            <!-- 枕头渐变 -->
            <linearGradient id="pillow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" />
                <stop offset="50%" stop-color="#F8F8F8" />
                <stop offset="100%" stop-color="#F0F0F0" />
            </linearGradient>

            <!-- 被子渐变 - 改进版 -->
            <linearGradient id="blanket-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#6082E6" />
                <stop offset="40%" stop-color="#4169E1" />
                <stop offset="100%" stop-color="#385DC7" />
            </linearGradient>

            <!-- 被子翻折渐变 -->
            <linearGradient id="blanket-fold-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#7C9CF2" />
                <stop offset="100%" stop-color="#6082E6" />
            </linearGradient>

            <!-- 身体渐变 - 改进版 -->
            <radialGradient id="body-gradient" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                <stop offset="0%" stop-color="#7090EB" />
                <stop offset="70%" stop-color="#4169E1" />
                <stop offset="100%" stop-color="#385DC7" />
            </radialGradient>

            <!-- 床腿渐变 -->
            <radialGradient id="leg-gradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
                <stop offset="0%" stop-color="#8B4513" />
                <stop offset="100%" stop-color="#5D4037" />
            </radialGradient>

            <!-- 睡觉人物的3D效果凸起滤镜 - 增强版 -->
            <filter id="bump" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
                <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
                <feFlood flood-color="#3F51B5" flood-opacity="0.4" result="color" />
                <feComposite in="color" in2="offsetBlur" operator="in" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>

            <!-- 被子图案 - 改进版 -->
            <pattern id="blanket-pattern" patternUnits="userSpaceOnUse" width="10" height="10">
                <path
                    d="M0,5 L10,5 M5,0 L5,10"
                    stroke="#3F51B5"
                    stroke-width="0.2"
                    stroke-opacity="0.3"
                />
                <path
                    d="M2.5,2.5 L7.5,7.5 M7.5,2.5 L2.5,7.5"
                    stroke="#3F51B5"
                    stroke-width="0.1"
                    stroke-opacity="0.2"
                />
                <!-- 小圆点图案 -->
                <circle cx="2.5" cy="2.5" r="0.5" fill="#3F51B5" fill-opacity="0.2" />
                <circle cx="7.5" cy="7.5" r="0.5" fill="#3F51B5" fill-opacity="0.2" />
                <circle cx="2.5" cy="7.5" r="0.5" fill="#3F51B5" fill-opacity="0.2" />
                <circle cx="7.5" cy="2.5" r="0.5" fill="#3F51B5" fill-opacity="0.2" />
            </pattern>
        </defs>
    </svg>
</template>

<style scoped>
.bed {
  cursor: move;
  transition: filter 0.2s ease;
  filter: drop-shadow(2px 4px 3px rgba(0, 0, 0, 0.3));
}

.bed:hover {
  filter: brightness(1.05) drop-shadow(3px 5px 5px rgba(0, 0, 0, 0.4));
}

.bed-occupied {
  cursor: pointer;
}

.sleeping-person {
  animation: breathe 4s infinite ease-in-out;
}

.bed-legs {
  filter: drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.3));
}

.z1 {
  animation: float 1.5s infinite ease-in-out;
}

.z2 {
  animation: float 1.5s infinite ease-in-out;
  animation-delay: 0.2s;
}

.z3 {
  animation: float 1.5s infinite ease-in-out;
  animation-delay: 0.4s;
}

/* 添加轻微摇摆动画 */
.arm-out {
  transform-origin: 48px 48px;
  animation: armMove 8s infinite ease-in-out;
}

.blanket-details {
  animation: blanketShift 6s infinite ease-in-out, blanketWave 10s infinite ease-in-out;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes armMove {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(-2deg); }
}

@keyframes blanketShift {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(0.5px); }
}

@keyframes blanketWave {
  0%, 100% { transform: scaleY(1); }
  30% { transform: scaleY(1.005) scaleX(0.998); }
  70% { transform: scaleY(0.998) scaleX(1.002); }
}

@keyframes float {
  0% { opacity: 0; transform: translateY(0) scale(0.8); }
  50% { opacity: 1; transform: translateY(-3px) scale(1); }
  100% { opacity: 0; transform: translateY(-8px) scale(1.2); }
}
</style>

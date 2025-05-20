<script setup lang="ts">
const props = defineProps<{
    id: number
    x: number
    y: number
    width: number
    height: number
    isOccupied: boolean
    isDraggable?: boolean
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
    if (!props.isDraggable)
        return

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
    if (!props.isDraggable)
        return

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
        :class="{
            'bed-occupied': isOccupied,
            'bed-draggable': isDraggable,
        }"
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
        
        <!-- 移除床垫虚线 -->
        
        <!-- 添加浅蓝色枕头 -->
        <rect
            x="10"
            y="10"
            width="40"
            height="20"
            rx="3"
            ry="3"
            fill="url(#light-blue-pillow-gradient)"
            stroke="#A8D8F0"
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
            stroke="#A8D8F0"
            stroke-width="0.5"
            stroke-dasharray="1,1"
        />

        <!-- 枕头边角阴影增加3D效果 -->
        <path
            d="M10,15 Q12,12 15,10 M50,15 Q48,12 45,10 M10,25 Q12,28 15,30 M50,25 Q48,28 45,30"
            stroke="#87CEEB"
            stroke-width="0.3"
            fill="none"
        />
        
        <!-- 无人睡觉时显示叠好的淡黄色被子在左下角 -->
        <g v-if="!isOccupied" class="folded-blanket">
            <!-- 叠好的被子 - 正方形，更大尺寸放在床中间 -->
            <rect
                x="10"
                y="40"
                width="40"
                height="40"
                rx="3"
                ry="3"
                fill="url(#yellow-blanket-gradient)"
                stroke="#D4B957"
                stroke-width="0.5"
            />

            <!-- 被子上的对折线 -->
            <path
                d="M10,50 H50 M10,60 H50 M10,70 H50"
                stroke="#D4B957"
                stroke-width="0.5"
                opacity="0.7"
            />

            <!-- 被子厚度表现 - 叠层效果 -->
            <rect
                x="12"
                y="40"
                width="36"
                height="8"
                rx="2"
                ry="2"
                fill="url(#yellow-blanket-fold)"
                stroke="#D4B957"
                stroke-width="0.3"
            />
            <rect
                x="12"
                y="48"
                width="36"
                height="8"
                rx="2"
                ry="2"
                fill="url(#yellow-blanket-fold)"
                stroke="#D4B957"
                stroke-width="0.3"
            />
            <rect
                x="12"
                y="56"
                width="36"
                height="8"
                rx="2"
                ry="2"
                fill="url(#yellow-blanket-fold)"
                stroke="#D4B957"
                stroke-width="0.3"
            />

            <!-- 被子立体感 -->
            <path
                d="M10,40 Q30,38 50,40 M10,48 Q30,46 50,48 M10,56 Q30,54 50,56"
                stroke="#FFFFFF"
                stroke-width="0.4"
                opacity="0.6"
                fill="none"
            />

            <!-- 被子边缘阴影 -->
            <path
                d="M10,40 L10,80 M50,40 L50,80"
                stroke="#D4B957"
                stroke-width="0.6"
                opacity="0.8"
            />
        </g>

        <!-- 有人睡觉时显示 -->
        <g v-if="isOccupied" class="sleeping-person">
            <!-- 移除下半身形状 -->

            <!-- 淡黄色被子 - 展开盖住身体，更大的尺寸 -->
            <rect
                x="5"
                y="30"
                width="50"
                height="55"
                fill="url(#yellow-blanket-gradient)"
                stroke="#D4B957"
                stroke-width="0.5"
            />

            <!-- 被子褶皱和纹理 -->
            <path
                d="M5,40 H55 M5,50 H55 M5,60 H55 M5,70 H55 M5,80 H55"
                stroke="#D4B957"
                stroke-width="0.4"
                stroke-opacity="0.5"
            />

            <!-- 被子围绕身体的褶皱 -->
            <path
                d="M10,35 Q30,43 50,35 M8,55 Q30,68 52,55 M10,75 Q30,67 50,75"
                stroke="#D4B957"
                stroke-width="0.5"
                fill="none"
                opacity="0.7"
            />
            <path
                d="M15,45 Q30,50 45,45 M15,65 Q30,72 45,65 M15,80 Q30,73 45,80"
                stroke="#D4B957"
                stroke-width="0.3"
                fill="none"
                opacity="0.5"
            />

            <!-- 被子边缘的拱起细节 -->
            <path
                d="M5,32 Q15,29 30,31 Q45,29 55,32"
                stroke="#D4B957"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />
            <path
                d="M5,83 Q15,85 30,84 Q45,85 55,83"
                stroke="#D4B957"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />

            <!-- 被子侧边的褶皱效果 -->
            <path
                d="M5,50 Q3,55 5,60 Q3,65 5,70"
                stroke="#D4B957"
                stroke-width="0.4"
                fill="none"
                opacity="0.7"
            />
            <path
                d="M55,50 Q57,55 55,60 Q57,65 55,70"
                stroke="#D4B957"
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
                    d="M5,38 Q30,36 55,38"
                    stroke="#D4B957"
                    stroke-width="0.4"
                    fill="none"
                    opacity="0.6"
                />
                <path
                    d="M5,52 Q25,56 55,52"
                    stroke="#D4B957"
                    stroke-width="0.4"
                    fill="none"
                    opacity="0.6"
                />
                <path
                    d="M7,65 Q35,60 53,65"
                    stroke="#D4B957"
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
                    d="M47,37 Q50,33 48,28"
                    fill="#FFE0BD"
                    stroke="#EECFBA"
                    stroke-width="0.3"
                />
                <ellipse
                    cx="48"
                    cy="28"
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

        <!-- 视觉效果的滤镜和图案 -->
        <defs>
            <!-- 床垫渐变 -->
            <linearGradient id="mattress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F5F5DC" />
                <stop offset="50%" stop-color="#FFFFFF" />
                <stop offset="100%" stop-color="#F5F5DC" />
            </linearGradient>

            <!-- 浅蓝色枕头渐变 -->
            <linearGradient id="light-blue-pillow-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#D6F5FF" />
                <stop offset="50%" stop-color="#B0E2FF" />
                <stop offset="100%" stop-color="#87CEEB" />
            </linearGradient>
            
            <!-- 淡黄色被子渐变 -->
            <linearGradient id="yellow-blanket-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF9C4" />
                <stop offset="40%" stop-color="#FFF176" />
                <stop offset="100%" stop-color="#FFEE58" />
            </linearGradient>
            
            <!-- 被子叠层渐变 -->
            <linearGradient id="yellow-blanket-fold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FFF9C4" />
                <stop offset="40%" stop-color="#FFF59D" />
                <stop offset="100%" stop-color="#FFF176" />
            </linearGradient>

            <!-- 身体渐变 - 改为淡黄色系统 -->
            <radialGradient id="body-gradient" cx="50%" cy="50%" r="50%" fx="40%" fy="40%">
                <stop offset="0%" stop-color="#FFF9C4" />
                <stop offset="70%" stop-color="#FFF176" />
                <stop offset="100%" stop-color="#FFE57F" />
            </radialGradient>

            <!-- 睡觉人物的3D效果凸起滤镜 - 增强版 -->
            <filter id="bump" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
                <feOffset in="blur" dx="0" dy="2" result="offsetBlur" />
                <feFlood flood-color="#FFE082" flood-opacity="0.4" result="color" />
                <feComposite in="color" in2="offsetBlur" operator="in" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
    </svg>
</template>

<style scoped>
.bed {
    cursor: pointer;
    transition: transform 0.2s, filter 0.2s;
}

.bed:hover {
    transform: scale(1.02);
}

.bed-occupied {
    filter: drop-shadow(0 0 8px rgba(46, 204, 113, 0.6));
}

.bed-draggable {
    cursor: move;
}

.bed-draggable:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 0 10px rgba(66, 139, 202, 0.6));
}

.sleeping-person {
    animation: breathe 4s infinite ease-in-out;
}

.folded-blanket {
    filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1));
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

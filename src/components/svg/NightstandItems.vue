<script setup lang="ts">
defineProps<{
    x: number
    y: number
    bedWidth: number
    bedHeight: number
    showEyeMask: boolean
    showLamp: boolean
    showMusicNotes: boolean
}>()
</script>

<template>
    <g>
        <!-- 台灯 -->
        <g v-if="showLamp" class="lamp">
            <!-- 灯座 -->
            <rect
                :x="x + bedWidth + 5"
                :y="y + 15"
                width="18"
                height="6"
                rx="2"
                fill="#8B4513"
                stroke="#5D4037"
                stroke-width="0.5"
            />
            <!-- 灯杆 -->
            <rect
                :x="x + bedWidth + 11.5"
                :y="y - 7"
                width="5"
                height="22"
                fill="#A0522D"
                stroke="#8B4513"
                stroke-width="0.5"
            />
            <!-- 灯罩 -->
            <path
                :d="`M${x + bedWidth} ${y - 7}
                    L${x + bedWidth + 28} ${y - 7}
                    L${x + bedWidth + 22} ${y - 20}
                    L${x + bedWidth + 6} ${y - 20} Z`"
                fill="#F5DEB3"
                stroke="#D2B48C"
                stroke-width="0.5"
            />

            <!-- 外层光晕 -->
            <circle
                :cx="x + bedWidth + 14"
                :cy="y - 12"
                r="30"
                fill="rgba(255, 223, 80, 0.1)"
            >
                <animate
                    attributeName="opacity"
                    values="0.1;0.25;0.1"
                    dur="4s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="r"
                    values="30;32;30"
                    dur="4s"
                    repeatCount="indefinite"
                />
            </circle>

            <!-- 中层光晕 -->
            <circle
                :cx="x + bedWidth + 14"
                :cy="y - 12"
                r="20"
                fill="rgba(255, 215, 0, 0.25)"
            >
                <animate
                    attributeName="opacity"
                    values="0.25;0.4;0.25"
                    dur="3s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="r"
                    values="20;22;20"
                    dur="3.5s"
                    repeatCount="indefinite"
                />
            </circle>

            <!-- 内层光晕 -->
            <circle
                :cx="x + bedWidth + 14"
                :cy="y - 12"
                r="10"
                fill="rgba(255, 215, 0, 0.5)"
            >
                <animate
                    attributeName="opacity"
                    values="0.5;0.7;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                />
                <animate
                    attributeName="r"
                    values="10;11;10"
                    dur="2.5s"
                    repeatCount="indefinite"
                />
            </circle>

            <!-- 灯泡 -->
            <circle
                :cx="x + bedWidth + 14"
                :cy="y - 12"
                r="4"
                fill="rgba(255, 255, 190, 0.9)"
                stroke="#FFD700"
                stroke-width="0.5"
            >
                <animate
                    attributeName="fill-opacity"
                    values="0.9;1;0.9"
                    dur="1.5s"
                    repeatCount="indefinite"
                />
            </circle>
        </g>

        <!-- 眼罩 (当角色在睡觉时显示) -->
        <g v-if="showEyeMask" class="eye-mask">
            <ellipse
                :cx="x + bedWidth / 2"
                :cy="y + 20"
                rx="15"
                ry="5"
                fill="#333"
            />
            <rect
                :x="x + bedWidth / 2 - 15"
                :y="y + 17"
                width="30"
                height="6"
                rx="3"
                fill="#333"
            />
            <!-- 眼罩带子 -->
            <path
                :d="`M${x + bedWidth / 2 - 15} ${y + 20}
                    Q${x + bedWidth / 2 - 25} ${y + 25},
                    ${x + bedWidth / 2 - 25} ${y + 30}`"
                stroke="#333"
                fill="none"
                stroke-width="2"
            />
            <path
                :d="`M${x + bedWidth / 2 + 15} ${y + 20}
                    Q${x + bedWidth / 2 + 25} ${y + 25},
                    ${x + bedWidth / 2 + 25} ${y + 30}`"
                stroke="#333"
                fill="none"
                stroke-width="2"
            />
        </g>

        <!-- 音符 (当选择音乐播放器时显示) -->
        <g v-if="showMusicNotes" class="music-notes">
            <!-- 音符1 -->
            <g class="music-note">
                <ellipse
                    :cx="x + bedWidth + 15"
                    :cy="y + 20"
                    rx="3"
                    ry="2"
                    fill="#333"
                >
                    <animate
                        attributeName="cy"
                        :values="`${y + 20};${y - 10};${y - 20}`"
                        dur="3s"
                        begin="0s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0.7;0"
                        dur="3s"
                        begin="0s"
                        repeatCount="indefinite"
                    />
                </ellipse>
                <rect
                    :x="x + bedWidth + 18"
                    :y="y + 10"
                    width="1"
                    height="10"
                    fill="#333"
                >
                    <animate
                        attributeName="y"
                        :values="`${y + 10};${y - 20};${y - 30}`"
                        dur="3s"
                        begin="0s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0.7;0"
                        dur="3s"
                        begin="0s"
                        repeatCount="indefinite"
                    />
                </rect>
            </g>

            <!-- 音符2 -->
            <g class="music-note">
                <ellipse
                    :cx="x + bedWidth + 25"
                    :cy="y + 30"
                    rx="3"
                    ry="2"
                    fill="#333"
                >
                    <animate
                        attributeName="cy"
                        :values="`${y + 30};${y};${y - 10}`"
                        dur="2.5s"
                        begin="0.5s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0.7;0"
                        dur="2.5s"
                        begin="0.5s"
                        repeatCount="indefinite"
                    />
                </ellipse>
                <rect
                    :x="x + bedWidth + 28"
                    :y="y + 20"
                    width="1"
                    height="10"
                    fill="#333"
                >
                    <animate
                        attributeName="y"
                        :values="`${y + 20};${y - 10};${y - 20}`"
                        dur="2.5s"
                        begin="0.5s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0.7;0"
                        dur="2.5s"
                        begin="0.5s"
                        repeatCount="indefinite"
                    />
                </rect>
            </g>

            <!-- 音符3 -->
            <g class="music-note">
                <ellipse
                    :cx="x + bedWidth + 8"
                    :cy="y + 25"
                    rx="3"
                    ry="2"
                    fill="#333"
                >
                    <animate
                        attributeName="cy"
                        :values="`${y + 25};${y - 5};${y - 15}`"
                        dur="3.5s"
                        begin="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0.7;0"
                        dur="3.5s"
                        begin="1s"
                        repeatCount="indefinite"
                    />
                </ellipse>
                <rect
                    :x="x + bedWidth + 11"
                    :y="y + 15"
                    width="1"
                    height="10"
                    fill="#333"
                >
                    <animate
                        attributeName="y"
                        :values="`${y + 15};${y - 15};${y - 25}`"
                        dur="3.5s"
                        begin="1s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        values="1;0.7;0"
                        dur="3.5s"
                        begin="1s"
                        repeatCount="indefinite"
                    />
                </rect>
            </g>
        </g>
    </g>
</template>

<style scoped>
.lamp {
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
  transform-origin: center;
  animation: lamp-glow 4s ease-in-out infinite;
}

@keyframes lamp-glow {
  0% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)); }
  50% { filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)); }
  100% { filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6)); }
}

.eye-mask {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

.music-notes {
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
}
</style>

<script setup lang="ts">
// 通用卡片样式组件
// 使用方法：在每个卡片组件中引入 import './BaseCardStyles.vue'
</script>

<style>
/* 通用卡片容器 */
.control-card {
  width: 180px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.6);
  z-index: 1000;
  user-select: none;
  transition: all 0.3s ease;
  margin-bottom: 15px;
}

.control-card:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-3px);
}

/* 卡片头部 */
.card-header {
  background: linear-gradient(to right, #7F8C8D, #95A5A6);
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

/* 卡片标题 */
.card-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  gap: 5px;
}

/* 卡片状态 */
.card-status {
  font-size: 12px;
  padding: 3px 8px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  transition: all 0.3s ease;
}

.status-on {
  background-color: rgba(46, 204, 113, 0.3);
  color: #fff;
}

.status-off {
  background-color: rgba(231, 76, 60, 0.2);
  color: #fff;
}

/* 卡片内容 */
.card-content {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 控制按钮 */
.control-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #f8f8f8, #e8e8e8);
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #333;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 500;
}

.control-button:hover {
  background: linear-gradient(to bottom, #fff, #f0f0f0);
  transform: translateY(-1px);
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
}

.control-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.control-button.active {
  background: linear-gradient(to bottom, #e0f2fe, #bae6fd);
  border-color: #7dd3fc;
  color: #0284c7;
}

/* 按钮行 */
.buttons-row {
  display: flex;
  gap: 8px;
}

.buttons-row .control-button {
  flex: 1;
}

/* 通用指示器样式 */
.indicator-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 8px 10px;
  background: rgba(0, 0, 0, 0.03);
  font-size: 12px;
  color: #555;
  border-radius: 6px;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
  margin-right: 4px;
  transition: all 0.3s ease;
}

/* 主题色 */
.theme-blue {
  background: linear-gradient(to right, #2980b9, #3498db);
}

.theme-orange {
  background: linear-gradient(to right, #e67e22, #f39c12);
}

.theme-green {
  background: linear-gradient(to right, #27ae60, #2ecc71);
}

.theme-purple {
  background: linear-gradient(to right, #8e44ad, #9b59b6);
}

.theme-gold {
  background: linear-gradient(to right, #B5985A, #D6B964);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .control-button {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// 组件状态
const isActive = ref(false);
const isListening = ref(false);
const isProcessing = ref(false);
const message = ref('点击激活小爱同学');
const messageVisible = ref(false);

// 语音识别
let recognition: SpeechRecognition | null = null;
// 语音合成
const synth = window.speechSynthesis;

// 中文语言翻译
const translations = {
  activate: '点击激活小爱同学',
  listening: '我在听...',
  hello: '你好，有什么可以帮到你的吗？',
  openCurtain: '好的，正在打开窗帘',
  closeCurtain: '好的，正在关闭窗帘',
  openAC: '好的，正在打开空调',
  closeAC: '好的，正在关闭空调',
  setSunny: '好的，正在切换到晴天',
  setCloudy: '好的，正在切换到多云天气',
  setRainy: '好的，正在切换到雨天',
  setStorm: '好的，正在切换到雷暴天气',
  askWeather: '您想要切换到什么样的天气呢？可以选择晴天、多云、雨天或雷暴',
  introduction: '我是小爱同学，是您的智能语音助手。我可以帮您控制窗帘、空调、天气等，请尝试对我说打开窗帘、关闭空调或者切换天气。',
  thanks: '不客气，随时为您服务',
  notUnderstood: '抱歉，我没听懂您的指令。您可以尝试说打开窗帘、关闭空调或者切换天气。',
  browserNotSupport: '您的浏览器不支持语音识别',
  recognitionError: '识别错误',
};

// 获取翻译
const t = (key: keyof typeof translations) => {
  return translations[key];
};

// 初始化语音识别
const initSpeechRecognition = () => {
  try {
    // @ts-ignore - SpeechRecognition可能在TS类型中不存在
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error(t('browserNotSupport'));
      message.value = t('browserNotSupport');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListening.value = true;
      message.value = t('listening');
      messageVisible.value = true;
    };

    recognition.onend = () => {
      isListening.value = false;
      if (!isProcessing.value) {
        // 如果不是在处理命令，则提示完成
        setTimeout(() => {
          if (!isProcessing.value) {
            messageVisible.value = false;
          }
        }, 2000);
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim().toLowerCase();
      console.log('识别结果:', transcript);
      processCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('语音识别错误:', event.error);
      message.value = `${t('recognitionError')}: ${event.error}`;
      isListening.value = false;
      setTimeout(() => {
        messageVisible.value = false;
      }, 2000);
    };
  } catch (error) {
    console.error('初始化语音识别失败:', error);
    message.value = t('browserNotSupport');
  }
};

// 处理语音命令
const processCommand = (command: string) => {
  isProcessing.value = true;
  messageVisible.value = true;
  
  console.log('处理命令:', command);
  
  // 命令处理
  if (command.includes('你好') || command.includes('在吗')) {
    speakText(t('hello'));
  } else if (command.includes('打开窗帘') || command.includes('拉开窗帘')) {
    speakText(t('openCurtain'));
    window.dispatchEvent(new CustomEvent('open-curtains'));
  } else if (command.includes('关闭窗帘') || command.includes('拉上窗帘')) {
    speakText(t('closeCurtain'));
    window.dispatchEvent(new CustomEvent('close-curtains'));
  } else if (command.includes('打开空调') || command.includes('开空调')) {
    speakText(t('openAC'));
    window.dispatchEvent(new CustomEvent('turn-on-ac'));
  } else if (command.includes('关闭空调') || command.includes('关空调')) {
    speakText(t('closeAC'));
    window.dispatchEvent(new CustomEvent('turn-off-ac'));
  } else if (command.includes('天气')) {
    if (command.includes('晴') || command.includes('太阳')) {
      speakText(t('setSunny'));
      window.dispatchEvent(new CustomEvent('change-weather', { detail: { type: 'sunny' } }));
    } else if (command.includes('多云') || command.includes('阴')) {
      speakText(t('setCloudy'));
      window.dispatchEvent(new CustomEvent('change-weather', { detail: { type: 'cloudy' } }));
    } else if (command.includes('下雨') || command.includes('雨天')) {
      speakText(t('setRainy'));
      window.dispatchEvent(new CustomEvent('change-weather', { detail: { type: 'rainy' } }));
    } else if (command.includes('雷') || command.includes('闪电') || command.includes('暴风雨')) {
      speakText(t('setStorm'));
      window.dispatchEvent(new CustomEvent('change-weather', { detail: { type: 'storm' } }));
    } else {
      speakText(t('askWeather'));
    }
  } else if (command.includes('几点') || command.includes('时间') || (command.includes('现在') && command.includes('时间'))) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    speakText(`现在是${hours}点${minutes}分`);
  } else if (command.includes('日期') || command.includes('几号') || command.includes('星期')) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[now.getDay()];
    speakText(`今天是${year}年${month}月${date}日，星期${weekday}`);
  } else if (command.includes('介绍') || command.includes('自我介绍')) {
    speakText(t('introduction'));
  } else if (command.includes('谢谢') || command.includes('感谢')) {
    speakText(t('thanks'));
  } else {
    speakText(t('notUnderstood'));
  }
};

// 语音合成（说话）
const speakText = (text: string) => {
  // 如果已经有语音在播放，先停止
  if (synth.speaking) {
    synth.cancel();
  }
  
  message.value = text;
  
  // 创建语音合成实例
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  
  utterance.onend = () => {
    isProcessing.value = false;
    setTimeout(() => {
      messageVisible.value = false;
    }, 2000);
  };
  
  synth.speak(utterance);
};

// 激活小爱同学
const activate = () => {
  if (!recognition) {
    initSpeechRecognition();
  }
  
  if (isListening.value) {
    // 如果已经在监听，停止
    if (recognition) {
      recognition.abort();
    }
    isListening.value = false;
    return;
  }
  
  // 开始监听
  if (recognition) {
    try {
      recognition.start();
    } catch (error) {
      console.error('启动语音识别失败:', error);
      // 如果出错，可能是因为已经有一个实例在运行，先停止再启动
      recognition.stop();
      setTimeout(() => {
        if (recognition) recognition.start();
      }, 100);
    }
  }
};

// 组件挂载时初始化
onMounted(() => {
  initSpeechRecognition();
  
  // 监听唤醒命令（例如：小爱同学）
  const handleKeypress = (event: KeyboardEvent) => {
    if (event.key === 'x' || event.key === 'X') {
      activate();
    }
  };
  
  window.addEventListener('keypress', handleKeypress);
  
  // 清理函数
  onUnmounted(() => {
    window.removeEventListener('keypress', handleKeypress);
    if (recognition) {
      recognition.abort();
    }
    if (synth.speaking) {
      synth.cancel();
    }
  });
});
</script>

<template>
  <div class="xiao-ai-container">
    <div 
      class="xiao-ai-robot" 
      :class="{ 'active': isActive, 'listening': isListening }"
      @click="activate"
    >
      <!-- 机器人主体 -->
      <div class="robot-body">
        <!-- 左侧绿色装饰 -->
        <div class="side-decoration left"></div>
        
        <!-- 主体内容 -->
        <div class="robot-face">
          <!-- 上部装饰线 -->
          <div class="top-decoration">
            <div class="antenna left"></div>
            <div class="antenna right"></div>
          </div>
          
          <!-- 眼睛/显示屏 -->
          <div class="display-screen">
            <div class="inner-display">
              <!-- 心电图 -->
              <div class="ecg-line" :class="{ 'active': isListening }">
                <svg viewBox="0 0 100 20" width="100%" height="100%">
                  <path 
                    d="M0,10 L20,10 L25,2 L30,18 L35,0 L40,20 L45,10 L60,10 L70,10 L75,2 L80,18 L85,10 L100,10" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="1.5"
                    class="ecg-path"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧绿色装饰 -->
        <div class="side-decoration right"></div>
      </div>
    </div>
    
    <!-- 消息气泡 -->
    <div class="xiao-ai-message" v-if="messageVisible">
      <div class="message-bubble">
        <div class="message-content">{{ message }}</div>
      </div>
      <div class="message-tail"></div>
    </div>
  </div>
</template>

<style scoped>
.xiao-ai-container {
  position: fixed;
  right: 30px;
  bottom: 30px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.xiao-ai-robot {
  position: relative;
  width: 80px;
  height: 60px;
  cursor: pointer;
  transform-origin: center;
  transition: all 0.3s ease;
}

.xiao-ai-robot:hover {
  transform: scale(1.05);
}

.xiao-ai-robot.listening {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 机器人主体 */
.robot-body {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 侧边装饰 */
.side-decoration {
  position: absolute;
  width: 6px;
  height: 16px;
  background-color: #4CD964;
  border-radius: 2px;
  top: 50%;
  transform: translateY(-50%);
}

.side-decoration.left {
  left: -3px;
}

.side-decoration.right {
  right: -3px;
}

/* 机器人脸部/主体 */
.robot-face {
  width: 100%;
  height: 100%;
  background-color: #2196F3;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* 上部装饰线 */
.top-decoration {
  position: absolute;
  top: -7px;
  width: 70%;
  display: flex;
  justify-content: space-between;
}

.antenna {
  height: 12px;
  width: 2px;
  background-color: #FFF;
  border-radius: 1px;
  position: relative;
}

.antenna:after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background-color: #FFF;
  border-radius: 50%;
  left: 50%;
  top: -2px;
  transform: translateX(-50%);
}

.antenna.left {
  transform: rotate(-15deg);
}

.antenna.right {
  transform: rotate(15deg);
}

.xiao-ai-robot.listening .antenna {
  animation: antennaWave 1.5s infinite ease-in-out;
}

.xiao-ai-robot.listening .antenna.left {
  animation-delay: 0.2s;
}

@keyframes antennaWave {
  0%, 100% { transform: rotate(-15deg); }
  50% { transform: rotate(-20deg); }
}

.xiao-ai-robot.listening .antenna.right {
  animation: antennaWaveRight 1.5s infinite ease-in-out;
}

@keyframes antennaWaveRight {
  0%, 100% { transform: rotate(15deg); }
  50% { transform: rotate(20deg); }
}

/* 显示屏 */
.display-screen {
  width: 70%;
  height: 20px;
  background-color: #202830;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.inner-display {
  width: 85%;
  height: 10px;
  position: relative;
  overflow: hidden;
}

/* 心电图线 */
.ecg-line {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.ecg-path {
  stroke: #FFFFFF;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
}

.ecg-line.active .ecg-path {
  animation: drawEcg 2s infinite linear;
}

@keyframes drawEcg {
  0% { stroke-dashoffset: 200; }
  100% { stroke-dashoffset: 0; }
}

/* 消息气泡 */
.xiao-ai-message {
  position: relative;
  max-width: 280px;
  margin-bottom: 20px;
  margin-right: 25px;
  animation: pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  transform-origin: bottom right;
}

.message-bubble {
  background: #2196F3;
  color: white;
  border-radius: 20px;
  padding: 15px 18px;
}

.message-content {
  font-size: 15px;
  line-height: 1.5;
}

.message-tail {
  position: absolute;
  bottom: -10px;
  right: 20px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 15px solid #2196F3;
}

@keyframes pop-in {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style> 

<script setup lang="ts">
import { useUserStore } from '@/store/user'
import useToken from '@/utils/token'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginAction, registerAction } from './api'

const router = useRouter()
const userStore = useUserStore()

const formData = reactive({
    username: '',
    password: '',
})
const registerData = reactive({
    username: '',
    password: '',
    confirmPassword: '',
})
const isLoginForm = ref(true)
const errorMessage = ref('')
const loading = ref(false)
const isFormActive = ref(false)
const isButtonPressed = ref(false)
const ripple = reactive({ show: false, x: 0, y: 0 })

function onFocus() {
    isFormActive.value = true
}
function onBlur() {
    isFormActive.value = false
}

function buttonDown(e: MouseEvent) {
    isButtonPressed.value = true
    const btn = e.currentTarget as HTMLElement
    const rect = btn.getBoundingClientRect()
    ripple.x = e.clientX - rect.left
    ripple.y = e.clientY - rect.top
    ripple.show = true
}
function buttonUp() {
    isButtonPressed.value = false
    setTimeout(() => ripple.show = false, 350)
}

// 处理登录
async function handleLogin() {
    if (!formData.username || !formData.password) {
        errorMessage.value = '用户名和密码不能为空'
        return
    }

    loading.value = true
    errorMessage.value = ''

    try {
        const user = await loginAction({
            username: formData.username,
            password: formData.password,
        })
        console.log(user, 'user')
        const token = user.token
        useToken.setToken(token)
        userStore.setUser(user)
        router.push('/room')
    }
    catch (error: any) {
        errorMessage.value = error.message
    }
    finally {
        loading.value = false
    }
}

// 按下回车键登录
function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        handleLogin()
    }
}

function handleSleep() {
    router.push('/single')
}

function handleRegister() {
    isLoginForm.value = false
    errorMessage.value = ''
    registerData.username = ''
    registerData.password = ''
    registerData.confirmPassword = ''
}

function switchToLogin() {
    isLoginForm.value = true
    errorMessage.value = ''
    formData.username = ''
    formData.password = ''
}

async function submitRegister() {
    if (!registerData.username || !registerData.password || !registerData.confirmPassword) {
        errorMessage.value = '请填写完整注册信息'
        return
    }

    if (registerData.password !== registerData.confirmPassword) {
        errorMessage.value = '两次输入的密码不一致'
        return
    }

    loading.value = true
    errorMessage.value = ''

    console.log(registerData, 'registerData')

    try {
        await registerAction({
            username: registerData.username,
            password: registerData.password,
        })

        switchToLogin()
    }
    catch (error: any) {
        console.log(error, 'error')
        errorMessage.value = error.message
    }
    finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="wip-tip">
        联机功能开发中... 直接点击单机睡觉进入休息室
    </div>
    <div class="login-bg">
        <div class="login-layout">
            <div class="login-left">
                <svg class="cloud-svg" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M60 200 Q80 170 120 180 Q130 140 180 150 Q200 120 250 140 Q270 120 320 160 Q370 170 360 210 Q340 250 280 240 Q250 270 200 250 Q150 270 120 240 Q70 250 60 200 Z" stroke="#7db9e8" stroke-width="3" fill="none" />
                    <ellipse cx="120" cy="120" rx="30" ry="12" stroke="#b4d8f5" stroke-width="2" fill="none" />
                    <ellipse cx="300" cy="100" rx="40" ry="15" stroke="#b4d8f5" stroke-width="2" fill="none" />
                </svg>
            </div>
            <div class="login-right">
                <div class="login-form-wrapper" :class="{ active: isFormActive, error: errorMessage }">
                    <h2 class="form-title">
                        {{ isLoginForm ? '用户登录' : '用户注册' }}
                    </h2>
                    <p class="form-subtitle">
                        {{ isLoginForm ? '欢迎回来，请输入您的账号信息' : '创建一个新账号' }}
                    </p>

                    <!-- 登录表单 -->
                    <form v-if="isLoginForm" @submit.prevent="handleLogin">
                        <div class="form-item">
                            <label for="username">用户名</label>
                            <input
                                id="username"
                                v-model="formData.username"
                                type="text"
                                placeholder="请输入用户名"
                                @keydown="handleKeyDown"
                                @focus="onFocus"
                                @blur="onBlur"
                            >
                        </div>
                        <div class="form-item">
                            <label for="password">密码</label>
                            <input
                                id="password"
                                v-model="formData.password"
                                type="password"
                                placeholder="请输入密码"
                                @keydown="handleKeyDown"
                                @focus="onFocus"
                                @blur="onBlur"
                            >
                        </div>
                        <transition name="fade">
                            <div v-if="errorMessage" class="form-item error-message">
                                {{ errorMessage }}
                            </div>
                        </transition>
                        <div class="form-item">
                            <button type="submit" :disabled="loading" :class="{ pressed: isButtonPressed }" @mousedown="buttonDown" @mouseup="buttonUp">
                                {{ loading ? '登录中...' : '登 录' }}
                                <span v-if="ripple.show" class="ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }" />
                            </button>
                        </div>
                        <div class="form-item form-actions">
                            <button type="button" class="secondary" @click="handleSleep">
                                单机睡觉
                            </button>
                            <button type="button" class="secondary primary" @click="handleRegister">
                                立即注册
                            </button>
                        </div>
                    </form>

                    <!-- 注册表单 -->
                    <form v-else @submit.prevent="submitRegister">
                        <div class="form-item">
                            <label for="register-username">用户名</label>
                            <input
                                id="register-username"
                                v-model="registerData.username"
                                type="text"
                                placeholder="请输入用户名"
                                @focus="onFocus"
                                @blur="onBlur"
                            >
                        </div>
                        <div class="form-item">
                            <label for="register-password">密码</label>
                            <input
                                id="register-password"
                                v-model="registerData.password"
                                type="password"
                                placeholder="请输入密码"
                                @focus="onFocus"
                                @blur="onBlur"
                            >
                        </div>
                        <div class="form-item">
                            <label for="confirm-password">确认密码</label>
                            <input
                                id="confirm-password"
                                v-model="registerData.confirmPassword"
                                type="password"
                                placeholder="请再次输入密码"
                                @focus="onFocus"
                                @blur="onBlur"
                            >
                        </div>
                        <transition name="fade">
                            <div v-if="errorMessage" class="form-item error-message">
                                {{ errorMessage }}
                            </div>
                        </transition>
                        <div class="form-item">
                            <button type="submit" :disabled="loading" :class="{ pressed: isButtonPressed }" @mousedown="buttonDown" @mouseup="buttonUp">
                                {{ loading ? '注册中...' : '注 册' }}
                                <span v-if="ripple.show" class="ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }" />
                            </button>
                        </div>
                        <div class="form-item form-actions">
                            <button type="button" class="secondary primary" @click="switchToLogin">
                                返回登录
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
.wip-tip {
  position: fixed;
  left: 50%;
  top: 24px;
  transform: translateX(-50%);
  padding: 4px 10px;
  background: #fff;
  border-radius: 0 0 10px 0;
  z-index: 1000;
  font-size: 12px;
  color: #f44a;

}

.login-bg {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(120deg, #e3f0fa 0%, #b4d8f5 100%);
  overflow: hidden;
  z-index: 0;
  font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}

.login-layout {
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  z-index: 2;
}
.login-left {
  flex: 1.2;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}
.cloud-svg {
  width: 80%;
  max-width: 420px;
  min-width: 260px;
  height: auto;
  margin: 0 auto;
  display: block;
  opacity: 0.9;
  filter: drop-shadow(0 4px 24px #b4d8f5cc);
}
.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form-wrapper {
  width: 100%;
  max-width: 400px;
  padding: 44px 38px 32px 38px;
  background: rgba(255,255,255,0.6);
  border-radius: 20px;
  border: 1.5px solid #b4d8f5;
  box-shadow: 0 4px 32px 0 rgba(59, 131, 192, 0.08);
  transition: box-shadow 0.3s, transform 0.3s, background 0.3s, border-color 0.3s;
  will-change: box-shadow, transform, background, border-color;
  backdrop-filter: blur(12px) saturate(1.5);
}
.login-form-wrapper.active {
  box-shadow: 0 8px 40px 0 rgba(59, 131, 192, 0.13);
  background: rgba(255,255,255,0.82);
  border-color: #7db9e8;
  transform: translateY(-3px) scale(1.018);
}
.login-form-wrapper.error {
  animation: shake 0.3s;
}
@keyframes shake {
  0% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
  100% { transform: translateX(0); }
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7db9e8;
  margin-bottom: 10px;
  text-align: left;
  letter-spacing: 1px;
}

.form-subtitle {
  font-size: 1rem;
  color: #7a8fa6;
  margin-bottom: 32px;
  font-weight: 400;
}

.form-item {
  margin-bottom: 22px;
}

.form-item label {
  display: block;
  margin-bottom: 7px;
  font-size: 15px;
  color: #6a7a8c;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.form-item input {
  width: 100%;
  padding: 12px 15px;
  border: 1.5px solid #b4d8f5;
  border-radius: 8px;
  font-size: 15px;
  background: transparent;
  color: #3b83c0;
  font-family: inherit;
  transition: border-color 0.3s, box-shadow 0.3s, background 0.2s, color 0.2s;
  outline: none;
  box-shadow: none;
}
.form-item input:focus {
  border-color: #7db9e8;
  background: #f6fbff;
  color: #2d6da4;
  box-shadow: 0 0 0 2px #b4d8f533;
}

.form-item input::placeholder {
  color: #b4d8f5;
  font-weight: 400;
  letter-spacing: 0.5px;
}

.form-item.form-actions {
  display: flex;
  gap: 16px;
  margin-top: -8px;
  margin-bottom: 8px;
}
.form-item.form-actions .secondary {
  flex: 1;
  padding: 12px 0;
  background: transparent;
  color: #7db9e8;
  border: 1.5px solid #b4d8f5;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
  outline: none;
  position: relative;
  overflow: hidden;
  box-shadow: none;
}
.form-item.form-actions .secondary:hover {
  background: linear-gradient(90deg, #e3f0fa 0%, #b4d8f5 100%);
  color: #2d6da4;
  border-color: #7db9e8;
}
.form-item.form-actions .secondary.primary {
  background: transparent;
  color: #fff;
  border: 1.5px solid #7db9e8;
  background-image: linear-gradient(90deg, #7db9e8 0%, #3b83c0 100%);
  background-size: 200% 100%;
  background-position: 0 0;
  transition: background-position 0.3s, color 0.2s, border-color 0.2s;
}
.form-item.form-actions .secondary.primary:hover {
  background-position: 100% 0;
  color: #fff;
  border-color: #3b83c0;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  animation: fade-in 0.4s;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.form-item button[type="submit"] {
  width: 100%;
  padding: 14px;
  background: transparent;
  color: #3b83c0;
  border: 1.5px solid #7db9e8;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s, color 0.2s, border-color 0.2s, transform 0.15s;
  position: relative;
  overflow: hidden;
  outline: none;
  box-shadow: none;
  letter-spacing: 1px;
}
.form-item button[type="submit"]:hover {
  background: linear-gradient(90deg, #7db9e8 0%, #3b83c0 100%);
  color: #fff;
  border-color: #3b83c0;
}
.form-item button[type="submit"].pressed,
.form-item button[type="submit"]:active {
  background: #b4d8f5;
  color: #3b83c0;
  border-color: #7db9e8;
  transform: scale(0.97);
}
.form-item button[type="submit"] .ripple {
  position: absolute;
  width: 120px;
  height: 120px;
  background: rgba(125,185,232,0.18);
  border-radius: 50%;
  pointer-events: none;
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-anim 0.35s linear;
  z-index: 2;
}
@keyframes ripple-anim {
  to {
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .login-layout {
    flex-direction: column;
  }
  .login-left, .login-right {
    flex: unset;
    width: 100vw;
    min-height: 200px;
  }
  .login-right {
    min-height: 400px;
  }
  .cloud-svg {
    width: 90vw;
    min-width: 180px;
    max-width: 100vw;
  }
}
@media (max-width: 768px) {
  .login-form-wrapper {
    padding: 18px 8px 12px 8px;
    max-width: 98vw;
  }
  .form-title {
    font-size: 1.3rem;
  }
}
</style>

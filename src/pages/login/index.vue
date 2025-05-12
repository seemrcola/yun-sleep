<script setup lang="ts">
import { useUserStore } from '@/store/user'
import useToken from '@/utils/token'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginAction, registerAction, getUserInfoAction } from './api'

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

function onFormHover(e: MouseEvent) {
    const form = e.target as HTMLElement
    if (form.closest('.form-container')) {
        isFormActive.value = true
    }
}

function onBlur(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (!target.closest('.form-container')
        && !errorMessage.value
        && formData.username === ''
        && formData.password === '') {
        isFormActive.value = false
    }
}

function buttonDown(e: MouseEvent) {
    isButtonPressed.value = true
    const btn = e.currentTarget as HTMLElement
    const rect = btn.getBoundingClientRect()
    ripple.x = e.clientX - rect.left
    ripple.y = e.clientY - rect.top
    ripple.show = true
    setTimeout(() => {
        ripple.show = false
    }, 600)
}
function buttonUp() {
    isButtonPressed.value = false
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
        const token = user.token
        useToken.setToken(token)

        // 获取用户信息
        const userInfo = await getUserInfoAction()
        console.log(userInfo, 'userInfo')

        userStore.setUser(userInfo)

        // 跳转至房间页面
        router.push('/room')
    }
    catch (error: any) {
        errorMessage.value = error.message || '登录失败，请重试'
    }
    finally {
        loading.value = false
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
        errorMessage.value = error.message || '注册失败，请重试'
    }
    finally {
        loading.value = false
    }
}
</script>

<template>
    <div
        class="login-container"
        @mouseenter="onFormHover"
        @mouseleave="onBlur($event)"
        @click="onBlur($event)"
    >
        <!-- 背景装饰 -->
        <div class="background-decoration">
            <div class="circle circle-1" />
            <div class="circle circle-2" />
            <div class="circle circle-3" />
            <div class="circle circle-4" />
            <div class="floating-cloud cloud-1" />
            <div class="floating-cloud cloud-2" />
        </div>

        <div class="login-content">
            <!-- 表单区域 -->
            <div class="form-container" :class="{ 'login-form': isLoginForm, 'register-form': !isLoginForm }">
                <div class="form-header">
                    <h2>{{ isLoginForm ? '欢迎回来' : '创建账号' }}</h2>
                    <p>{{ isLoginForm ? '请登录您的账号' : '填写信息以注册新账号' }}</p>
                </div>

                <!-- 登录表单 -->
                <form v-if="isLoginForm" @submit.prevent="handleLogin">
                    <div class="form-item">
                        <label class="form-label">账号</label>
                        <div class="input-wrapper" :class="{ 'has-error': errorMessage }">
                            <i class="input-icon user-icon" />
                            <input
                                v-model="formData.username"
                                type="text"
                                placeholder="请输入用户名"
                                @focus="onFocus"
                            >
                        </div>
                    </div>

                    <div class="form-item">
                        <label class="form-label">密码</label>
                        <div class="input-wrapper" :class="{ 'has-error': errorMessage }">
                            <i class="input-icon password-icon" />
                            <input
                                v-model="formData.password"
                                type="password"
                                placeholder="请输入密码"
                                @focus="onFocus"
                            >
                        </div>
                    </div>

                    <div v-if="errorMessage" class="error-message">
                        <i class="error-icon" />
                        <span>{{ errorMessage }}</span>
                    </div>

                    <div class="form-actions">
                        <button
                            type="submit"
                            class="login-button"
                            :class="{ 'is-loading': loading, 'is-pressed': isButtonPressed }"
                            @mousedown="buttonDown"
                            @mouseup="buttonUp"
                            @mouseleave="buttonUp"
                        >
                            <span v-if="!loading">登录</span>
                            <span v-else class="loading-spinner" />
                            <div v-if="ripple.show" class="ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }" />
                        </button>

                        <div class="form-footer">
                            <span>没有账号?</span>
                            <a href="#" @click.prevent="handleRegister">注册</a>
                        </div>

                        <div class="divider">
                            <span>或者</span>
                        </div>

                        <button
                            type="button"
                            class="single-button"
                            @click="handleSleep"
                            @mousedown="buttonDown"
                            @mouseup="buttonUp"
                            @mouseleave="buttonUp"
                        >
                            单机睡觉模式
                        </button>
                    </div>
                </form>

                <!-- 注册表单 -->
                <form v-else @submit.prevent="submitRegister">
                    <div class="form-item">
                        <label class="form-label">账号</label>
                        <div class="input-wrapper" :class="{ 'has-error': errorMessage }">
                            <i class="input-icon user-icon" />
                            <input
                                v-model="registerData.username"
                                type="text"
                                placeholder="请输入用户名"
                                @focus="onFocus"
                            >
                        </div>
                    </div>

                    <div class="form-item">
                        <label class="form-label">密码</label>
                        <div class="input-wrapper" :class="{ 'has-error': errorMessage }">
                            <i class="input-icon password-icon" />
                            <input
                                v-model="registerData.password"
                                type="password"
                                placeholder="设置密码"
                                @focus="onFocus"
                            >
                        </div>
                    </div>

                    <div class="form-item">
                        <label class="form-label">确认密码</label>
                        <div class="input-wrapper" :class="{ 'has-error': errorMessage }">
                            <i class="input-icon password-icon" />
                            <input
                                v-model="registerData.confirmPassword"
                                type="password"
                                placeholder="再次输入密码"
                                @focus="onFocus"
                            >
                        </div>
                    </div>

                    <div v-if="errorMessage" class="error-message">
                        <i class="error-icon" />
                        <span>{{ errorMessage }}</span>
                    </div>

                    <div class="form-actions">
                        <button
                            type="submit"
                            class="login-button"
                            :class="{ 'is-loading': loading, 'is-pressed': isButtonPressed }"
                            @mousedown="buttonDown"
                            @mouseup="buttonUp"
                            @mouseleave="buttonUp"
                        >
                            <span v-if="!loading">注册</span>
                            <span v-else class="loading-spinner" />
                            <div v-if="ripple.show" class="ripple" :style="{ left: `${ripple.x}px`, top: `${ripple.y}px` }" />
                        </button>

                        <div class="form-footer">
                            <span>已有账号?</span>
                            <a href="#" @click.prevent="switchToLogin">登录</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.login-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #e3f0fa 0%, #b4d8f5 100%);
  font-family: 'Inter', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, #7db9e8, #3b83c0);
  top: -150px;
  left: -150px;
  animation: float-circle 10s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #b4d8f5, #7db9e8);
  bottom: -80px;
  right: 10%;
  animation: float-circle 12s ease-in-out infinite reverse;
}

.circle-3 {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, #3b83c0, #60a5fa);
  top: 15%;
  right: 15%;
  animation: float-circle 9s ease-in-out infinite 2s;
}

.circle-4 {
  width: 180px;
  height: 180px;
  background: linear-gradient(135deg, #60a5fa, #7db9e8);
  bottom: 15%;
  left: 10%;
  animation: float-circle 15s ease-in-out infinite 1s;
}

.floating-cloud {
  position: absolute;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.8;
}

.cloud-1 {
  width: 300px;
  height: 150px;
  top: 15%;
  left: 5%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60' fill='none'%3E%3Cpath d='M15 40 Q25 30 35 35 Q40 25 50 30 Q55 20 65 30 Q75 25 85 35 Q95 30 105 40 Q100 45 80 42 Q70 47 60 43 Q50 48 35 42 Q20 45 15 40 Z' stroke='%237db9e8' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  animation: float-cloud 20s ease-in-out infinite;
}

.cloud-2 {
  width: 260px;
  height: 130px;
  bottom: 20%;
  right: 10%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60' fill='none'%3E%3Cpath d='M15 40 Q25 30 35 35 Q40 25 50 30 Q55 20 65 30 Q75 25 85 35 Q95 30 105 40 Q100 45 80 42 Q70 47 60 43 Q50 48 35 42 Q20 45 15 40 Z' stroke='%237db9e8' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  animation: float-cloud 18s ease-in-out infinite 1s reverse;
}

.cloud-1::after, .cloud-2::after {
  content: '';
  position: absolute;
  width: 60%;
  height: 30%;
  top: 35%;
  left: 20%;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 30' fill='none'%3E%3Cellipse cx='50' cy='15' rx='30' ry='8' stroke='%23b4d8f5' stroke-width='1' fill='none' /%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.7;
}

@keyframes float-circle {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(5px, 10px) scale(1.02);
  }
  50% {
    transform: translate(0, 20px) scale(0.98);
  }
  75% {
    transform: translate(-5px, 10px) scale(1.01);
  }
}

@keyframes float-cloud {
  0%, 100% {
    transform: translateX(0);
  }
  33% {
    transform: translateX(15px) translateY(-5px);
  }
  66% {
    transform: translateX(-15px) translateY(5px);
  }
}

/* 登录内容区 */
.login-content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
  padding: 20px 80px 20px 0;
  position: relative;
}

/* 表单容器 */
.form-container {
  width: 100%;
  max-width: 380px;
  background: white;
  border-radius: 12px;
  padding: 0 0 30px 0;
  box-shadow: 0 10px 30px rgba(59, 131, 192, 0.15);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
  animation: slideIn 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.form-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 160px;
  background: linear-gradient(to top, rgba(246, 249, 252, 0.7), transparent);
  z-index: -1;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 表单头部 */
.form-header {
  position: relative;
  padding: 20px 30px 15px;
  margin-bottom: 25px;
  text-align: center;
  background: linear-gradient(to bottom, rgba(249, 251, 253, 0.9), white);
}

.form-header::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 5px;
  background: linear-gradient(90deg, #f0f5fa, #e2edf7, #f0f5fa);
  border-radius: 3px;
}

.form-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #3b83c0;
  margin-bottom: 8px;
  background: linear-gradient(135deg, #3b83c0, #60a5fa);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
}

.form-header p {
  font-size: 0.95rem;
  color: #718096;
}

/* 表单标签 */
.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 600;
  padding-left: 5px;
}

/* 表单项 */
.form-item {
  margin-bottom: 20px;
  padding: 0 30px;
  position: relative;
}

.input-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s;
  border: 1px solid #e6edf5;
  background: rgba(249, 250, 251, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.input-wrapper.has-error {
  border-color: #f56565;
  box-shadow: 0 0 0 2px rgba(245, 101, 101, 0.2);
}

.input-wrapper:focus-within {
  border-color: #7db9e8;
  box-shadow: 0 0 0 3px rgba(125, 185, 232, 0.15);
  background: white;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  opacity: 0.5;
  transition: opacity 0.3s, transform 0.3s;
}

.input-wrapper:focus-within .input-icon,
.input-wrapper:hover .input-icon {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.user-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%233b83c0'/%3E%3C/svg%3E");
  background-size: contain;
}

.password-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z' fill='%233b83c0'/%3E%3C/svg%3E");
  background-size: contain;
}

input {
  width: 100%;
  padding: 15px 15px 15px 45px;
  background: transparent;
  border: none;
  font-size: 0.95rem;
  color: #2d3748;
  outline: none;
  font-family: inherit;
  transition: transform 0.3s;
}

input:focus {
  transform: translateX(2px);
}

input::placeholder {
  color: #a0aec0;
  opacity: 0.7;
}

/* 错误消息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(254, 226, 226, 0.6);
  border-radius: 8px;
  margin: 0 30px 20px;
  border: 1px solid rgba(248, 113, 113, 0.2);
  border-left: 3px solid #f87171;
  animation: fadeIn 0.3s ease, shake 0.5s ease 0.15s;
  box-shadow: 0 2px 8px rgba(248, 113, 113, 0.08);
  color: #ef4444;
  font-weight: 400;
  font-size: 0.9rem;
}

.error-icon {
  display: inline-block;
  width: 18px;
  height: 18px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' fill='%23ef4444'/%3E%3C/svg%3E");
  background-size: contain;
  flex-shrink: 0;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

/* 表单操作区 */
.form-actions {
  display: flex;
  flex-direction: column;
  gap: 36px;
  padding: 5px 30px;
}

.login-button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #7db9e8, #3b83c0);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(59, 131, 192, 0.25);
  letter-spacing: 3px;
}

.login-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(59, 131, 192, 0.4);
  background: linear-gradient(135deg, #60a5fa, #2d6da4);
}

.login-button.is-pressed {
  transform: scale(0.98);
  box-shadow: 0 2px 8px rgba(59, 131, 192, 0.2);
}

.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.ripple {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0);
  animation: ripple 0.6s linear;
}

@keyframes ripple {
  to {
    transform: scale(15);
    opacity: 0;
  }
}

.form-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.form-footer span {
  color: #718096;
}

.form-footer a {
  color: #3b83c0;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.form-footer a:hover {
  color: #2d6da4;
  text-decoration: underline;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 15px 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid #e2e8f0;
}

.divider span {
  padding: 0 12px;
  color: #a0aec0;
  font-size: 0.85rem;
  font-weight: 500;
  position: relative;
  z-index: 1;
  background: white;
}

.divider::before {
  background: linear-gradient(to right, transparent, #e2e8f0);
  height: 1px;
}

.divider::after {
  background: linear-gradient(to left, transparent, #e2e8f0);
  height: 1px;
}

.single-button {
  width: 100%;
  padding: 15px;
  background: rgba(249, 250, 251, 0.8);
  border: 1px solid #e6edf5;
  border-radius: 10px;
  color: #3b83c0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.95rem;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.single-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.8), transparent);
  transform: translateX(-100%);
  transition: 0.6s;
}

.single-button:hover {
  background: white;
  border-color: #7db9e8;
  color: #2d6da4;
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(59, 131, 192, 0.15);
}

.single-button:hover::before {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .login-content {
    padding: 20px;
    justify-content: center;
  }
}

@media (max-width: 480px) {

  .login-content {
    padding: 15px;
  }

  .form-container {
    padding-bottom: 25px;
  }

  .form-header {
    padding: 15px 20px 15px;
  }

  .form-item,
  .form-actions,
  .error-message {
    padding-left: 20px;
    padding-right: 20px;
  }

  input {
    padding: 12px 12px 12px 40px;
  }
}
</style>

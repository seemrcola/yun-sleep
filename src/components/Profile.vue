<script setup lang="ts">
import { useUserStore } from '@/store/user'
import useToken from '@/utils/token'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const showDropdown = ref(false)
const dropdownStyle = ref({
    top: '0px',
    left: '0px',
})

function updateDropdownPosition() {
    const avatar = document.querySelector('.avatar-wrapper') as HTMLElement
    if (avatar && showDropdown.value) {
        const rect = avatar.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceRight = window.innerWidth - rect.left

        // 计算下拉菜单的位置
        let top = rect.bottom + 10
        let left = rect.left

        // 如果下方空间不足，则显示在上方
        if (spaceBelow < 300) {
            top = rect.top - 10 - 220
        }

        // 如果右侧空间不足，则向左对齐
        if (spaceRight < 220) {
            left = window.innerWidth - 220 - 20
        }

        dropdownStyle.value = {
            top: `${top}px`,
            left: `${left}px`,
        }
    }
}

// 监听窗口大小变化
onMounted(() => {
    window.addEventListener('resize', updateDropdownPosition)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateDropdownPosition)
})

// 显示下拉菜单时更新位置
function showMenu() {
    showDropdown.value = true
    setTimeout(updateDropdownPosition, 0)
}

function handleLogout() {
    useToken.removeToken()
    userStore.clearUser()
    router.push('/login')
}

function handleChangePassword() {
    // TODO: 实现修改密码功能
    console.log('修改密码')
}

function handleUserData() {
    // TODO: 实现查看角色数据功能
    console.log('查看角色数据')
}
</script>

<template>
    <div class="profile-container">
        <div
            class="avatar-wrapper"
            @mouseenter="showMenu"
        >
            <div class="avatar">
                {{ userStore.user?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="status-dot" />
        </div>

        <div
            v-show="showDropdown"
            class="dropdown-container"
            @mouseleave="showDropdown = false"
        >
            <div
                class="dropdown-menu"
                :class="{ active: showDropdown }"
                :style="dropdownStyle"
            >
                <div class="menu-header">
                    <div class="user-info">
                        <span class="username">{{ userStore.user?.username }}</span>
                        <span class="user-status">在线</span>
                    </div>
                </div>

                <div class="menu-divider" />

                <div class="menu-items">
                    <div class="menu-item" @click="handleUserData">
                        <i class="item-icon user-data-icon" />
                        <span>角色数据</span>
                    </div>
                    <div class="menu-item" @click="handleChangePassword">
                        <i class="item-icon password-icon" />
                        <span>修改密码</span>
                    </div>
                    <div class="menu-item logout" @click="handleLogout">
                        <i class="item-icon logout-icon" />
                        <span>退出登录</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-container {
  position: relative;
  display: inline-block;
  padding: 5px;
}

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: 1001;
}

.avatar-wrapper:hover {
  transform: translateY(-2px);
}

.avatar {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.avatar::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transform: translateX(-100%);
  transition: 0.5s;
}

.avatar-wrapper:hover .avatar::before {
  transform: translateX(100%);
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
  border-color: white;
}

.status-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background-color: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

.dropdown-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 999;
}

.dropdown-menu {
  position: fixed;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.9) inset;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px) scale(0.98);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
  z-index: 1000;
  width: 260px;
  pointer-events: auto;
}

.dropdown-menu.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0) scale(1);
}

.menu-header {
  padding: 24px;
  background: linear-gradient(to bottom, rgba(249, 250, 251, 0.95), rgba(249, 250, 251, 0.4));
  border-bottom: 1px solid rgba(229, 231, 235, 0.5);
  position: relative;
}

.menu-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  border-radius: 3px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.username {
  font-weight: 600;
  color: #1f2937;
  font-size: 1.1rem;
  letter-spacing: 0.02em;
  margin-bottom: 4px;
  background: linear-gradient(120deg, #2563eb, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.user-status {
  font-size: 0.9rem;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.9;
  font-weight: 500;
}

.menu-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
  margin: 0;
}

.menu-items {
  padding: 16px 12px;
  background: linear-gradient(to bottom, transparent, rgba(249, 250, 251, 0.8));
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  color: #4b5563;
  font-size: 0.95rem;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  margin: 4px 0;
  font-weight: 500;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, transparent, rgba(59, 130, 246, 0.15), transparent);
  transform: translateX(-100%);
  transition: 0.4s;
}

.menu-item:hover {
  background: rgba(243, 244, 246, 0.9);
  color: #2563eb;
  transform: translateX(6px);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.menu-item.logout {
  color: #ef4444;
  margin-top: 12px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  padding-top: 20px;
}

.menu-item.logout:hover {
  background: rgba(254, 226, 226, 0.6);
  color: #dc2626;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.1);
}

.item-icon {
  width: 22px;
  height: 22px;
  opacity: 0.9;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.menu-item:hover .item-icon {
  transform: scale(1.15) rotate(5deg);
  opacity: 1;
}

.user-data-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z' fill='currentColor'/%3E%3C/svg%3E");
}

.password-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-8.9 6c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm3.4 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm3.5 0c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z' fill='currentColor'/%3E%3C/svg%3E");
}

.logout-icon {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z' fill='currentColor'/%3E%3C/svg%3E");
}

@media (max-width: 768px) {
  .dropdown-menu {
    width: 240px;
  }

  .menu-item {
    padding: 12px 16px;
  }

  .menu-header {
    padding: 20px;
  }
}
</style>

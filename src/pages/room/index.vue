<script setup lang="ts">
import Profile from '@/components/Profile.vue'
import { useUserStore } from '@/store/user'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
    createRoomAction,
    getRoomByIdAction,
    getUserInfoAction,
    leaveRoomAction,
    listRoomsAction,
} from './api'
import CreateRoom from './components/Create.vue'
import CurrentRoom from './components/Current.vue'
import RoomList from './components/List.vue'

const userStore = useUserStore()
const router = useRouter()

interface Room {
    id: string
    name: string
    capacity: number
    current: number
    ownerName: string
    description: string
    createdAt: string
}

const rooms = ref<Room[]>([])
const currentRoom = ref<Room | null>(null)

async function searchRooms() {
    const roomsList = await listRoomsAction()
    rooms.value = roomsList as Room[]
}

async function getCurrentRoom() {
    const user = userStore.user
    if (user?.roomId) {
        const room = await getRoomByIdAction(user.roomId)
        currentRoom.value = room as Room
    }
}

async function handleCreateRoom(
    form: {
        name: string
        description: string
        capacity: number
    },
) {
    const room = await createRoomAction(form)
    userStore.setUser({
        roomId: room.id,
    })
    // await searchRooms()
    router.push('/public')
}

async function handleJoinRoom(room: Room) {
    // 设置当前房间
    currentRoom.value = room
    // TODO: 调用加入房间接口
    console.log('加入房间:', room)
    router.push('/public')
}

async function handleLeaveRoom() {
    if (currentRoom.value?.id) {
        try {
            await leaveRoomAction({ roomId: Number.parseInt(currentRoom.value.id) })
            currentRoom.value = null
            await searchRooms()
        }
        catch (error) {
            console.error('离开过程报错:', error)
        }
    }
}

function handleEnterRoom() {
    // TODO: 实现进入休息区的逻辑，例如跳转到聊天页面
    if (currentRoom.value) {
        console.log('进入休息区:', currentRoom.value.id)
        // 这里可以添加导航到休息区内部页面的代码
        // 例如: router.push(`/room/${currentRoom.value.id}/chat`)
        router.push('/public')
    }
}

async function getUserInfo() {
    const userInfo = await getUserInfoAction()
    userStore.setUser(userInfo)
}

onMounted(async () => {
    await getUserInfo()
    getCurrentRoom()
    searchRooms()
})
</script>

<template>
    <div class="room-container">
        <!-- 用户头像 -->
        <div class="profile-section">
            <Profile />
        </div>

        <!-- 左侧区域 - 创建或当前房间信息 -->
        <div class="create-section">
            <!-- 当用户未加入房间时显示创建卡片 -->
            <CreateRoom
                v-if="currentRoom === null"
                :on-create-room="handleCreateRoom"
            />

            <!-- 当用户已加入房间时显示当前房间信息 -->
            <CurrentRoom
                v-else
                :room="currentRoom"
                :on-enter-room="handleEnterRoom"
                :on-leave-room="handleLeaveRoom"
            />
        </div>

        <!-- 房间列表 -->
        <RoomList
            :rooms="rooms"
            :current-room="currentRoom"
            :on-join-room="handleJoinRoom"
        />
    </div>
</template>

<style scoped>
.room-container {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0fb 100%);
  color: #2c3e50;
  position: relative;
  overflow: hidden;
}

.room-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.03) 0%, transparent 20%),
    radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 20%),
    radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 40%);
  pointer-events: none;
}

.profile-section {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
}

.create-section {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  position: relative;
  z-index: 1;
}

@media (max-width: 1024px) {
  .room-container {
    flex-direction: column;
  }

  .create-section {
    padding: 24px;
  }

  .profile-section {
    top: 16px;
    left: 16px;
  }
}
</style>

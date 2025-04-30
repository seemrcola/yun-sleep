<script setup lang="ts">
import { ref } from 'vue'
import { createRoomAction, listRoomsAction, getRoomByIdAction } from './api'
import { useUserStore } from '@/store/user'
import CreateRoom from './components/Create.vue'
import CurrentRoom from './components/Current.vue'
import RoomList from './components/List.vue'

const userStore = useUserStore()
const user = userStore.user

interface Room {
    id: string
    name: string
    capacity: number
    current: number
    ownerName: string
    description: string
    createTime: string
}

const rooms = ref<Room[]>([])
const currentRoom = ref<Room | null>(null)

searchRooms()
async function searchRooms() {
    const roomsList = await listRoomsAction()
    rooms.value = roomsList as Room[]
}

getCurrentRoom()
async function getCurrentRoom() {
    if (user?.roomId) {
        const room = await getRoomByIdAction(user.roomId)
        currentRoom.value = room as Room
    }
}

async function handleCreateRoom(
  form: { 
    name: string; 
    description: string; 
    capacity: number 
  }
) {
    await createRoomAction(form)
    await searchRooms()
}

async function handleJoinRoom(room: Room) {
    // 设置当前房间
    currentRoom.value = room
    // TODO: 调用加入房间接口
    console.log('加入房间:', room)
}

function handleLeaveRoom() {
    // 清除当前房间
    currentRoom.value = null
    // TODO: 调用离开房间接口
    console.log('离开房间')
}

function handleEnterRoom() {
    // TODO: 实现进入休息区的逻辑，例如跳转到聊天页面
    if (currentRoom.value) {
        console.log('进入休息区:', currentRoom.value.id)
        // 这里可以添加导航到休息区内部页面的代码
        // 例如: router.push(`/room/${currentRoom.value.id}/chat`)
    }
}
</script>

<template>
    <div class="room-container">
        <!-- 左侧区域 - 创建或当前房间信息 -->
        <div class="create-section">
            <!-- 当用户未加入房间时显示创建卡片 -->
            <CreateRoom 
                v-if="!user?.roomId" 
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
  background: linear-gradient(135deg, #f6f9fc 0%, #edf3f8 100%);
  color: #2c3e50;
}

.create-section {
  flex: 1;
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

@media (max-width: 1024px) {
  .room-container {
    flex-direction: column;
  }

  .create-section {
    padding: 24px;
  }
}
</style>

import type { ApiResponseData } from '@/service/createFetch'
import { http } from '@/service/createFetch'

enum RoomApi {
    CREATE_ROOM = '/api/room/create',
    LIST_ROOMS = '/api/room/list',
}

interface CreateRoomParams {
    name: string
    capacity: number
    description: string
}

export function createRoomAction(data: CreateRoomParams): Promise<ApiResponseData> {
    return http.post(RoomApi.CREATE_ROOM, data)
}

export function listRoomsAction(): Promise<ApiResponseData> {
    return http.post(RoomApi.LIST_ROOMS)
}

import type { ApiResponseData } from '@/service/createFetch'
import { http } from '@/service/createFetch'

enum RoomApi {
    CREATE_ROOM = '/api/room/create',
    LIST_ROOMS = '/api/room/list',
    GET_ROOM_BY_ID = '/api/room/getRoomById',
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

export function getRoomByIdAction(id: string): Promise<ApiResponseData> {
    return http.post(RoomApi.GET_ROOM_BY_ID, { id })
}

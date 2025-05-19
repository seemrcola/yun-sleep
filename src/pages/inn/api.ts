import type { ApiResponseData } from '@/service/createFetch'
import { http } from '@/service/createFetch'

enum LoginApi {
    GET_ROOM_BY_ID = '/api/room/getRoomById',
}

interface GetRoomByIdParams {
    roomId: string
}

export function getRoomByIdAction(data: GetRoomByIdParams): Promise<ApiResponseData> {
    return http.post(LoginApi.GET_ROOM_BY_ID, data)
}

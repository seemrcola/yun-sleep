import type { ApiResponseData } from '@/service/createFetch'
import { http } from '@/service/createFetch'

enum LoginApi {
    LOGIN = '/api/user/login',
    REGISTER = '/api/user/register',
    GET_USER_INFO = '/api/user/getUserInfo',
}

interface LoginParams {
    username: string
    password: string
}

interface RegisterParams extends LoginParams {}

export function loginAction(data: LoginParams): Promise<ApiResponseData> {
    return http.post(LoginApi.LOGIN, data)
}

export function registerAction(data: RegisterParams): Promise<ApiResponseData> {
    return http.post(LoginApi.REGISTER, data)
}

export function getUserInfoAction(): Promise<ApiResponseData> {
    return http.post(LoginApi.GET_USER_INFO)
}

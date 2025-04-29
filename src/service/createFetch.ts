import useToken from '@/utils/token'

// 定义响应结构
export interface ApiResponse<T = any> {
    success: boolean
    data: T
    message?: string
}

// 处理完success状态之后的数据
export interface ApiResponseData<T = any> {
    [key: string]: T
}

// 请求配置
export interface RequestConfig extends RequestInit {
    baseURL?: string
    timeout?: number
}

// 创建请求实例
export function createFetch(defaultConfig: RequestConfig = {}) {
    // 默认配置
    const baseConfig: RequestConfig = {
        baseURL: '',
        timeout: 15 * 1_000,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${useToken.getToken()}`,
        },
        ...defaultConfig,
    }

    // 超时控制
    const timeoutPromise = (timeout: number): Promise<never> => {
        return new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Request timeout after ${timeout}ms`))
            }, timeout)
        })
    }

    // 处理响应
    const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.success) {
            return data.data
        }
        else {
            throw new Error(data.message || '请求失败')
        }
    }

    // 请求方法
    async function request<T = any>(
        url: string,
        config: RequestConfig = {},
    ): Promise<ApiResponse<T>> {
    // 合并配置
        const finalConfig = { ...baseConfig, ...config }
        const finalUrl = (finalConfig.baseURL || '') + url

        try {
            // 发起请求，带超时控制
            const response = await Promise.race([
                fetch(finalUrl, finalConfig),
                timeoutPromise(finalConfig.timeout!),
            ])

            return handleResponse<T>(response)
        }
        catch (error) {
            // 统一错误处理
            console.error('Request failed:', error)
            throw error
        }
    }

    return {
        get: <T = any>(url: string, config?: RequestConfig) =>
            request<T>(url, { ...config, method: 'GET' }),

        post: <T = any>(url: string, data?: any, config?: RequestConfig) =>
            request<T>(url, {
                ...config,
                method: 'POST',
                body: JSON.stringify(data),
            }),

        put: <T = any>(url: string, data?: any, config?: RequestConfig) =>
            request<T>(url, {
                ...config,
                method: 'PUT',
                body: JSON.stringify(data),
            }),

        delete: <T = any>(url: string, config?: RequestConfig) =>
            request<T>(url, { ...config, method: 'DELETE' }),

        patch: <T = any>(url: string, data?: any, config?: RequestConfig) =>
            request<T>(url, {
                ...config,
                method: 'PATCH',
                body: JSON.stringify(data),
            }),
    }
}

// 创建默认实例
export const http = createFetch({
    baseURL: import.meta.env.VITE_API_URL || '',
})

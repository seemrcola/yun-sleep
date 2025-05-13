// Socket.io 客户端实现
import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import useToken from '../utils/token'

interface Person {
    name: string // 用户名
    id: number // 用户ID
    x: number // 用户位置X坐标
    y: number // 用户位置Y坐标
    room: number // 房间ID
    isSleeping: boolean // 是否睡觉
    bed: number // 床位ID
}

interface Message {
    sender: 'bot' | 'user' | 'system' // 消息类型
    userId?: number // 用户ID
    username?: string // 用户名
    content: string // 消息内容
    timestamp: number // 消息时间戳
}

enum SocketListenerEvent {
    ERROR = 'error',
    PERSON_JOINED = 'personJoined',
    PERSON_LEFT = 'personLeft',
    POSITION_UPDATED = 'positionUpdated',
    SLEEP_STATE_UPDATED = 'sleepStateUpdated',
    NEW_MESSAGE = 'newMessage',
    DISCONNECT = 'disconnect',
    JOIN_ROOM_SUCCESS = 'joinRoomSuccess',
}

enum SocketEmitEvent {
    JOIN_ROOM = 'joinRoom',
    LEAVE_ROOM = 'leaveRoom',
    UPDATE_POSITION = 'updatePosition',
    UPDATE_SLEEP_STATE = 'updateSleepState',
    SEND_MESSAGE = 'sendMessage',
}

class SocketService {
    private socket: Socket | null = null
    private roomId: number | null = null
    private userId: number | null = null
    private username: string | null = null
    private isConnecting: boolean = false
    private connectPromise: Promise<void> | null = null

    // 存储回调函数
    private eventListeners: {
        [key: string]: Array<(...args: any[]) => void>
    } = {
            [SocketListenerEvent.PERSON_JOINED]: [],
            [SocketListenerEvent.PERSON_LEFT]: [],
            [SocketListenerEvent.POSITION_UPDATED]: [],
            [SocketListenerEvent.SLEEP_STATE_UPDATED]: [],
            [SocketListenerEvent.NEW_MESSAGE]: [],
            [SocketListenerEvent.DISCONNECT]: [],
            [SocketListenerEvent.JOIN_ROOM_SUCCESS]: [],
            [SocketListenerEvent.ERROR]: [],
        }

    // 获取单例实例
    private static instance: SocketService | null = null

    public static getInstance(): SocketService {
        if (!SocketService.instance) {
            SocketService.instance = new SocketService()
        }
        return SocketService.instance
    }

    // 私有构造函数，确保只能通过getInstance创建
    private constructor() {
        // 自动连接（如果在浏览器环境）
        this.autoConnect()
    }

    // 自动连接到环境变量中的Socket服务器
    private autoConnect() {
        const socketUrl = import.meta.env.VITE_SOCKET_URL
        if (socketUrl && !this.socket && !this.isConnecting) {
            console.log('自动连接到Socket服务器:', socketUrl)
            this.connect(socketUrl)
        }
    }

    // 初始化连接
    private connect(baseURL: string): Promise<void> {
        // 如果已经在连接中，返回现有的Promise
        if (this.isConnecting && this.connectPromise) {
            return this.connectPromise
        }

        // 如果已经连接，直接返回已解析的Promise
        if (this.socket?.connected) {
            return Promise.resolve()
        }

        this.isConnecting = true

        this.connectPromise = new Promise((resolve, reject) => {
            try {
                // 获取认证Token
                const token = useToken.getToken()

                if (!token) {
                    this.isConnecting = false
                    reject(new Error('未登录，无法连接到服务器'))
                    return
                }

                // 创建Socket连接
                this.socket = io(baseURL, {
                    query: {
                        token,
                    },
                    transports: ['websocket'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 3 * 1_000,
                })

                // 监听连接成功
                this.socket.on('connect', () => {
                    console.log('Socket.IO 连接成功')
                    this.isConnecting = false
                    resolve()
                })

                // 监听连接错误
                this.socket.on('connect_error', (error) => {
                    console.error('Socket.IO 连接错误:', error)
                    this.isConnecting = false
                    reject(error)
                })

                // 设置服务器事件处理
                this.setupEventHandlers()
            }
            catch (error) {
                console.error('连接 Socket.IO 服务器时出错:', error)
                this.isConnecting = false
                reject(error)
            }
        })

        return this.connectPromise
    }

    // 断开连接
    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
            this.roomId = null
            this.userId = null
            this.username = null
            this.connectPromise = null
            console.log('已断开 Socket.IO 连接')
        }
    }

    // 设置基本事件处理器
    private setupEventHandlers(): void {
        if (!this.socket)
            return

        // 错误处理
        this.socket.on(SocketListenerEvent.ERROR, (data) => {
            console.error('Socket.IO 错误:', data.message)
            this.triggerEvent(SocketListenerEvent.ERROR, data)
        })

        // 处理新用户加入
        this.socket.on(SocketListenerEvent.PERSON_JOINED, (data) => {
            console.log('新用户加入:', data.person.name)
            this.triggerEvent(SocketListenerEvent.PERSON_JOINED, data.person)
        })

        // 处理用户离开
        this.socket.on(SocketListenerEvent.PERSON_LEFT, (data) => {
            console.log('用户离开:', data.userId)
            this.triggerEvent(SocketListenerEvent.PERSON_LEFT, data.userId)
        })

        // 处理位置更新
        this.socket.on(SocketListenerEvent.POSITION_UPDATED, (data) => {
            this.triggerEvent(SocketListenerEvent.POSITION_UPDATED, data)
        })

        // 处理睡眠状态更新
        this.socket.on(SocketListenerEvent.SLEEP_STATE_UPDATED, (data) => {
            this.triggerEvent(SocketListenerEvent.SLEEP_STATE_UPDATED, data)
        })

        // 处理新消息
        this.socket.on(SocketListenerEvent.NEW_MESSAGE, (data) => {
            this.triggerEvent(SocketListenerEvent.NEW_MESSAGE, data)
        })

        // 监听断开连接
        this.socket.on(SocketListenerEvent.DISCONNECT, (reason) => {
            console.log('Socket.IO 连接断开:', reason)
        })
    }

    // 加入房间
    async joinRoom(roomId: number): Promise<{
        person: Person
        people: Person[]
        messages: Message[]
    }> {
        return new Promise((resolve, reject) => {
            if (!this.socket) {
                reject(new Error('Socket 未连接'))
                return
            }

            this.socket.emit(SocketEmitEvent.JOIN_ROOM, { roomId })

            // 监听加入房间成功的事件
            this.socket.once(SocketListenerEvent.JOIN_ROOM_SUCCESS, (response) => {
                this.roomId = response.roomId
                this.userId = response.person.id
                this.username = response.person.name

                console.log(`成功加入房间 ${roomId}`)
                resolve(response)
            })
        })
    }

    // 离开房间
    async leaveRoom(): Promise<void> {
        return new Promise((resolve) => {
            if (!this.socket || !this.roomId) {
                resolve()
                return
            }

            this.socket.emit(SocketEmitEvent.LEAVE_ROOM)
            this.roomId = null
            resolve()
        })
    }

    // 更新位置
    async updatePosition(x: number, y: number): Promise<void> {
        if (!this.socket || !this.roomId) {
            console.error('无法更新位置: 未连接或未加入房间')
            return
        }

        this.socket.emit(SocketEmitEvent.UPDATE_POSITION, { x, y })
    }

    // 更新睡眠状态
    async updateSleepState(isSleeping: boolean, bed?: number): Promise<void> {
        if (!this.socket || !this.roomId) {
            console.error('无法更新睡眠状态: 未连接或未加入房间')
            return
        }

        this.socket.emit(SocketEmitEvent.UPDATE_SLEEP_STATE, { isSleeping, bed })
    }

    // 发送消息
    async sendMessage(message: { content: string }): Promise<void> {
        if (!this.socket || !this.roomId) {
            console.error('无法发送消息: 未连接或未加入房间')
            return
        }

        this.socket.emit(SocketEmitEvent.SEND_MESSAGE, message)
    }

    // 注册事件监听器
    on(event: string, callback: (...args: any[]) => void): void {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = []
        }

        this.eventListeners[event].push(callback)
    }

    // 移除事件监听器
    off(event: string, callback: (...args: any[]) => void): void {
        if (!this.eventListeners[event])
            return

        this.eventListeners[event] = this.eventListeners[event].filter(
            cb => cb !== callback,
        )
    }

    // 触发事件
    private triggerEvent(event: SocketListenerEvent, ...args: any[]): void {
        if (!this.eventListeners[event])
            return

        this.eventListeners[event].forEach((callback) => {
            try {
                callback(...args)
            }
            catch (error) {
                console.error(`执行 ${event} 事件回调时出错:`, error)
            }
        })
    }

    // 获取当前房间ID
    getRoomId(): number | null {
        return this.roomId
    }

    // 获取当前用户ID
    getUserId(): number | null {
        return this.userId
    }

    // 获取当前用户名
    getUsername(): string | null {
        return this.username
    }

    // 检查是否已连接
    isConnected(): boolean {
        return !!this.socket?.connected
    }
}

// 导出单例实例
export const socketService = SocketService.getInstance()

// 导出类型定义
export type { Message, Person }
export { SocketEmitEvent, SocketListenerEvent }

// Socket.io 客户端实现
import { io, Socket } from 'socket.io-client';
import useToken from '../utils/token';

interface Person {
  name: string;
  id: number;
  x: number;
  y: number;
  room: number;
  isSleeping: boolean;
  bed: number;
}

interface Message {
  type: 'bot' | 'user' | 'system';
  userId?: number;
  username?: string;
  data: string;
  timestamp: number;
}

class SocketService {
  private socket: Socket | null = null;
  private roomId: number | null = null;
  private userId: number | null = null;
  private username: string | null = null;
  
  // 存储回调函数
  private eventListeners: {
    [key: string]: Array<(...args: any[]) => void>;
  } = {
    personJoined: [],
    personLeft: [],
    positionUpdated: [],
    sleepStateUpdated: [],
    newMessage: [],
    error: [],
  };
  
  // 获取单例实例
  private static instance: SocketService | null = null;
  
  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }
  
  // 私有构造函数，确保只能通过getInstance创建
  private constructor() {}
  
  // 初始化连接
  connect(baseURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 获取认证Token
        const token = useToken.getToken();
        
        if (!token) {
          reject(new Error('未登录，无法连接到服务器'));
          return;
        }
        
        // 创建Socket连接
        this.socket = io(baseURL, {
          query: {
            token
          },
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000
        });
        
        // 监听连接成功
        this.socket.on('connect', () => {
          console.log('Socket.IO 连接成功');
          resolve();
        });
        
        // 监听连接错误
        this.socket.on('connect_error', (error) => {
          console.error('Socket.IO 连接错误:', error);
          reject(error);
        });
        
        // 设置服务器事件处理
        this.setupEventHandlers();
      } catch (error) {
        console.error('连接 Socket.IO 服务器时出错:', error);
        reject(error);
      }
    });
  }
  
  // 断开连接
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.roomId = null;
      this.userId = null;
      this.username = null;
      console.log('已断开 Socket.IO 连接');
    }
  }
  
  // 设置基本事件处理器
  private setupEventHandlers(): void {
    if (!this.socket) return;
    
    // 错误处理
    this.socket.on('error', (data) => {
      console.error('Socket.IO 错误:', data.message);
      this.triggerEvent('error', data);
    });
    
    // 处理新用户加入
    this.socket.on('personJoined', (data) => {
      console.log('新用户加入:', data.person.name);
      this.triggerEvent('personJoined', data.person);
    });
    
    // 处理用户离开
    this.socket.on('personLeft', (data) => {
      console.log('用户离开:', data.userId);
      this.triggerEvent('personLeft', data.userId);
    });
    
    // 处理位置更新
    this.socket.on('positionUpdated', (data) => {
      this.triggerEvent('positionUpdated', data);
    });
    
    // 处理睡眠状态更新
    this.socket.on('sleepStateUpdated', (data) => {
      this.triggerEvent('sleepStateUpdated', data);
    });
    
    // 处理新消息
    this.socket.on('newMessage', (data) => {
      this.triggerEvent('newMessage', data);
    });
    
    // 监听断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('Socket.IO 连接断开:', reason);
    });
  }
  
  // 加入房间
  joinRoom(roomId: number): Promise<{ 
    person: Person,
    people: Person[],
    messages: Message[] 
  }> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket 未连接'));
        return;
      }
      
      this.socket.emit('joinRoom', { roomId });
      
      // 监听加入房间成功的事件
      this.socket.once('joinRoomSuccess', (response) => {
        this.roomId = response.roomId;
        this.userId = response.person.id;
        this.username = response.person.name;
        
        console.log(`成功加入房间 ${roomId}`);
        resolve(response);
      });
    });
  }
  
  // 离开房间
  leaveRoom(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket || !this.roomId) {
        resolve();
        return;
      }
      
      this.socket.emit('leaveRoom');
      this.roomId = null;
      resolve();
    });
  }
  
  // 更新位置
  updatePosition(x: number, y: number): void {
    if (!this.socket || !this.roomId) {
      console.error('无法更新位置: 未连接或未加入房间');
      return;
    }
    
    this.socket.emit('updatePosition', { x, y });
  }
  
  // 更新睡眠状态
  updateSleepState(isSleeping: boolean, bed?: number): void {
    if (!this.socket || !this.roomId) {
      console.error('无法更新睡眠状态: 未连接或未加入房间');
      return;
    }
    
    this.socket.emit('updateSleepState', { isSleeping, bed });
  }
  
  // 发送消息
  sendMessage(message: string): void {
    if (!this.socket || !this.roomId) {
      console.error('无法发送消息: 未连接或未加入房间');
      return;
    }
    
    this.socket.emit('sendMessage', { message });
  }
  
  // 注册事件监听器
  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    
    this.eventListeners[event].push(callback);
  }
  
  // 移除事件监听器
  off(event: string, callback: (...args: any[]) => void): void {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event] = this.eventListeners[event].filter(
      (cb) => cb !== callback
    );
  }
  
  // 触发事件
  private triggerEvent(event: string, ...args: any[]): void {
    if (!this.eventListeners[event]) return;
    
    this.eventListeners[event].forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`执行 ${event} 事件回调时出错:`, error);
      }
    });
  }
  
  // 获取当前房间ID
  getRoomId(): number | null {
    return this.roomId;
  }
  
  // 获取当前用户ID
  getUserId(): number | null {
    return this.userId;
  }
  
  // 获取当前用户名
  getUsername(): string | null {
    return this.username;
  }
}

// 导出单例实例
export const socketService = SocketService.getInstance();

// 导出类型定义
export type { Person, Message };

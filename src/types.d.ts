// 类型定义
export interface Bed {
    id: number
    x: number
    y: number
    width: number
    height: number
    isOccupied: boolean
}

export interface Character {
    id?: number
    username?: string
    room?: number
    x: number
    y: number
    width: number
    height: number
    speed: number
    isSleeping: boolean
    currentBedIndex: number
    direction: 'up' | 'down' | 'left' | 'right'
    isMoving: boolean
    bubbleMessage: string | null
}

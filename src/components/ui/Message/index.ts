import type { App } from 'vue'
import { createApp } from 'vue'
import MessageComponent from './message.vue'

const MESSAGE_BOX_ID_PREFIX = '__message_box__'
const MESSAGE_BOX_CLASS = '__yun_sleep__message__'

// 消息实例容器
const messageInstances: Array<{
    id: string
    app: App
    container: HTMLElement
    timer: number | null
}> = []

// 消息ID计数器
let messageId = 1

// 消息间距
const MESSAGE_GAP = 16

// 默认配置
const defaultOptions = {
    duration: 5 * 1000,
    type: 'info' as const,
}

// 更新消息位置
function updateMessagePosition() {
    const messages = document.querySelectorAll(`.${MESSAGE_BOX_CLASS}`)
    if (messages.length <= 1)
        return

    let offsetTop = 5 // 初始百分比
    const viewportHeight = window.innerHeight

    messages.forEach((message) => {
        const element = message as HTMLElement
        const height = element.offsetHeight
        element.style.top = `${offsetTop}%`

        // 计算下一个消息的位置，确保不超出屏幕
        const pixelOffset = (viewportHeight * offsetTop / 100) + height + MESSAGE_GAP
        offsetTop = (pixelOffset / viewportHeight) * 100

        // 如果要超出屏幕，则重置到屏幕上方
        if (offsetTop > 80) {
            offsetTop = 5
        }
    })
}

// 创建消息实例
function createMessage(options: any) {
    const id = `${MESSAGE_BOX_ID_PREFIX}_${messageId++}`
    console.log(`Creating message ${id} with type ${options.type}`)

    // 创建容器
    const container = document.createElement('div')
    container.id = id
    document.body.appendChild(container)

    // 这里存储定时器以便稍后清除
    let closeTimer: number | null = null

    // 创建Vue应用实例 (必须先创建app变量)
    let app: App

    // 定义关闭函数
    function closeFunction() {
        console.log(`Closing message ${id}`)

        // 清除计时器
        if (closeTimer) {
            window.clearTimeout(closeTimer)
            closeTimer = null
        }

        // 找到并从实例列表中删除
        const index = messageInstances.findIndex(item => item.id === id)
        if (index !== -1) {
            // 从列表中移除
            messageInstances.splice(index, 1)
        }

        // 动画完成后再卸载
        setTimeout(() => {
            if (app) {
                console.log(`Unmounting message ${id}`)
                app.unmount()
            }

            if (document.body.contains(container)) {
                document.body.removeChild(container)
            }

            // 更新位置
            updateMessagePosition()
        }, 300)
    }

    // 合并默认选项
    const messageOptions = {
        ...defaultOptions,
        ...options,
        id,
        close: closeFunction,
    }

    // 创建应用
    app = createApp(MessageComponent, messageOptions)

    // 挂载应用
    app.mount(container)

    // 添加到实例数组
    messageInstances.push({
        id,
        app,
        container,
        timer: closeTimer,
    })

    // 更新消息位置
    setTimeout(updateMessagePosition, 10)

    // 到时间后关闭 - 只有当duration大于0时才自动关闭
    if (messageOptions.duration && messageOptions.duration > 0) {
        console.log(`Setting timer for message ${id}: ${messageOptions.duration}ms`)
        closeTimer = window.setTimeout(
            () => closeFunction(),
            messageOptions.duration,
        )
    }
}

// 清除所有消息
export function closeAllMessages() {
    console.log(`Closing all ${messageInstances.length} messages`)

    // 创建一个副本以防在遍历过程中数组被修改
    const instances = [...messageInstances]
    instances.forEach((instance) => {
    // 清除计时器
        if (instance.timer) {
            window.clearTimeout(instance.timer)
        }

        // 卸载应用
        instance.app.unmount()

        // 移除容器
        if (document.body.contains(instance.container)) {
            document.body.removeChild(instance.container)
        }
    })

    // 清空数组
    messageInstances.length = 0
}

// 导出消息方法
export const Message = {
    info(content: string, options = {}) {
        return createMessage({ content, type: 'info', ...options })
    },
    success(content: string, options = {}) {
        return createMessage({ content, type: 'success', ...options })
    },
    warning(content: string, options = {}) {
        return createMessage({ content, type: 'warning', ...options })
    },
    error(content: string, options = {}) {
        return createMessage({ content, type: 'error', ...options })
    },
    closeAll: closeAllMessages,
}

export default Message

import { defineStore } from 'pinia'

interface User {
    id: number
    roomId: number
    username: string
    [key: string]: any
}

export const useUserStore = defineStore(
    'user',
    {
        state: () => ({
            user: {} as User,
        }),
        actions: {
            setUser(user: Partial<User>) {
                this.user = { ...this.user, ...user }
            },

            clearUser() {
                this.user = {} as User
            },
        },
        persist: {
            storage: localStorage,
        },
    },
)

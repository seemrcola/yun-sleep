import { defineStore } from 'pinia'

interface User {
    [key: string]: any
}

export const useUserStore = defineStore(
    'user',
    {
        state: () => ({
            user: null as User | null,
        }),
        actions: {
            setUser(value: User) {
                this.user = value
            },

            clearUser() {
                this.user = null
            },
        },
        persist: {
            storage: localStorage,
        },
    },
)

import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
    }),
    actions: {
        setUser(value: any) {
            this.user = value
        },

        clearUser() {
            this.user = null
        },
    },
})

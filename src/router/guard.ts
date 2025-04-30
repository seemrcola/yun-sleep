import type { Router } from 'vue-router'
import { useUserStore } from '@/store/user'

const WHITE_LIST = ['/login', '/single']

function setupGuard(router: Router) {
    router
        .beforeEach((to, _, next) => {
            const path = to.path
            if (WHITE_LIST.includes(path))
                return next()
            const userStore = useUserStore()
            const user = userStore.user
            if (!user)
                return next({ path: '/' })
            next()
        })

    router
        .afterEach((to) => {
            const title = to.meta.title
            if (title)
                document.title = title as string
        })
}

export { setupGuard }

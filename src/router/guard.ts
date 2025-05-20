import type { Router } from 'vue-router'
import useToken from '@/utils/token'

const WHITE_LIST = ['/login', '/single']

function setupGuard(router: Router) {
    router
        .beforeEach((to, _, next) => {
            console.log('beforeEach', to)
            const path = to.path
            if (WHITE_LIST.includes(path))
                return next()
            const token = useToken.getToken()
            if (!token)
                return next({ path: '/login' })
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

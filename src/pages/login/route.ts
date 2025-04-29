import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        component: () => import('./index.vue'),
        meta: {
            title: '登录',
        },
    },
]

export { routes }

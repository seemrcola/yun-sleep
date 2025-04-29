import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/room',
        component: () => import('./index.vue'),
        meta: {
            title: '多人模式',
        },
    },
]

export { routes }

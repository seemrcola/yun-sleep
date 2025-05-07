import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/room',
        component: () => import('./index.vue'),
        meta: {
            title: '房间管理',
        },
    },
]

export { routes }

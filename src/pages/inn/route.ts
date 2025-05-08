import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/inn/:id',
        component: () => import('./index.vue'),
        meta: {
            title: '云睡觉客栈',
        },
    },
]

export { routes }

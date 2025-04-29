import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/single',
        component: () => import('./index.vue'),
        meta: {
            title: '单人模式',
        },
    },
]

export { routes }

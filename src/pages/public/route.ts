import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/public',
        component: () => import('./index.vue'),
        meta: {
            title: '公共休息区',
        },
    },
]

export { routes }

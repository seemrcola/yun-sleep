import type { App } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { setupGuard } from './guard'
import { loadRoutes } from './loader'

const baseRoutes = [
    {
        path: '/',
        redirect: '/single',
    },
]

function setupRouter(app: App) {
    const routes = loadRoutes()
    const router = createRouter({
        history: createWebHistory(),
        routes: [...baseRoutes, ...routes],
    })
    setupGuard(router)
    app.use(router)
}

export { setupRouter }

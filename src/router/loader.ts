function loadRoutes() {
    const loadResult = import.meta.glob('@/pages/**/route.ts', { eager: true })
    const routes = Object.values(loadResult).flatMap((route: any) => route.routes)
    return routes
}

export { loadRoutes }

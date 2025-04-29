import { setupRouter } from '@/router'
import { setupPinia } from '@/store'
import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

const app = createApp(App)
setupRouter(app)
setupPinia(app)

app.mount('#app')

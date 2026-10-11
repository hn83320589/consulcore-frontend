import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { resettableStores } from './stores/plugins/resettable'
import App from './App.vue'
import router from './router'
import { registerToast } from './services/httpService'
import { useUiStore } from './stores/uiStore'
import './styles/main.css'

const app = createApp(App)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
pinia.use(resettableStores)

app.use(pinia)
app.use(router)

// 註冊 httpService 的 toast 回調（Pinia 已初始化）
const uiStore = useUiStore()
registerToast((msg, type) => uiStore.showToast(msg, type))

app.mount('#app')

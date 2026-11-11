import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createToastPlugin } from '@/composables/useToast'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(createToastPlugin())

app.mount('#app')

import { createApp } from 'vue'
import "./style.scss"
import App from './App.vue'
import LzyIcon from '@/components/lzyCompontens/lzyIcon.vue';
import { createPinia } from 'pinia';
const pinia = createPinia()

const app = createApp(App)
app.component('LzyIcon', LzyIcon)
app.use(pinia)
app.mount('#app')

// nextTick(() => {
//   postMessage({ payload: 'removeLoading' }, '*')
// })

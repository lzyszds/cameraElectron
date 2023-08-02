import { createApp } from 'vue'
import "./style.scss"
import 'element-plus/dist/index.css'
import App from './App.vue'
import LzyIcon from '@/components/lzyCompontens/LzyIcon.vue';
import LzyProgress from '@/components/lzyCompontens/LzyProgress.vue';
import { createPinia } from 'pinia';
const pinia = createPinia()

const app = createApp(App)
app.component('LzyIcon', LzyIcon)
  .component('LzyProgress', LzyProgress)
app.use(pinia)
app.mount('#app')

// nextTick(() => {
//   postMessage({ payload: 'removeLoading' }, '*')
// })

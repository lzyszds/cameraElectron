import { createApp, nextTick } from 'vue'
import "./style.css"
import App from './App.vue'
import './samples/node-api'
import LzyIcon from '@/components/lzyIcon.vue';

const app = createApp(App)
app.component('LzyIcon', LzyIcon)
app.mount('#app')

nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})

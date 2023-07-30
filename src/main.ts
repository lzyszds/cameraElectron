import { createApp, nextTick } from 'vue'
import "./style.css"
import App from './App.vue'
import LzyIcon from '@/components/lzyCompontens/lzyIcon.vue';
import { createPinia } from 'pinia';

const app = createApp(App)
app.component('LzyIcon', LzyIcon)
app.mount('#app')

nextTick(() => {
  postMessage({ payload: 'removeLoading' }, '*')
})

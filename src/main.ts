import { createApp } from 'vue'
import 'element-plus/dist/index.css'
import "./style.scss"
import './assets/css/elementplus.scss'
import App from './App.vue'
import LzyIcon from '@/components/lzyCompontens/LzyIcon.vue';
import LzyProgress from '@/components/lzyCompontens/LzyProgress.vue';
import { createPinia } from 'pinia';

import tailwindJs from '@/utils/tailwin'
//class转换的一些方法
window.tailwindJs = tailwindJs

const pinia = createPinia()

const app = createApp(App)
app.component('LzyIcon', LzyIcon)
  .component('LzyProgress', LzyProgress)
app.use(pinia)
app.mount('#app')

import './style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import 'primeicons/primeicons.css'
import App from './App.vue'
import router from './router'
import ToastService from 'primevue/toastservice';
import Toast from 'primevue/toast';
const app = createApp(App)
app.component('Toast', Toast);
app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
  }
});
app.use(ToastService);
app.mount('#app')

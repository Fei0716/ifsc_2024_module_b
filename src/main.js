import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// axios.defaults.baseURL = 'http://localhost:8000/api/v1';
// axios.interceptors.request.use((config)=>{
//     return config;
// });
// axios.interceptors.response.use((config)=>{
//
//     return config;
// },(error)=>{
//     console.log(error.response.status);
//     if(error.response.status == '401'){
//         router.push('/');
//     }
//     return Promise.reject(error);
// });

app.use(router)
app.mount('#app')

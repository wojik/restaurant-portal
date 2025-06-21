// frontend/src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';

// Globalna konfiguracja Axios
axios.defaults.baseURL = 'http://localhost:3001/api'; // Upewnij się, że port zgadza się z backendem

// Dodaj interceptor, aby automatycznie dodawać token autoryzacji do każdego requestu
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Wysyłamy ID użytkownika jako token
  }
  return config;
}, error => {
  return Promise.reject(error);
});

const app = createApp(App);
app.use(router);
app.mount('#app');

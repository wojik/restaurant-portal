<!-- frontend/src/components/LoginForm.vue -->
<template>
  <div class="form-container">
    <h2>Logowanie</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Nazwa użytkownika:</label>
        <input type="text" id="username" v-model="username" required class="form-input">
      </div>
      <div class="form-group">
        <label for="password">Hasło:</label>
        <input type="password" id="password" v-model="password" required class="form-input">
      </div>
      <button type="submit" class="btn-primary">Zaloguj</button>
      <p v-if="message" class="message-error">{{ message }}</p>
    </form>
    <div class="extra-links">
      <router-link to="/forgot-password">Nie pamiętasz hasła?</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { login } from '../utils/auth';

const username = ref('');
const password = ref('');
const message = ref('');
const router = useRouter();

const handleLogin = async () => {
  message.value = '';
  try {
    const response = await axios.post('/login', { username: username.value, password: password.value });
    login(response.data.token, response.data.username);
    router.push('/');
  } catch (err) {
    console.error('Błąd logowania:', err.response?.data || err);
    message.value = err.response?.data?.message || 'Nie udało się zalogować.';
  }
};
</script>

<style scoped>
.extra-links {
  margin-top: 15px;
  text-align: center;
}
.extra-links a {
  color: #007bff;
  text-decoration: none;
}
.extra-links a:hover {
  text-decoration: underline;
}
</style>

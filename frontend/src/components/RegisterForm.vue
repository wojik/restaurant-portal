<!-- frontend/src/components/RegisterForm.vue -->
<template>
  <div class="form-container">
    <h2>Rejestracja</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="reg-username">Nazwa użytkownika:</label>
        <input type="text" id="reg-username" v-model="username" required class="form-input">
      </div>
      <div class="form-group">
        <label for="reg-email">Email:</label>
        <input type="email" id="reg-email" v-model="email" required class="form-input">
      </div>
      <div class="form-group">
        <label for="reg-password">Hasło:</label>
        <input type="password" id="reg-password" v-model="password" required class="form-input">
      </div>
      <button type="submit" class="btn-primary">Zarejestruj</button>
      <p v-if="message" :class="messageType === 'success' ? 'message-success' : 'message-error'">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const username = ref('');
const email = ref('');
const password = ref('');
const message = ref('');
const messageType = ref('');

const handleRegister = async () => {
  message.value = '';
  messageType.value = '';
  try {
    await axios.post('/register', { username: username.value, email: email.value, password: password.value });
    message.value = 'Rejestracja pomyślna! Możesz się teraz zalogować.';
    messageType.value = 'success';
    // Wyczyść formularz
    username.value = '';
    email.value = '';
    password.value = '';
  } catch (err) {
    console.error('Błąd rejestracji:', err.response?.data || err);
    message.value = err.response?.data?.message || 'Nie udało się zarejestrować.';
    messageType.value = 'error';
  }
};
</script>

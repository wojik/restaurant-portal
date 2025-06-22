<!-- frontend/src/components/ForgotPassword.vue -->
<template>
  <div class="form-container">
    <h2>Resetowanie hasła</h2>
    <p>Wpisz swój adres e-mail, aby otrzymać link do zresetowania hasła.</p>
    <form @submit.prevent="requestResetLink">
      <div class="form-group">
        <label for="email">Adres e-mail:</label>
        <input type="email" id="email" v-model="email" required class="form-input">
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Wysyłanie...' : 'Wyślij link' }}
      </button>
      <p v-if="message" :class="messageType === 'success' ? 'message-success' : 'message-error'">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const message = ref('');
const messageType = ref('');
const loading = ref(false);

const requestResetLink = async () => {
  loading.value = true;
  message.value = '';
  messageType.value = '';
  try {
    const response = await axios.post('/forgot-password', { email: email.value });
    message.value = response.data.message;
    messageType.value = 'success';
  } catch (err) {
    console.error("Błąd podczas wysyłania prośby o reset hasła:", err);
    message.value = err.response?.data?.message || 'Wystąpił błąd. Spróbuj ponownie.';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>

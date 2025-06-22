<!-- frontend/src/components/ResetPassword.vue -->
<template>
  <div class="form-container">
    <h2>Ustaw nowe hasło</h2>
    <form @submit.prevent="handlePasswordReset">
      <div class="form-group">
        <label for="new-password">Nowe hasło:</label>
        <input type="password" id="new-password" v-model="password" required class="form-input">
      </div>
      <div class="form-group">
        <label for="confirm-password">Potwierdź hasło:</label>
        <input type="password" id="confirm-password" v-model="confirmPassword" required class="form-input">
      </div>
      <button type="submit" class="btn-primary" :disabled="loading">
        {{ loading ? 'Zapisywanie...' : 'Zapisz nowe hasło' }}
      </button>
      <p v-if="message" :class="messageType === 'success' ? 'message-success' : 'message-error'">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';

const props = defineProps({
  token: {
    type: String,
    required: true,
  }
});

const password = ref('');
const confirmPassword = ref('');
const message = ref('');
const messageType = ref('');
const loading = ref(false);
const router = useRouter();

const handlePasswordReset = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = 'Hasła nie są takie same.';
    messageType.value = 'error';
    return;
  }

  loading.value = true;
  message.value = '';
  messageType.value = '';

  try {
    await axios.post('/reset-password', { token: props.token, password: password.value });
    message.value = 'Hasło zostało pomyślnie zmienione! Zostaniesz przekierowany na stronę logowania...';
    messageType.value = 'success';
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  } catch (err) {
    console.error("Błąd podczas resetowania hasła:", err);
    message.value = err.response?.data?.message || 'Wystąpił błąd. Spróbuj ponownie.';
    messageType.value = 'error';
  } finally {
    loading.value = false;
  }
};
</script>

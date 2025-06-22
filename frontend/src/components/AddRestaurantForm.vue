<!-- frontend/src/components/AddRestaurantForm.vue -->
<template>
  <div class="form-container">
    <h2>Dodaj Nową Restaurację</h2>
    <form @submit.prevent="addRestaurant">
      <div class="form-group">
        <label for="name">Nazwa:</label>
        <input type="text" id="name" v-model="restaurant.name" required class="form-input">
      </div>
      <div class="form-group">
        <label for="address">Adres:</label>
        <input type="text" id="address" v-model="restaurant.address" required class="form-input">
      </div>
      <div class="form-group">
        <label for="description">Opis:</label>
        <textarea id="description" v-model="restaurant.description" rows="4" class="form-textarea"></textarea>
      </div>
      <div class="form-group">
        <label for="position">Lokalizacja (np. miasto, dzielnica):</label>
        <input type="text" id="position" v-model="restaurant.position" class="form-input">
      </div>
      <div class="form-group">
        <label for="photo_url">URL zdjęcia:</label>
        <input type="url" id="photo_url" v-model="restaurant.photo_url" class="form-input">
      </div>
      <div class="form-group">
        <label for="menu_types">Rodzaje menu (oddzielone przecinkami):</label>
        <input type="text" id="menu_types" v-model="restaurant.menu_types" class="form-input">
      </div>
      <button type="submit" class="btn-primary">Dodaj Restaurację</button>
      <p v-if="message" :class="messageType === 'success' ? 'message-success' : 'message-error'">{{ message }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const restaurant = ref({
  name: '',
  address: '',
  description: '',
  position: '',
  photo_url: '',
  menu_types: ''
});
const message = ref('');
const messageType = ref('');
const router = useRouter();

const addRestaurant = async () => {
  message.value = '';
  messageType.value = '';
  try {
    await axios.post('/restaurants', restaurant.value);
    message.value = 'Restauracja dodana pomyślnie!';
    messageType.value = 'success';
    restaurant.value = { name: '', address: '', description: '', position: '', photo_url: '', menu_types: '' };
    router.push('/');
  } catch (err) {
    console.error('Błąd dodawania restauracji:', err.response?.data || err);
    message.value = err.response?.data?.message || 'Nie udało się dodać restauracji.';
    messageType.value = 'error';
  }
};
</script>

<!-- frontend/src/components/RestaurantList.vue -->
<template>
  <div class="restaurant-list-container">
    <h1>Restauracje</h1>

    <div class="filter-sort-bar">
      <input v-model="searchQuery" @input="fetchRestaurants" placeholder="Szukaj po nazwie..." class="filter-input">
      <input v-model="menuTypeFilter" @input="fetchRestaurants" placeholder="Filtruj po menu..." class="filter-input">
      <input v-model="nearFilter" @input="fetchRestaurants" placeholder="Filtruj po lokalizacji..." class="filter-input">
      <select v-model="sortBy" @change="fetchRestaurants" class="filter-select">
        <option value="name">Sortuj po nazwie</option>
        <option value="average_rating">Sortuj po ocenie</option>
      </select>
    </div>

    <div v-if="loading" class="loading-message">Ładowanie restauracji...</div>
    <div v-if="error" class="error-message">Błąd: {{ error }}</div>

    <ul class="restaurant-cards-grid" v-if="restaurants.length">
      <li v-for="restaurant in restaurants" :key="restaurant.id" class="restaurant-card">
        <router-link :to="{ name: 'RestaurantDetail', params: { id: restaurant.id }}" class="card-link">
          <h2>{{ restaurant.name }}</h2>
          <p>{{ restaurant.address }}</p>
          <p v-if="restaurant.menu_types">Menu: {{ restaurant.menu_types }}</p>
          <img v-if="restaurant.photo_url" :src="restaurant.photo_url" alt="Zdjęcie restauracji" class="restaurant-photo">
          <div class="rating-info">
            Średnia ocena: {{ restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'Brak' }} ({{ restaurant.review_count || 0 }} opinii)
          </div>
        </router-link>
      </li>
    </ul>
    <div v-else-if="!loading" class="no-restaurants-message">Brak restauracji do wyświetlenia.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const restaurants = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const menuTypeFilter = ref('');
const nearFilter = ref('');
const sortBy = ref('name');

const fetchRestaurants = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      search: searchQuery.value,
      menu_type: menuTypeFilter.value,
      near: nearFilter.value,
      sort_by: sortBy.value,
    };
    const response = await axios.get('/restaurants', { params });
    restaurants.value = response.data.data;
  } catch (err) {
    console.error("Błąd podczas pobierania restauracji:", err);
    error.value = 'Nie udało się pobrać restauracji.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRestaurants);
</script>

<style scoped>
.restaurant-list-container {
  padding: 20px;
}

.filter-sort-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.filter-input, .filter-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
  min-width: 150px;
}

.loading-message, .error-message, .no-restaurants-message {
  text-align: center;
  margin-top: 20px;
  font-size: 1.1em;
}
.error-message {
  color: red;
}

.restaurant-cards-grid {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.restaurant-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out;
}

.restaurant-card:hover {
  transform: translateY(-5px);
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
  padding: 15px;
}

.restaurant-card h2 {
  font-size: 1.5em;
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}

.restaurant-card p {
  font-size: 0.95em;
  color: #666;
  margin-bottom: 5px;
}

.restaurant-photo {
  max-width: 100%;
  height: 180px;
  object-fit: cover;
  margin-top: 10px;
  border-radius: 4px;
}

.rating-info {
  font-size: 0.9em;
  color: #007bff;
  margin-top: 10px;
  font-weight: bold;
}
</style>

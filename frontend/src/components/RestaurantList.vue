<template>
  <div class="restaurant-list-container">
    <h1>Restauracje</h1>


    <div class="filter-sort-bar">

      <input v-model="searchQuery" @input="fetchRestaurants" placeholder="Szukaj po nazwie..." class="filter-input">
      <input v-model="menuTypeFilter" @input="fetchRestaurants" placeholder="Filtruj po menu..." class="filter-input">
      <select v-model="sortBy" @change="fetchRestaurants" class="filter-select">
        <option value="name">Sortuj po nazwie</option>
        <option value="average_rating">Sortuj po ocenie</option>
      </select>

      <input 
        v-model="locationQuery" 
        @input="handleManualLocationInput" 
        placeholder="Wpisz miasto..." 
        class="filter-input location-input"
      >
      
      <button @click="toggleGeoFilter" :class="['btn-location', {'active': isGeoFilterActive}]" title="Filtruj restauracje w oparciu o Twoją lokalizację">
        <span v-if="!isGeoFilterActive">Znajdź blisko mnie</span>
        <span v-else>Pokaż wszystkie</span>
      </button>

      
    </div>

    <div v-if="locationStatus" class="location-status">{{ locationStatus }}</div>

    <div v-if="loading" class="loading-message">Ładowanie restauracji...</div>
    <div v-if="error" class="error-message">Błąd: {{ error }}</div>

    <ul class="restaurant-cards-grid" v-if="restaurants.length">
      <li v-for="restaurant in restaurants" :key="restaurant.id" class="restaurant-card">
        <router-link :to="{ name: 'RestaurantDetail', params: { id: restaurant.id }}" class="card-link">
          <img :src="restaurant.photo_url || '/src/assets/default-restaurant.png'" alt="Zdjęcie restauracji" class="restaurant-photo">
          <div class="card-content">
            <h2>{{ restaurant.name }}</h2>
            <p>{{ restaurant.address }}</p>
            <p v-if="restaurant.menu_types">Menu: {{ restaurant.menu_types }}</p>
            <div class="rating-info">
              Średnia ocena: {{ restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'Brak' }} ({{ restaurant.review_count || 0 }} opinii)
            </div>
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
const sortBy = ref('name');

const locationQuery = ref(''); 
const isGeoFilterActive = ref(false); 
const locationStatus = ref('');

const fetchRestaurants = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      search: searchQuery.value,
      menu_type: menuTypeFilter.value,
      near: locationQuery.value,
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


const handleManualLocationInput = () => {
  isGeoFilterActive.value = false;
  locationStatus.value = locationQuery.value ? `Filtrowanie ręczne: ${locationQuery.value}` : '';
  fetchRestaurants();
};

const toggleGeoFilter = () => {
  if (isGeoFilterActive.value) {
    isGeoFilterActive.value = false;
    locationQuery.value = ''; 
    locationStatus.value = 'Wyłączono filtr lokalizacji.';
    fetchRestaurants();
  } else {
    findAndFilterByLocation();
  }
};
const findAndFilterByLocation = () => {
  if (!navigator.geolocation) {
    locationStatus.value = 'Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.';
    return;
  }

  locationStatus.value = 'Pobieranie Twojej lokalizacji...';

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      locationStatus.value = 'Zamieniam współrzędne na nazwę miasta...';
      try {
        const reverseGeoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await axios.get(reverseGeoUrl);
        const city = response.data.address.city || response.data.address.town || response.data.address.village;
        
        let foundCity = 'Poznań'; // Domyślna wartość
        if (city) {
          foundCity = city;
          locationStatus.value = `Znaleziono lokalizację: ${city}. Filtrowanie...`;
        } else {
          locationStatus.value = 'Nie udało się zidentyfikować miasta. Ustawiono domyślną lokalizację: Poznań';
        }
        
        isGeoFilterActive.value = true; 
        locationQuery.value = foundCity;
        fetchRestaurants(); 
      } catch (err) {
        handleLocationError('Błąd pobierania nazwy miasta.');
      }
    },
    (error) => {
      handleLocationError(`Odmówiono dostępu do lokalizacji.`);
    }
  );
};


const handleLocationError = (message) => {
  console.error(message);
  isGeoFilterActive.value = true;
  locationQuery.value = 'Poznań';
  locationStatus.value = `${message} Ustawiono domyślną lokalizację: Poznań`;
  fetchRestaurants();
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
  margin-bottom: 10px;
  align-items: stretch;
}

.filter-input, .filter-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
  min-width: 150px;
}

.location-input {
  max-width: 200px;
}

.btn-location {
  background-color: #007bff;
  color: white;
  padding: 8px 12px;
  border: 1px solid #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-size: 0.9em;
  white-space: nowrap;
}

.btn-location:hover {
  background-color: #0056b3;
}

.btn-location.active {
  background-color: #dc3545; 
  border-color: #dc3545;
}

.btn-location.active:hover {
  background-color: #c82333;
}

.location-status {
  margin-bottom: 20px;
  padding: 10px;
  background-color: #e9f7ef;
  border-left: 4px solid #28a745;
  color: #155724;
  font-size: 0.9em;
  border-radius: 4px;
}

.loading-message, .error-message, .no-restaurants-message {
  text-align: center;
  margin-top: 20px;
  font-size: 1.1em;
}
.error-message{color:red}.restaurant-cards-grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}.restaurant-card{border:1px solid #ddd;border-radius:8px;overflow:hidden;box-shadow:0 2px 5px rgba(0,0,0,.1);transition:transform .2s ease-in-out;display:flex;flex-direction:column}.restaurant-card:hover{transform:translateY(-5px)}.card-link{text-decoration:none;color:inherit;display:flex;flex-direction:column;height:100%}.restaurant-photo{width:100%;height:180px;object-fit:cover}.card-content{padding:15px;flex-grow:1;display:flex;flex-direction:column}.card-content h2{font-size:1.5em;margin-top:0;margin-bottom:10px;color:#333}.card-content p{font-size:.95em;color:#666;margin-bottom:5px}.rating-info{font-size:.9em;color:#007bff;margin-top:auto;padding-top:10px;font-weight:700}
</style>

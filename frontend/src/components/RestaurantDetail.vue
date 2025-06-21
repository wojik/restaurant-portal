<!-- frontend/src/components/RestaurantDetail.vue -->
<template>
  <div v-if="loading" class="loading-message">Ładowanie szczegółów restauracji...</div>
  <div v-if="error" class="error-message">Błąd: {{ error }}</div>

  <div v-if="restaurant" class="restaurant-detail-card">
    <h1>{{ restaurant.name }}</h1>
    <p><strong>Adres:</strong> {{ restaurant.address }}</p>
    <p v-if="restaurant.position"><strong>Lokalizacja:</strong> {{ restaurant.position }}</p>
    <p v-if="restaurant.menu_types"><strong>Rodzaje menu:</strong> {{ restaurant.menu_types }}</p>
    <p v-if="restaurant.description"><strong>Opis:</strong> {{ restaurant.description }}</p>
    <img v-if="restaurant.photo_url" :src="restaurant.photo_url" alt="Zdjęcie restauracji" class="detail-photo">
    
    <div class="rating-summary">
      Średnia ocena: {{ restaurant.average_rating ? restaurant.average_rating.toFixed(1) : 'Brak ocen' }}
      ({{ restaurant.review_count || 0 }} opinii)
    </div>

    <template v-if="authState.isLoggedIn && restaurant.owner_id === authState.currentUserId">
        <button @click="deleteRestaurant" class="delete-btn">Usuń tę restaurację</button>
    </template>

    <hr>

    <h2>Komentarze i Oceny:</h2>
    <div v-if="authState.isLoggedIn" class="review-form-section">
      <h3>{{ editingReview ? 'Edytuj swoją opinię' : 'Dodaj swoją opinię' }}</h3>
      <ReviewForm 
        :restaurant-id="restaurant.id"
        :initial-rating="editingReview ? currentReview.rating : null"
        :initial-comment="editingReview ? currentReview.comment : ''"
        :review-id="editingReview ? currentReview.id : null"
        @review-submitted="fetchRestaurantDetails"
        @cancel-edit="cancelEdit"
      />
    </div>
    <p v-else class="login-prompt">Zaloguj się, aby dodać lub edytować opinię.</p>

    <ul class="reviews-list" v-if="restaurant.reviews && restaurant.reviews.length">
      <li v-for="review in restaurant.reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <strong>{{ review.user_username }}</strong>
          <span class="review-rating">Ocena: {{ review.rating }}/5</span>
        </div>
        <p v-if="review.comment" class="review-comment">{{ review.comment }}</p>
        <p class="review-date"><small>{{ new Date(review.created_at).toLocaleDateString() }}</small></p>
        
        <div class="review-actions" v-if="authState.isLoggedIn && review.user_id === authState.currentUserId">
          <button @click="startEdit(review)" class="action-btn edit-btn">Edytuj</button>
          <button @click="deleteReview(review.id)" class="action-btn delete-btn">Usuń</button>
        </div>
      </li>
    </ul>
    <p v-else>Brak komentarzy dla tej restauracji.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import ReviewForm from './ReviewForm.vue'; // Importuj komponent formularza
import { authState } from '../utils/auth';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const restaurant = ref(null);
const loading = ref(false);
const error = ref(null);
const editingReview = ref(false); // Flaga, czy edytujemy opinię
const currentReview = ref(null); // Obiekt edytowanej opinii

const router = useRouter();

const fetchRestaurantDetails = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`/restaurants/${props.id}`);
    console.log("Dane otrzymane z backendu:", response.data.data); 
    restaurant.value = response.data.data;
    
    // Sprawdź, czy zalogowany użytkownik ma już opinię i przygotuj formularz do edycji
    if (authState.isLoggedIn) {
        const userReview = restaurant.value.reviews.find(r => r.user_id === authState.currentUserId);
        if (userReview) {
            editingReview.value = true;
            currentReview.value = userReview;
        } else {
            editingReview.value = false;
            currentReview.value = null;
        }
    } else {
        editingReview.value = false;
        currentReview.value = null;
    }
  } catch (err) {
    console.error("Błąd podczas pobierania szczegółów restauracji:", err);
    error.value = 'Nie udało się pobrać szczegółów restauracji.';
    restaurant.value = null;
  } finally {
    loading.value = false;
  }
};

const deleteRestaurant = async () => {
    if (confirm('Czy na pewno chcesz usunąć tę restaurację? Usunięte zostaną również wszystkie jej opinie.')) {
        try {
            await axios.delete(`/restaurants/${props.id}`);
            alert('Restauracja usunięta pomyślnie!');
            router.push('/'); // Przekieruj na listę restauracji
        } catch (err) {
            console.error('Błąd usuwania restauracji:', err);
            alert('Nie udało się usunąć restauracji: ' + (err.response?.data?.message || err.message));
        }
    }
};

const startEdit = (review) => {
    editingReview.value = true;
    currentReview.value = review;
};

const cancelEdit = () => {
    editingReview.value = false;
    currentReview.value = null;
};

const deleteReview = async (reviewId) => {
    if (confirm('Czy na pewno chcesz usunąć tę opinię?')) {
        try {
            await axios.delete(`/reviews/${reviewId}`);
            alert('Opinia usunięta pomyślnie!');
            fetchRestaurantDetails(); // Odśwież dane
        } catch (err) {
            console.error('Błąd usuwania opinii:', err);
            alert('Nie udało się usunąć opinii: ' + (err.response?.data?.message || err.message));
        }
    }
};

onMounted(fetchRestaurantDetails);
watch(() => props.id, fetchRestaurantDetails); // Odśwież dane, jeśli zmieni się ID w URL
</script>

<style scoped>
.restaurant-detail-card {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  max-width: 800px;
  margin: 20px auto;
}

.restaurant-detail-card h1 {
  color: #333;
  margin-bottom: 10px;
}

.restaurant-detail-card p {
  color: #555;
  line-height: 1.6;
}

.detail-photo {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 15px;
  margin-bottom: 15px;
}

.rating-summary {
    font-size: 1.1em;
    font-weight: bold;
    color: #007bff;
    margin-top: 15px;
    padding-top: 10px;
    border-top: 1px solid #eee;
}

hr {
  margin: 30px 0;
  border: none;
  border-top: 1px solid #eee;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

.review-form-section {
    margin-bottom: 30px;
    padding: 15px;
    background-color: #f8f8f8;
    border-radius: 8px;
}
.login-prompt {
    text-align: center;
    color: #888;
    margin-top: 20px;
    font-style: italic;
}
.reviews-list {
  list-style: none;
  padding: 0;
}

.review-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.review-rating {
  font-weight: bold;
  color: #28a745;
}

.review-comment {
  color: #444;
  margin-bottom: 5px;
}

.review-date {
  font-size: 0.85em;
  color: #999;
  text-align: right;
}

.delete-btn {
    background-color: #dc3545;
    color: white;
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-top: 15px;
}
.delete-btn:hover {
    background-color: #c82333;
}

.review-actions {
    margin-top: 10px;
    text-align: right;
}

.action-btn {
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85em;
    margin-left: 5px;
    transition: background-color 0.2s ease;
}

.action-btn.edit-btn {
    background-color: #ffc107;
    color: #333;
}

.action-btn.edit-btn:hover {
    background-color: #e0a800;
}

.action-btn.delete-btn {
    background-color: #dc3545;
}

.action-btn.delete-btn:hover {
    background-color: #c82333;
}
</style>

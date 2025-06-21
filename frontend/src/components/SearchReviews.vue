<!-- frontend/src/components/SearchReviews.vue -->
<template>
  <div class="search-reviews-container">
    <h1>Wyszukaj Komentarze</h1>
    <div class="search-bar">
      <input type="text" v-model="searchQuery" placeholder="Wpisz frazę do wyszukania w komentarzach..." class="search-input">
      <button @click="searchReviews" class="btn-primary">Szukaj</button>
    </div>

    <div v-if="loading" class="loading-message">Wyszukiwanie komentarzy...</div>
    <div v-if="error" class="error-message">Błąd: {{ error }}</div>

    <ul class="reviews-list" v-if="reviews.length">
      <li v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <strong>{{ review.user_username }}</strong> ({{ review.restaurant_name }})
          <span class="review-rating">Ocena: {{ review.rating }}/5</span>
        </div>
        <p class="review-comment">{{ review.comment }}</p>
        <p class="review-date"><small>{{ new Date(review.created_at).toLocaleDateString() }}</small></p>
      </li>
    </ul>
    <div v-else-if="!loading && searchPerformed" class="no-results-message">Brak komentarzy pasujących do zapytania.</div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const searchQuery = ref('');
const reviews = ref([]);
const loading = ref(false);
const error = ref(null);
const searchPerformed = ref(false); // Flaga, czy wyszukiwanie zostało już wykonane

const searchReviews = async () => {
  if (!searchQuery.value.trim()) {
    reviews.value = [];
    searchPerformed.value = true;
    return;
  }

  loading.value = true;
  error.value = null;
  searchPerformed.value = true;
  try {
    const response = await axios.get('/reviews/search', { params: { query: searchQuery.value } });
    reviews.value = response.data.data;
  } catch (err) {
    console.error("Błąd podczas wyszukiwania komentarzy:", err);
    error.value = 'Nie udało się wyszukać komentarzy.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.search-reviews-container {
  padding: 20px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.loading-message, .error-message, .no-results-message {
  text-align: center;
  margin-top: 20px;
  font-size: 1.1em;
}
.error-message {
  color: red;
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
  flex-wrap: wrap;
}

.review-header strong {
    margin-right: 5px;
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
</style>

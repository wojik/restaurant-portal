<!-- frontend/src/components/ReviewForm.vue -->
<template>
  <form @submit.prevent="submitReview" class="review-form">
    <div class="form-group">
      <label for="rating">Ocena (1-5):</label>
      <input type="number" id="rating" v-model.number="formRating" min="1" max="5" required class="form-input">
    </div>
    <div class="form-group">
      <label for="comment">Komentarz (opcjonalnie):</label>
      <textarea id="comment" v-model="formComment" rows="4" class="form-textarea"></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn-primary">{{ reviewId ? 'Zapisz zmiany' : 'Dodaj opinię' }}</button>
      <button v-if="reviewId" type="button" @click="cancelEdit" class="btn-secondary">Anuluj</button>
    </div>
    <p v-if="message" :class="['message', messageType]">{{ message }}</p>
  </form>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';

const props = defineProps({
  restaurantId: {
    type: Number,
    required: true
  },
  initialRating: {
    type: Number,
    default: null
  },
  initialComment: {
    type: String,
    default: ''
  },
  reviewId: { // Jeśli edytujemy, to jest ID istniejącej recenzji
    type: Number,
    default: null
  }
});

const emit = defineEmits(['review-submitted', 'cancel-edit']);

const formRating = ref(props.initialRating);
const formComment = ref(props.initialComment);
const message = ref('');
const messageType = ref('');

// Watch for changes in initial props to update form fields when editing starts/stops
watch(() => props.initialRating, (newVal) => {
  formRating.value = newVal;
});
watch(() => props.initialComment, (newVal) => {
  formComment.value = newVal;
});

const submitReview = async () => {
  message.value = '';
  messageType.value = '';
  try {
    if (props.reviewId) {
      // Edycja istniejącej opinii
      await axios.post(`/restaurants/${props.restaurantId}/reviews`, {
        rating: formRating.value,
        comment: formComment.value,
      });
      message.value = 'Opinia zaktualizowana pomyślnie!';
      messageType.value = 'message-success';
      emit('review-submitted'); // Poinformuj rodzica, że opinia została zaktualizowana
      // Resetuj formularz po edycji
      formRating.value = null;
      formComment.value = '';
      emit('cancel-edit'); // Wróć do stanu "dodawania"
    } else {
      // Dodawanie nowej opinii
      await axios.post(`/restaurants/${props.restaurantId}/reviews`, {
        rating: formRating.value,
        comment: formComment.value,
      });
      message.value = 'Opinia dodana pomyślnie!';
      messageType.value = 'message-success';
      emit('review-submitted'); // Poinformuj rodzica, że opinia została dodana
      // Resetuj formularz po dodaniu
      formRating.value = null;
      formComment.value = '';
    }
  } catch (err) {
    console.error("Błąd podczas dodawania/edycji opinii:", err.response?.data || err);
    message.value = 'Nie udało się dodać/edytować opinii: ' + (err.response?.data?.message || err.message);
    messageType.value = 'message-error';
  }
};

const cancelEdit = () => {
    emit('cancel-edit');
    message.value = '';
    messageType.value = '';
};
</script>

<style scoped>
.review-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; /* Ensures padding doesn't affect width */
  font-size: 1em;
}

.form-input:focus, .form-textarea:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 0.2rem rgba(0,123,255,.25);
}

.form-textarea {
  resize: vertical; /* Allow vertical resizing */
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end; /* Przesuwa przyciski na prawo */
  margin-top: 20px;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s ease;
}

.btn-secondary:hover {
    background-color: #545b62;
}

.message {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
}

.message-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>

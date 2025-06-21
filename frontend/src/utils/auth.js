// frontend/src/utils/auth.js
import { reactive, watch } from 'vue';

// Stan autoryzacji jako reaktywny obiekt
export const authState = reactive({
  isLoggedIn: !!localStorage.getItem('authToken'),
  currentUserId: localStorage.getItem('authToken') ? parseInt(localStorage.getItem('authToken')) : null,
  currentUsername: localStorage.getItem('username') || null,
});

// Funkcja do logowania
export function login(token, username) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('username', username);
  authState.isLoggedIn = true;
  authState.currentUserId = parseInt(token);
  authState.currentUsername = username;
}

// Funkcja do wylogowania
export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('username');
  authState.isLoggedIn = false;
  authState.currentUserId = null;
  authState.currentUsername = null;
}

// Możesz dodać watchery, aby reagować na zmiany localStorage
// lub polegać na ręcznym wywołaniu login/logout.
// Dla tej prostej aplikacji, ręczne wywołania są wystarczające.

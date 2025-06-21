<!-- frontend/src/App.vue -->
<template>
  <div id="app">
    <nav class="main-nav">
      <router-link to="/" class="nav-item">Restauracje</router-link>
      <template v-if="!authState.isLoggedIn">
        <router-link to="/login" class="nav-item">Zaloguj</router-link>
        <router-link to="/register" class="nav-item">Zarejestruj</router-link>
      </template>
      <template v-else>
        <router-link to="/add-restaurant" class="nav-item">Dodaj Restaurację</router-link>
        <router-link to="/search-reviews" class="nav-item">Szukaj Komentarzy</router-link>
        <span class="nav-item">Witaj, {{ authState.currentUsername }}!</span>
        <button @click="handleLogout" class="nav-item logout-btn">Wyloguj</button>
      </template>
    </nav>
    <router-view class="main-content"></router-view>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { authState, logout } from './utils/auth';

const router = useRouter();

const handleLogout = () => {
  logout();
  router.push('/login'); // Przekieruj na stronę logowania po wylogowaniu
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background-color: #f4f4f4;
}
#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  min-height: 100vh;
}
.main-nav {
  background-color: #333;
  padding: 10px 20px;
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}
.nav-item {
  color: #fff;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}
.nav-item:hover, .nav-item.router-link-active {
  background-color: #555;
}
.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 1em;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
  margin-left: auto; /* Przesuwa przycisk w prawo */
}
.logout-btn:hover {
  background-color: #c82333;
}
.main-content {
  padding: 10px;
}
.form-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input, .form-group textarea, .form-group select {
  width: calc(100% - 20px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
.message-success {
  color: green;
  margin-top: 10px;
}
.message-error {
  color: red;
  margin-top: 10px;
}
</style>

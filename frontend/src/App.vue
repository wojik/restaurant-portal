<template>
  <div id="app">
    <!-- NOWY, ZINTEGROWANY NAGŁÓWEK -->
    <header class="app-header">
      <div class="header-brand">
        <img src="/src/assets/logo.png" alt="Logo Portalu Restauracji" class="app-logo" />
        <h1>Portal Restauracji</h1>
      </div>
      
      <!-- Twoja istniejąca nawigacja, teraz wewnątrz nagłówka -->
      <nav class="main-nav">
        <router-link to="/" class="nav-item">Restauracje</router-link>
        <template v-if="!authState.isLoggedIn">
          <router-link to="/login" class="nav-item">Zaloguj</router-link>
          <router-link to="/register" class="nav-item">Zarejestruj</router-link>
        </template>
        <template v-else>
          <router-link to="/add-restaurant" class="nav-item">Dodaj Restaurację</router-link>
          <router-link to="/search-reviews" class="nav-item">Szukaj Komentarzy</router-link>
          <span class="nav-item welcome-message">Witaj, {{ authState.currentUsername }}!</span>
          <button @click="handleLogout" class="nav-item logout-btn">Wyloguj</button>
        </template>
      </nav>
    </header>

    <!-- Główna zawartość strony, renderowana przez router -->
    <main class="main-content">
      <router-view></router-view>
    </main>
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
/* Globalne style dla całej aplikacji */
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  margin: 0;
  background-color: #f4f4f9;
  color: #333;
}

#app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px 20px;
}

/* Style dla nowego nagłówka */
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap; /* Pozwala na zawijanie na mniejszych ekranach */
  padding: 15px 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 0px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 15px;
}

.app-logo {
  width: 45px;
  height: 45px;
  object-fit: contain;
}

.app-header h1 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Style dla nawigacji wewnątrz nagłówka */
.main-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 7px 7px 2px 2px;
}

.nav-item {
  color: #555;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-item:hover, .router-link-active {
  background-color: #f0f0f0;
  color: #007bff;
}

.welcome-message {
  color: #333;
  font-weight: bold;
  margin-right: 10px;
}

.logout-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
}

.logout-btn:hover {
  background-color: #c82333;
}

.main-content {
  padding: 10 10px;
}

.form-container {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
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
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box; 
}
.btn-primary {
  background-color: #007bff;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  width: 100%;
  transition: background-color 0.3s ease;
}
.btn-primary:hover {
  background-color: #0056b3;
}
.message-success {
  color: green;
  margin-top: 10px;
  text-align: center;
}
.message-error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>

// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import RestaurantList from '../components/RestaurantList.vue';
import RestaurantDetail from '../components/RestaurantDetail.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import AddRestaurantForm from '../components/AddRestaurantForm.vue';
import SearchReviews from '../components/SearchReviews.vue';
import { authState } from '../utils/auth';

const routes = [
  { path: '/', name: 'RestaurantList', component: RestaurantList },
  { path: '/restaurants/:id', name: 'RestaurantDetail', component: RestaurantDetail, props: true },
  { path: '/login', name: 'Login', component: LoginForm },
  { path: '/register', name: 'Register', component: RegisterForm },
  { 
    path: '/add-restaurant', 
    name: 'AddRestaurant', 
    component: AddRestaurantForm, 
    meta: { requiresAuth: true } // Ta strona wymaga logowania
  },
  {
    path: '/search-reviews',
    name: 'SearchReviews',
    component: SearchReviews,
    meta: { requiresAuth: true } // Wyszukiwanie komentarzy wymaga logowania
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Globalny strażnik nawigacji - sprawdza, czy użytkownik jest zalogowany dla chronionych ścieżek
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authState.isLoggedIn) {
    next('/login'); // Przekieruj na stronę logowania, jeśli niezalogowany
  } else {
    next(); // Kontynuuj nawigację
  }
});

export default router;

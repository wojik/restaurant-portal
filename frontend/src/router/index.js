// frontend/src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import RestaurantList from '../components/RestaurantList.vue';
import RestaurantDetail from '../components/RestaurantDetail.vue';
import LoginForm from '../components/LoginForm.vue';
import RegisterForm from '../components/RegisterForm.vue';
import AddRestaurantForm from '../components/AddRestaurantForm.vue';
import SearchReviews from '../components/SearchReviews.vue';
// --- NOWE IMPORTY ---
import ForgotPassword from '../components/ForgotPassword.vue';
import ResetPassword from '../components/ResetPassword.vue';
import { authState } from '../utils/auth';

const routes = [
  // ... istniejące ścieżki
  { path: '/', name: 'RestaurantList', component: RestaurantList },
  { path: '/restaurants/:id', name: 'RestaurantDetail', component: RestaurantDetail, props: true },
  { path: '/login', name: 'Login', component: LoginForm },
  { path: '/register', name: 'Register', component: RegisterForm },
  { path: '/add-restaurant', name: 'AddRestaurant', component: AddRestaurantForm, meta: { requiresAuth: true } },
  { path: '/search-reviews', name: 'SearchReviews', component: SearchReviews, meta: { requiresAuth: true } },

  // --- NOWE ŚCIEŻKI ---
  { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword },
  { path: '/reset-password/:token', name: 'ResetPassword', component: ResetPassword, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !authState.isLoggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router;

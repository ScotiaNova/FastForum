import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import StudentView from '../views/StudentView.vue';
import AdminView from '../views/AdminView.vue';
import PostCreateView from '../views/PostCreateView.vue';
import PostDetailView from '../views/PostDetailView.vue';
import PostEditView from '../views/PostEditView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/student',
    name: 'Student',
    component: StudentView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: '/post/create',
    name: 'PostCreate',
    component: PostCreateView,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/:id',
    name: 'PostDetail',
    component: PostDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/edit/:id',
    name: 'PostEdit',
    component: PostEditView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (to.meta.adminOnly && role !== 'admin') {
    next('/student');
  } else {
    next();
  }
});

export default router;
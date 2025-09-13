import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import StudentView from '../views/StudentView.vue'
import AdminView from '../views/AdminView.vue'
import PostCreateView from '../views/PostCreateView.vue'
import PostDetailView from '../views/PostDetailView.vue'
import PostEditView from '../views/PostEditView.vue'
import { useUserStore } from '../stores/user.js'

const routes = [
  {
    path: '/',
    name: '游客页',
    component: HomeView,
  },
  {
    path: '/login',
    name: '登录页',
    component: LoginView,
  },
  {
    path: '/student',
    name: '学生端主页',
    component: StudentView,
    meta: { requiresAuth: true },
  },
  {
    path: '/admin',
    name: '管理员主页（审批）',
    component: AdminView,
    meta: { requiresAuth: true, adminOnly: true },
  },
  {
    path: '/post/create',
    name: '发送帖子界面',
    component: PostCreateView,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/:id',
    name: '帖子详情界面',
    component: PostDetailView,
    meta: { requiresAuth: true },
  },
  {
    path: '/post/edit/:id',
    name: '帖子编辑界面',
    component: PostEditView,
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const isLoggedIn = userStore.userId > 0
  const userType = userStore.userType

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.adminOnly && userType !== 2) {
    next('/student')
  } else {
    next()
  }
})

export default router
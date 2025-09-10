import { createRouter, createWebHistory } from 'vue-router'; // 导航守卫使用到的方法
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
    path: '/:pathMatch(.*)*', // 非法路径都进入游客页
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 启用 history 模式
  routes,
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('user_id');  //本地存储
  const userType = parseInt(localStorage.getItem('user_type')); // 1 学生，2 管理员

  // console.log('判断用户类型', 'userType:', userType, '导航至', to.path); // 调试日志

  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login'); // 未登录，重定向到登录页
  } else if (to.meta.adminOnly && userType !== 2) { // 2 表示管理员
    next('/student'); // 非管理员重定向到学生页
  } else {
    next(); // 允许访问
  }
});
/* 导航守卫，检查路由元信息，确保用户身份合法 */

export default router;